import { NextResponse } from "next/server";
import { hasDatabaseConfig } from "@/lib/db";
import { listMyInquiries } from "@/lib/me/inquiries";
import { inquiryHistory } from "@/lib/mypage-data";
import { getSessionUser } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!hasDatabaseConfig()) return NextResponse.json(inquiryHistory);

  const session = await getSessionUser(request);
  if (!session) return NextResponse.json({ ok: false, message: "로그인이 필요합니다." }, { status: 401 });
  return NextResponse.json(await listMyInquiries(session.id));
}
