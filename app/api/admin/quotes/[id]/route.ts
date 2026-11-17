import { NextResponse } from "next/server";
import { adminOk } from "@/lib/admin/api-data";
import { adminError, parseRowId, requireAdmin } from "@/lib/admin/guard";
import { getPool, hasDatabaseConfig } from "@/lib/db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type Payload = {
  status?: string;
  adminMemo?: string | null;
};

const QUOTE_STATUSES = ["requested", "reviewing", "sent", "accepted", "closed"];
const MEMO_MAX_LENGTH = 500;

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const payload = (await request.json().catch(() => ({}))) as Payload;

  if (!hasDatabaseConfig()) {
    return NextResponse.json(adminOk("견적 상태를 업데이트했습니다.", { id: decodeURIComponent(id), payload }));
  }

  const denied = await requireAdmin(request);
  if (denied) return denied;

  const quoteId = parseRowId(id);
  if (!quoteId) return adminError("견적 번호가 올바르지 않습니다.", 400);

  const hasStatus = payload.status !== undefined;
  const hasMemo = payload.adminMemo !== undefined;

  if (!hasStatus && !hasMemo) return adminError("변경할 상태나 메모를 입력해 주세요.", 400);
  if (hasStatus && !QUOTE_STATUSES.includes(payload.status as string)) {
    return adminError("지원하지 않는 견적 상태입니다.", 400);
  }
  if (hasMemo && payload.adminMemo !== null && typeof payload.adminMemo !== "string") {
    return adminError("관리자 메모 형식이 올바르지 않습니다.", 400);
  }

  const memo = typeof payload.adminMemo === "string" ? payload.adminMemo.trim() : "";
  if (memo.length > MEMO_MAX_LENGTH) {
    return adminError(`관리자 메모는 ${MEMO_MAX_LENGTH}자까지 입력할 수 있습니다.`, 400);
  }

  const sets: string[] = [];
  const values: unknown[] = [];
  if (hasStatus) {
    sets.push("status = ?");
    values.push(payload.status);
  }
  if (hasMemo) {
    sets.push("admin_memo = ?");
    values.push(memo || null);
  }

  const [rows] = await getPool().execute<{ id: number; status: string; admin_memo: string | null }[]>(
    `update quote_requests set ${sets.join(", ")} where id = ? returning id, status, admin_memo`,
    [...values, quoteId],
  );

  if (!rows.length) return adminError("견적 요청을 찾을 수 없습니다.", 404);

  return NextResponse.json(
    adminOk("견적 상태와 메모를 저장했습니다.", { id: quoteId, status: rows[0].status, adminMemo: rows[0].admin_memo }),
  );
}
