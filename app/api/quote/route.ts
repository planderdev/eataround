import { NextResponse } from "next/server";
import { getPool, hasDatabaseConfig } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const payload = (await request.json()) as {
    organizationName?: string;
    contactName?: string;
    contactPhone?: string;
    budget?: string;
    requestMemo?: string;
    programIds?: string[];
    optionIds?: string[];
    people?: number;
    startDate?: string;
    endDate?: string;
    estimatedTotal?: number;
  };

  const session = await getSessionUser(request);

  if (hasDatabaseConfig()) {
    if (!session) {
      return NextResponse.json({ ok: false, message: "기업·기관 회원으로 로그인 후 견적 요청을 보낼 수 있습니다." }, { status: 401 });
    }
    if (session.memberType !== "company") {
      return NextResponse.json({ ok: false, message: "기업·기관 회원만 견적 요청을 보낼 수 있습니다." }, { status: 403 });
    }
    if (!session.companyApproved) {
      return NextResponse.json(
        { ok: false, message: "가입 승인이 완료된 후 견적 요청을 보낼 수 있습니다. 담당자가 검토 후 안내드립니다." },
        { status: 403 },
      );
    }
  }

  if (!payload.organizationName || !payload.contactName || !payload.contactPhone) {
    return NextResponse.json({ ok: false, message: "기관명, 담당자, 연락처를 입력해 주세요." }, { status: 400 });
  }

  if (hasDatabaseConfig()) {
    const pool = getPool();
    try {
      await pool.execute(
        `insert into quote_requests
          (user_id, organization_name, contact_name, contact_phone, budget_label, people, start_date, end_date,
           program_ids, option_ids, estimated_total, request_memo, status)
         values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'requested')`,
        [
          session?.id ?? null,
          payload.organizationName ?? null,
          payload.contactName ?? null,
          payload.contactPhone ?? null,
          payload.budget ?? null,
          payload.people ?? 1,
          payload.startDate ?? null,
          payload.endDate ?? null,
          JSON.stringify(payload.programIds ?? []),
          JSON.stringify(payload.optionIds ?? []),
          payload.estimatedTotal ?? 0,
          payload.requestMemo ?? null,
        ],
      );
    } catch (error) {
      if ((error as { code?: string }).code !== "ER_BAD_FIELD_ERROR") throw error;
      await pool.execute(
        `insert into quote_requests (organization_name, people, start_date, end_date, program_ids, estimated_total, status)
         values (?, ?, ?, ?, ?, ?, 'requested')`,
        [
          payload.organizationName ?? "기관명 미입력",
          payload.people ?? 1,
          payload.startDate ?? null,
          payload.endDate ?? null,
          JSON.stringify(payload.programIds ?? []),
          payload.estimatedTotal ?? 0,
        ],
      );
    }
  }

  return NextResponse.json({
    ok: true,
    message: "견적 요청이 접수되었습니다.",
  });
}
