import { requireAdminWhenConnected } from "@/lib/admin/guard";
import { NextResponse } from "next/server";
import { adminApiData, paginated } from "@/lib/admin/api-data";
import { getAdminMembers } from "@/lib/content";
import { hasDatabaseConfig } from "@/lib/db";
import type { AdminMember } from "@/types/api";

export async function GET(request: Request) {
  const denied = await requireAdminWhenConnected(request);
  if (denied) return denied;
  if (!hasDatabaseConfig()) return NextResponse.json(paginated(request, adminApiData.members));

  const rows = await getAdminMembers();
  const items = rows.map<AdminMember & { rejectedReason?: string }>((row) => ({
    ...row,
    id: row.id ? String(row.id) : undefined,
  }));
  return NextResponse.json(paginated(request, items, 30));
}
