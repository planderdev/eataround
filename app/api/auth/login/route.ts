import { NextResponse } from "next/server";
import type { AuthLoginPayload } from "@/types/api";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as Partial<AuthLoginPayload>;

  if (!payload.email || !payload.password) {
    return NextResponse.json({ ok: false, message: "이메일과 비밀번호를 입력해 주세요." }, { status: 400 });
  }

  const response = NextResponse.json({
    ok: true,
    message: "로그인되었습니다.",
    user: {
      id: "user-preview",
      name: "이더라운드 회원",
      email: payload.email,
      role: "user",
    },
  });
  response.cookies.set("session", "mock-user-session", {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: payload.keepSignedIn ? 60 * 60 * 24 * 14 : 60 * 60 * 6,
  });

  return response;
}
