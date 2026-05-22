import { NextResponse } from "next/server";
import type { InquiryPayload } from "@/types/api";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as Partial<InquiryPayload>;

  if (!payload.name || !payload.phone || !payload.message) {
    return NextResponse.json({ ok: false, message: "이름, 연락처, 문의 내용을 입력해 주세요." }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    message: "문의가 접수되었습니다.",
    data: payload,
  });
}
