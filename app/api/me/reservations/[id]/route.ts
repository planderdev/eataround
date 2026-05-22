import { NextResponse } from "next/server";
import { reservationHistory } from "@/lib/mypage-data";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function findReservation(id: string) {
  return reservationHistory.find((reservation) => reservation.id === decodeURIComponent(id));
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const reservation = findReservation(id);

  if (!reservation) {
    return NextResponse.json({ ok: false, message: "예약 내역을 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json(reservation);
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const reservation = findReservation(id);

  if (!reservation) {
    return NextResponse.json({ ok: false, message: "예약 내역을 찾을 수 없습니다." }, { status: 404 });
  }

  const payload = (await request.json().catch(() => ({}))) as { status?: string };
  const nextReservation = {
    ...reservation,
    status: payload.status === "cancelled" ? "예약 취소" : "예약 요청 완료",
    statusTone: payload.status === "cancelled" ? ("cancelled" as const) : ("confirmed" as const),
  };

  return NextResponse.json(nextReservation);
}
