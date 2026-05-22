import { NextResponse } from "next/server";
import { adminOk } from "@/lib/admin/api-data";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const payload = await request.json().catch(() => ({}));
  return NextResponse.json(adminOk("기획전 정보를 저장했습니다.", { id: decodeURIComponent(id), payload }));
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  return NextResponse.json(adminOk("기획전이 비노출 처리되었습니다.", { id: decodeURIComponent(id) }));
}
