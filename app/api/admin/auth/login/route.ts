import { NextResponse } from "next/server";
import type { RowDataPacket } from "@/lib/db";
import { getPool, hasDatabaseConfig } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { SESSION_COOKIE } from "@/lib/session";
import { createSessionToken, isSessionSigningReady } from "@/lib/session-token";
import type { AuthLoginPayload } from "@/types/api";

export const runtime = "nodejs";

type AdminRow = RowDataPacket & {
  id: number;
  name: string;
  password_hash: string;
  role: "user" | "admin";
};

// 관리자 세션은 일반 회원보다 짧게 유지한다.
const ADMIN_SESSION_SECONDS = 60 * 60 * 8;
const ADMIN_REMEMBER_SECONDS = 60 * 60 * 24 * 7;

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as Partial<AuthLoginPayload>;

  if (!payload.email || !payload.password) {
    return NextResponse.json({ ok: false, message: "관리자 이메일과 비밀번호를 입력해 주세요." }, { status: 400 });
  }

  if (!isSessionSigningReady()) {
    console.error("SESSION_SECRET is missing or shorter than 32 characters. Admin login is disabled.");
    return NextResponse.json({ ok: false, message: "로그인을 일시적으로 사용할 수 없습니다." }, { status: 503 });
  }

  let userId = "admin-preview";
  let userName = "이더라운드 운영자";

  // DB가 연결된 환경에서는 users.role = 'admin' 계정만 통과시킨다.
  // DB가 없는 샘플 모드에서는 실제 데이터가 없으므로 화면 확인용으로 통과시킨다.
  if (hasDatabaseConfig()) {
    const pool = getPool();
    const [rows] = await pool.query<AdminRow[]>(
      "select id, name, password_hash, role from users where email = ? limit 1",
      [payload.email],
    );
    const user = rows[0];

    if (!user || !verifyPassword(payload.password, user.password_hash) || user.role !== "admin") {
      return NextResponse.json({ ok: false, message: "이메일 또는 비밀번호를 확인해 주세요." }, { status: 401 });
    }

    userId = String(user.id);
    userName = user.name;
  }

  const maxAge = payload.keepSignedIn ? ADMIN_REMEMBER_SECONDS : ADMIN_SESSION_SECONDS;
  const response = NextResponse.json({
    ok: true,
    message: "관리자 로그인에 성공했습니다.",
    user: { id: userId, name: userName, email: payload.email, role: "admin" },
  });
  response.cookies.set(SESSION_COOKIE, createSessionToken(payload.email, maxAge, "admin"), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
    maxAge,
  });

  return response;
}
