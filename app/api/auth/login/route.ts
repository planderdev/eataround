import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { getPool, hasDatabaseConfig } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { encodeSessionToken } from "@/lib/session";
import type { AuthLoginPayload } from "@/types/api";

export const runtime = "nodejs";

type UserRow = RowDataPacket & {
  id: number;
  email: string;
  name: string;
  password_hash: string;
  member_type: "personal" | "company";
  role: "user" | "admin";
};

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as Partial<AuthLoginPayload>;

  if (!payload.email || !payload.password) {
    return NextResponse.json({ ok: false, message: "이메일과 비밀번호를 입력해 주세요." }, { status: 400 });
  }

  let userId = "user-preview";
  let userName = "이더라운드 회원";
  let userRole: "user" | "admin" = "user";

  if (hasDatabaseConfig()) {
    const pool = getPool();
    const [rows] = await pool.query<UserRow[]>(
      "select id, email, name, password_hash, member_type, role from users where email = ? limit 1",
      [payload.email],
    );
    const user = rows[0];

    if (!user || !verifyPassword(payload.password, user.password_hash)) {
      return NextResponse.json({ ok: false, message: "이메일 또는 비밀번호를 확인해 주세요." }, { status: 401 });
    }

    userId = String(user.id);
    userName = user.name;
    userRole = user.role;
  }

  const response = NextResponse.json({
    ok: true,
    message: "로그인되었습니다.",
    user: {
      id: userId,
      name: userName,
      email: payload.email,
      role: userRole,
    },
  });
  response.cookies.set("session", encodeSessionToken(payload.email), {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: payload.keepSignedIn ? 60 * 60 * 24 * 14 : 60 * 60 * 6,
  });

  return response;
}
