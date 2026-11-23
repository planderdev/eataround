import { requireAdminWhenConnected } from "@/lib/admin/guard";
import { NextResponse } from "next/server";
import { adminApiData, paginated } from "@/lib/admin/api-data";

export async function GET(request: Request) {
  const denied = await requireAdminWhenConnected(request);
  if (denied) return denied;
  return NextResponse.json(paginated(request, adminApiData.reviews));
}
