import { NextResponse } from "next/server";
import { quoteHistory } from "@/lib/mypage-data";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function findQuote(id: string) {
  return quoteHistory.find((quote) => quote.id === decodeURIComponent(id));
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const quote = findQuote(id);

  if (!quote) {
    return NextResponse.json({ ok: false, message: "견적 내역을 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json(quote);
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const quote = findQuote(id);

  if (!quote) {
    return NextResponse.json({ ok: false, message: "견적 내역을 찾을 수 없습니다." }, { status: 404 });
  }

  const payload = (await request.json().catch(() => ({}))) as Partial<typeof quote>;
  return NextResponse.json({ ...quote, ...payload, id: quote.id });
}
