import { NextResponse } from "next/server";
import { reservationHistory } from "@/lib/mypage-data";

export async function GET() {
  return NextResponse.json(reservationHistory);
}
