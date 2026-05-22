import { NextResponse } from "next/server";
import { adminOk } from "@/lib/admin/api-data";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const payload = await request.json().catch(() => ({}));
  return NextResponse.json(adminOk("회원 정보를 업데이트했습니다.", { id: decodeURIComponent(id), payload }));
}
