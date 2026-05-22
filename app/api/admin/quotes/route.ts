import { NextResponse } from "next/server";
import { adminApiData, paginated } from "@/lib/admin/api-data";

export async function GET(request: Request) {
  return NextResponse.json(paginated(request, adminApiData.quotes));
}
