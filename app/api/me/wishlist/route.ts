import { NextResponse } from "next/server";
import { wishlistItems } from "@/lib/mypage-data";

export async function GET() {
  return NextResponse.json(wishlistItems);
}
