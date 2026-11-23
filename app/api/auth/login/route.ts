import { NextResponse } from "next/server";
import { hasDatabaseConfig } from "@/lib/db";
import { checkLogin } from "@/lib/login-guard";
import { SESSION_COOKIE } from "@/lib/session";
import { createSessionToken, isSessionSigningReady } from "@/lib/session-token";
import type { AuthLoginPayload } from "@/types/api";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as Partial<AuthLoginPayload>;

  if (!payload.email || !payload.password) {
    return NextResponse.json({ ok: false, message: "이메일과 비밀번호를 입력해 주세요." }, { status: 400 });
  }

  if (!isSessionSigningReady()) {
    console.error("SESSION_SECRET is missing or shorter than 32 characters. Login is disabled.");
    return NextResponse.json({ ok: false, message: "로그인을 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해 주세요." }, { status: 503 });
  }

  let userId = "user-preview";
  let userName = "이더라운드 회원";
  let userRole: "user" | "admin" = "user";

  if (hasDatabaseConfig()) {
    const result = await checkLogin(request, payload.email, payload.password);
    if (!result.ok) return NextResponse.json({ ok: false, message: result.message }, { status: result.status });
    const user = result.user;

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
  const maxAge = payload.keepSignedIn ? 60 * 60 * 24 * 14 : 60 * 60 * 6;
  response.cookies.set(SESSION_COOKIE, createSessionToken(payload.email, maxAge, userRole), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
    maxAge,
  });

  return response;
}
