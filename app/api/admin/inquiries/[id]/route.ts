import { NextResponse } from "next/server";
import { adminOk } from "@/lib/admin/api-data";
import { adminError, parseRowId, requireAdmin } from "@/lib/admin/guard";
import { getPool, hasDatabaseConfig } from "@/lib/db";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const STATUSES = ["open", "answered", "closed"] as const;
const ANSWER_MAX_LENGTH = 2000;

/**
 * 문의 답변·상태 저장. 답변을 저장하면 상태를 따로 주지 않는 한 '답변 완료'로 바꾼다.
 * 고객은 마이페이지 문의 내역에서 답변을 본다(메일 발송은 아직 없음).
 */
export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const payload = ((await request.json().catch(() => ({}))) ?? {}) as { status?: string; answer?: string | null };

  if (!hasDatabaseConfig()) {
    return NextResponse.json(adminOk("문의 답변을 저장했습니다.", { id: decodeURIComponent(id), payload }));
  }

  const denied = await requireAdmin(request);
  if (denied) return denied;

  const inquiryId = parseRowId(id);
  if (!inquiryId) return adminError("문의 번호가 올바르지 않습니다.", 400);

  const hasAnswer = payload.answer !== undefined;
  const hasStatus = payload.status !== undefined;
  if (!hasAnswer && !hasStatus) return adminError("저장할 답변이나 상태를 입력해 주세요.", 400);
  if (hasStatus && !STATUSES.includes(payload.status as (typeof STATUSES)[number])) {
    return adminError("문의 상태가 올바르지 않습니다.", 400);
  }

  const answer = hasAnswer ? String(payload.answer ?? "").trim() : null;
  if (answer !== null && answer.length > ANSWER_MAX_LENGTH) {
    return adminError(`답변은 ${ANSWER_MAX_LENGTH}자 이내로 입력해 주세요.`, 400);
  }
  // 상태를 따로 주지 않으면 답변을 쓰면 '답변 완료', 답변을 지우면 '답변 대기'로 맞춘다.
  const status = hasStatus ? payload.status : answer !== null ? (answer ? "answered" : "open") : null;
  if (status === "answered" && hasAnswer && !answer) return adminError("답변 완료로 바꾸려면 답변을 입력해 주세요.", 400);

  const updates: string[] = [];
  const values: unknown[] = [];
  if (answer !== null) {
    updates.push("answer = ?", answer ? "answered_at = now()" : "answered_at = null");
    values.push(answer || null);
  }
  if (status) {
    updates.push("status = ?");
    values.push(status);
  }

  const [rows] = await getPool().execute<{ id: number }[]>(
    `update inquiries set ${updates.join(", ")} where id = ? returning id`,
    [...values, inquiryId],
  );
  if (!rows.length) return adminError("문의를 찾을 수 없습니다.", 404);

  return NextResponse.json(adminOk(answer ? "답변을 저장했습니다. 고객 마이페이지 문의 내역에 보입니다." : "문의 상태를 저장했습니다.", { id: inquiryId, status }));
}
