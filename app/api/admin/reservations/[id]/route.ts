import { NextResponse } from "next/server";
import { adminOk } from "@/lib/admin/api-data";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type Payload = {
  status?: "confirmed" | "cancelled" | "rejected" | "requested" | "paid";
  rejectReason?: string;
  memo?: string;
};

const STATUS_MESSAGE: Record<NonNullable<Payload["status"]>, string> = {
  confirmed: "예약을 확정 처리했습니다.",
  cancelled: "예약 취소 검토 상태로 변경했습니다.",
  rejected: "예약을 거절 처리하고 사유를 함께 안내했습니다.",
  requested: "예약을 다시 검토 상태로 되돌렸습니다.",
  paid: "결제 확인을 반영했습니다.",
};

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const payload = (await request.json().catch(() => ({}))) as Payload;
  const status = payload.status;

  if (status === "rejected" && !payload.rejectReason?.trim()) {
    return NextResponse.json(
      { ok: false, message: "예약 거절 사유를 입력해 주세요." },
      { status: 400 },
    );
  }

  const message = status ? STATUS_MESSAGE[status] ?? "예약 상태를 업데이트했습니다." : "예약 정보를 업데이트했습니다.";
  return NextResponse.json(adminOk(message, { id: decodeURIComponent(id), payload }));
}
