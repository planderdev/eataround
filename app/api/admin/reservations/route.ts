import { requireAdminWhenConnected } from "@/lib/admin/guard";
import { NextResponse } from "next/server";
import { adminApiData, paginated } from "@/lib/admin/api-data";
import { getAdminReservations } from "@/lib/content";
import { hasDatabaseConfig } from "@/lib/db";
import type { AdminReservation } from "@/types/api";

export async function GET(request: Request) {
  const denied = await requireAdminWhenConnected(request);
  if (denied) return denied;
  if (!hasDatabaseConfig()) return NextResponse.json(paginated(request, adminApiData.reservations));

  const rows = await getAdminReservations();
  const items = rows.map<AdminReservation & { statusCode?: string; memo?: string }>((row) => ({
    ...row,
    id: row.id ? String(row.id) : "",
    amount: row.amount ?? 0,
  }));
  return NextResponse.json(paginated(request, items));
}
