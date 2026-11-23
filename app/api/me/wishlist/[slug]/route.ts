import { NextResponse } from "next/server";
import { hasDatabaseConfig } from "@/lib/db";
import { setWishlist } from "@/lib/me/wishlist";
import { getSessionUser } from "@/lib/session";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

async function handle(request: Request, { params }: RouteContext, saved: boolean) {
  const slug = decodeURIComponent((await params).slug);
  // DB가 없는 샘플 모드는 브라우저에만 저장한다.
  if (!hasDatabaseConfig()) return NextResponse.json({ saved, slug });

  const user = await getSessionUser(request);
  if (!user) return NextResponse.json({ ok: false, message: "로그인 후 이용 가능합니다." }, { status: 401 });

  const result = await setWishlist(user.id, slug, saved);
  if (result === null) return NextResponse.json({ ok: false, message: "상품을 찾을 수 없습니다." }, { status: 404 });
  return NextResponse.json({ saved: result, slug });
}

export function POST(request: Request, context: RouteContext) {
  return handle(request, context, true);
}

export function DELETE(request: Request, context: RouteContext) {
  return handle(request, context, false);
}
