import { NextResponse } from "next/server";
import type { AuthLoginPayload } from "@/types/api";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as Partial<AuthLoginPayload>;

  if (!payload.email || !payload.password) {
    return NextResponse.json({ ok: false, message: "관리자 이메일과 비밀번호를 입력해 주세요." }, { status: 400 });
  }

  const response = NextResponse.json({
    ok: true,
    message: "관리자 로그인에 성공했습니다.",
    user: {
      id: "admin-preview",
      name: "이더라운드 운영자",
      email: payload.email,
      role: "admin",
    },
  });
  response.cookies.set("session", "mock-admin-session", {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: payload.keepSignedIn ? 60 * 60 * 24 * 14 : 60 * 60 * 8,
  });

  return response;
}
