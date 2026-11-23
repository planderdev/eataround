import { NextResponse } from "next/server";
import { hasDatabaseConfig } from "@/lib/db";
import { listMyReservations, rowToReservation, todayInSeoul } from "@/lib/me/reservations";
import { reservationHistory } from "@/lib/mypage-data";
import { getSessionUser } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(request: Request) {
  // DB가 없는 샘플 모드는 예시 예약을 보여 준다.
  if (!hasDatabaseConfig()) return NextResponse.json(reservationHistory);

  const user = await getSessionUser(request);
  if (!user) return NextResponse.json({ ok: false, message: "로그인이 필요합니다." }, { status: 401 });

  const today = todayInSeoul();
  const rows = await listMyReservations(user.id);
  return NextResponse.json(rows.map((row) => rowToReservation(row, today)));
}
