import { NextResponse } from "next/server";
import { adminApiData, adminOk, paginated } from "@/lib/admin/api-data";

export async function GET(request: Request) {
  return NextResponse.json(paginated(request, adminApiData.banners));
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));
  return NextResponse.json(adminOk("배너가 등록되었습니다.", payload), { status: 201 });
}
