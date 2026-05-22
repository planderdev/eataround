import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as {
    currentPassword?: string;
    nextPassword?: string;
  };

  if (!payload.currentPassword || !payload.nextPassword || payload.nextPassword.length < 10) {
    return NextResponse.json({ ok: false, message: "현재 비밀번호와 10자 이상의 새 비밀번호를 입력해 주세요." }, { status: 400 });
  }

  return NextResponse.json({ ok: true, message: "비밀번호가 변경되었습니다." });
}
