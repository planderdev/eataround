import { NextResponse } from "next/server";
import { quoteHistory } from "@/lib/mypage-data";

export async function GET() {
  return NextResponse.json(quoteHistory);
}
