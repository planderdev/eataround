import { NextResponse } from "next/server";
import { adminApiData, paginated } from "@/lib/admin/api-data";
import { getAdminQuoteRequests } from "@/lib/content";
import { hasDatabaseConfig } from "@/lib/db";
import type { AdminQuote } from "@/types/api";

export async function GET(request: Request) {
  if (!hasDatabaseConfig()) return NextResponse.json(paginated(request, adminApiData.quotes));

  const rows = await getAdminQuoteRequests();
  const items = rows.map<AdminQuote & { statusCode?: string; adminMemo?: string }>((row) => ({
    ...row,
    id: row.id ? String(row.id) : "",
  }));
  return NextResponse.json(paginated(request, items));
}
