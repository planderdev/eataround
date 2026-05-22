import { NextResponse } from "next/server";
import { adminOk } from "@/lib/admin/api-data";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const payload = await request.json().catch(() => ({}));
  return NextResponse.json(adminOk("상품 운영 정보가 저장되었습니다.", { id: decodeURIComponent(id), payload }));
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  return NextResponse.json(adminOk("상품이 비노출 처리되었습니다.", { id: decodeURIComponent(id) }));
}
