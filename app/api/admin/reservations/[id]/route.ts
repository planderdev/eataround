import { NextResponse } from "next/server";
import { adminOk } from "@/lib/admin/api-data";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const payload = await request.json().catch(() => ({}));
  const message = (payload as { status?: string }).status === "cancelled" ? "예약 취소 검토 상태로 변경했습니다." : "예약 상태를 업데이트했습니다.";
  return NextResponse.json(adminOk(message, { id: decodeURIComponent(id), payload }));
}
