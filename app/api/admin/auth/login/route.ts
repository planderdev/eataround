import { NextResponse } from "next/server";
import { hasDatabaseConfig } from "@/lib/db";
import { checkLogin } from "@/lib/login-guard";
import { SESSION_COOKIE } from "@/lib/session";
import { createSessionToken, isSessionSigningReady } from "@/lib/session-token";
import type { AuthLoginPayload } from "@/types/api";

export const runtime = "nodejs";

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
    // 비밀번호를 5번 연속 틀리면 30분 동안 잠근다(회원 로그인과 같은 규칙).
    const result = await checkLogin(payload.email, payload.password, (user) => user.role === "admin");
    if (!result.ok) return NextResponse.json({ ok: false, message: result.message }, { status: result.status });
    const user = result.user;

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
