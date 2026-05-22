import { NextResponse } from "next/server";
import { adminOk } from "@/lib/admin/api-data";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const payload = await request.json().catch(() => ({}));
  return NextResponse.json(adminOk("행사 정보를 업데이트했습니다.", { id: decodeURIComponent(id), payload }));
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  return NextResponse.json(adminOk("행사를 종료 처리했습니다.", { id: decodeURIComponent(id) }));
}
