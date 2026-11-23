import { NextResponse } from "next/server";
import { hasDatabaseConfig } from "@/lib/db";
import { listMyWishlist } from "@/lib/me/wishlist";
import { wishlistItems } from "@/lib/mypage-data";
import { getSessionUser } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!hasDatabaseConfig()) return NextResponse.json(wishlistItems);

  const user = await getSessionUser(request);
  if (!user) return NextResponse.json({ ok: false, message: "로그인이 필요합니다." }, { status: 401 });
  return NextResponse.json(await listMyWishlist(user.id));
}
