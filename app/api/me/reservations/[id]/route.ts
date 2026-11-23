import { NextResponse } from "next/server";
import { revalidateSite } from "@/lib/admin/revalidate";
import { hasDatabaseConfig } from "@/lib/db";
import { cancelMyReservation, findMyReservation, parseReservationId, rowToReservation } from "@/lib/me/reservations";
import { reservationHistory } from "@/lib/mypage-data";
import { getSessionUser } from "@/lib/session";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function fail(message: string, status: number) {
  return NextResponse.json({ ok: false, message }, { status });
}

function findSampleReservation(id: string) {
  return reservationHistory.find((reservation) => reservation.id === decodeURIComponent(id));
}

export async function GET(request: Request, { params }: RouteContext) {
  const { id } = await params;

  if (!hasDatabaseConfig()) {
    const reservation = findSampleReservation(id);
    return reservation ? NextResponse.json(reservation) : fail("예약 내역을 찾을 수 없습니다.", 404);
  }

  const user = await getSessionUser(request);
  if (!user) return fail("로그인이 필요합니다.", 401);

  const reservationId = parseReservationId(id);
  if (!reservationId) return fail("예약 내역을 찾을 수 없습니다.", 404);

  // 다른 회원의 예약은 있는지조차 알리지 않는다(같은 404).
  const row = await findMyReservation(user.id, reservationId);
  if (!row) return fail("예약 내역을 찾을 수 없습니다.", 404);
  return NextResponse.json(rowToReservation(row));
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const payload = (await request.json().catch(() => ({}))) as { status?: string };

  if (!hasDatabaseConfig()) {
    const reservation = findSampleReservation(id);
    if (!reservation) return fail("예약 내역을 찾을 수 없습니다.", 404);
    const cancelled = payload.status === "cancelled" || payload.status === "canceled";
    return NextResponse.json({
      ...reservation,
      status: cancelled ? "예약 취소" : "예약 요청 완료",
      statusTone: cancelled ? ("cancelled" as const) : ("confirmed" as const),
    });
  }

  const user = await getSessionUser(request);
  if (!user) return fail("로그인이 필요합니다.", 401);

  const reservationId = parseReservationId(id);
  if (!reservationId) return fail("예약 내역을 찾을 수 없습니다.", 404);

  if (payload.status === "cancelled" || payload.status === "canceled") {
    const result = await cancelMyReservation(user.id, reservationId);
    if (!result.ok) return fail(result.message, result.status);
    // 좌석이 다시 늘었으므로 상세 화면의 잔여 좌석을 다시 만들게 한다.
    revalidateSite();
  } else if (payload.status !== "requested") {
    // 회원이 바꿀 수 있는 상태는 취소뿐이다. "requested"는 예약 확인 화면의 재확인으로 그대로 둔다.
    return fail("바꿀 수 없는 예약 상태입니다.", 400);
  }

  const row = await findMyReservation(user.id, reservationId);
  if (!row) return fail("예약 내역을 찾을 수 없습니다.", 404);
  return NextResponse.json(rowToReservation(row));
}
