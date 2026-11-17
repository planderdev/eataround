import { NextResponse } from "next/server";
import { adminOk } from "@/lib/admin/api-data";
import { adminError, parseRowId, requireAdmin, trimmed } from "@/lib/admin/guard";
import { getPool, hasDatabaseConfig } from "@/lib/db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type MemberAction = "approve" | "reject" | "notify";

type Payload = {
  action?: MemberAction;
  rejectReason?: string;
  memo?: string;
};

const MESSAGE: Record<MemberAction, string> = {
  approve: "회원 가입을 승인했습니다.",
  reject: "회원 가입을 반려했습니다.",
  notify: "안내를 발송했습니다.",
};

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const payload = (await request.json().catch(() => ({}))) as Payload;
  const action = payload.action;

  if (action !== undefined && !(action in MESSAGE)) {
    return adminError("지원하지 않는 회원 처리입니다.", 400);
  }

  if (action === "reject" && !payload.rejectReason?.trim()) {
    return adminError("반려 사유를 입력해 주세요.", 400);
  }

  if (!hasDatabaseConfig()) {
    const message = action ? MESSAGE[action] : "회원 정보를 업데이트했습니다.";
    return NextResponse.json(adminOk(message, { id: decodeURIComponent(id), payload }));
  }

  const denied = await requireAdmin(request);
  if (denied) return denied;

  const memberId = parseRowId(id);
  if (!memberId) return adminError("회원 번호가 올바르지 않습니다.", 400);

  if (action === "notify") return adminError("안내 발송 기능은 아직 연결되지 않았습니다.", 501);
  if (!action) return adminError("처리할 동작을 지정해 주세요.", 400);

  const approved = action === "approve";
  const [rows] = await getPool().execute<{ id: number }[]>(
    `update users
        set company_approved = ?, company_rejected_reason = ?
      where id = ? and member_type = 'company'
      returning id`,
    [approved ? 1 : 0, approved ? null : trimmed(payload.rejectReason, 300), memberId],
  );

  if (!rows.length) return adminError("기업·기관 회원을 찾을 수 없습니다.", 404);

  return NextResponse.json(adminOk(MESSAGE[action], { id: memberId, status: approved ? "approved" : "rejected" }));
}
