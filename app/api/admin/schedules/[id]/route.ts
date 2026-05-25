import { NextResponse } from "next/server";
import { adminOk } from "@/lib/admin/api-data";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type SchedulePayload = {
  capacity?: number;
  maxTeams?: number;
  teamCapacity?: number;
  status?: "open" | "closed";
};

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function validate(payload: SchedulePayload) {
  if (isFiniteNumber(payload.capacity) && payload.capacity < 0) return "수용 인원은 0 이상이어야 합니다.";
  if (isFiniteNumber(payload.maxTeams) && payload.maxTeams < 0) return "팀 정원은 0 이상이어야 합니다.";
  if (isFiniteNumber(payload.teamCapacity) && payload.teamCapacity < 0) return "팀당 인원은 0 이상이어야 합니다.";
  return null;
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const payload = (await request.json().catch(() => ({}))) as SchedulePayload;
  const error = validate(payload);

  if (error) {
    return NextResponse.json({ ok: false, message: error }, { status: 400 });
  }

  const message = payload.status === "closed" ? "회차를 마감 처리했습니다." : "좌석과 팀 단위 재고를 반영했습니다.";
  return NextResponse.json(adminOk(message, { id: decodeURIComponent(id), payload }));
}
