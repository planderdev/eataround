import { NextResponse } from "next/server";
import { adminOk } from "@/lib/admin/api-data";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  return NextResponse.json(adminOk("견적서 발송 요청을 완료했습니다.", { id: decodeURIComponent(id) }));
}
