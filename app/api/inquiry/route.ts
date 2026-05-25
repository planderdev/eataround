import { NextResponse } from "next/server";
import { getPool, hasDatabaseConfig } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import type { InquiryPayload } from "@/types/api";

export const runtime = "nodejs";

const ALLOWED_TYPES = ["product", "event", "package", "general"] as const;

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as Partial<InquiryPayload>;

  if (!payload.name || !payload.phone || !payload.message) {
    return NextResponse.json({ ok: false, message: "이름, 연락처, 문의 내용을 입력해 주세요." }, { status: 400 });
  }

  const inquiryType = ALLOWED_TYPES.includes(payload.inquiryType as (typeof ALLOWED_TYPES)[number])
    ? (payload.inquiryType as (typeof ALLOWED_TYPES)[number])
    : "general";
  const session = await getSessionUser(request);
  const title = payload.productSlug ? `[${payload.productSlug}] ${payload.name}님의 문의` : `${payload.name}님의 문의`;
  const body = [
    `연락처: ${payload.phone}`,
    payload.preferredDate ? `희망일정: ${payload.preferredDate}` : null,
    typeof payload.people === "number" ? `인원: ${payload.people}명` : null,
    payload.productSlug ? `상품: ${payload.productSlug}` : null,
    "",
    payload.message,
  ]
    .filter(Boolean)
    .join("\n");

  if (hasDatabaseConfig()) {
    const pool = getPool();
    try {
      await pool.execute(
        `insert into inquiries (user_id, inquiry_type, title, body, status)
         values (?, ?, ?, ?, 'open')`,
        [session?.id ?? null, inquiryType, title, body],
      );
    } catch (error) {
      if ((error as { code?: string }).code !== "ER_BAD_FIELD_ERROR") throw error;
    }
  }

  return NextResponse.json({
    ok: true,
    message: "문의가 접수되었습니다.",
    data: payload,
  });
}
