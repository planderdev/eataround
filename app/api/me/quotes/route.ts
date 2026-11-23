import { NextResponse } from "next/server";
import { hasDatabaseConfig } from "@/lib/db";
import { listMyQuotes } from "@/lib/me/quotes";
import { quoteHistory } from "@/lib/mypage-data";
import { getSessionUser } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await getSessionUser(request);

  if (!hasDatabaseConfig() || !session) {
    return NextResponse.json(quoteHistory);
  }

  return NextResponse.json(await listMyQuotes(session.id));
}
