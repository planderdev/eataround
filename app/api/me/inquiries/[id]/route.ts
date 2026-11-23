import { NextResponse } from "next/server";
import { hasDatabaseConfig } from "@/lib/db";
import { findMyInquiry, parseInquiryId } from "@/lib/me/inquiries";
import { inquiryHistory } from "@/lib/mypage-data";
import { getSessionUser } from "@/lib/session";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function notFound() {
  return NextResponse.json({ ok: false, message: "문의 내역을 찾을 수 없습니다." }, { status: 404 });
}

export async function GET(request: Request, { params }: RouteContext) {
  const { id } = await params;

  if (!hasDatabaseConfig()) {
    const sample = inquiryHistory.find((inquiry) => inquiry.id === decodeURIComponent(id));
    return sample ? NextResponse.json(sample) : notFound();
  }

  const session = await getSessionUser(request);
  if (!session) return NextResponse.json({ ok: false, message: "로그인이 필요합니다." }, { status: 401 });

  const inquiryId = parseInquiryId(id);
  if (!inquiryId) return notFound();
  const inquiry = await findMyInquiry(session.id, inquiryId);
  return inquiry ? NextResponse.json(inquiry) : notFound();
}
