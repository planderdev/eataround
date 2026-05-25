import { NextResponse } from "next/server";
import { adminOk } from "@/lib/admin/api-data";

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
  reject: "회원 가입을 반려하고 사유를 함께 안내했습니다.",
  notify: "안내를 발송했습니다.",
};

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const payload = (await request.json().catch(() => ({}))) as Payload;
  const action = payload.action;

  if (action === "reject" && !payload.rejectReason?.trim()) {
    return NextResponse.json(
      { ok: false, message: "반려 사유를 입력해 주세요." },
      { status: 400 },
    );
  }

  const message = action ? MESSAGE[action] : "회원 정보를 업데이트했습니다.";
  return NextResponse.json(adminOk(message, { id: decodeURIComponent(id), payload }));
}
