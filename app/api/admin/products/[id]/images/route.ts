import { NextResponse } from "next/server";
import { adminOk } from "@/lib/admin/api-data";
import { requireAdmin } from "@/lib/admin/guard";
import { notLinked } from "@/lib/admin/patch";
import { hasDatabaseConfig } from "@/lib/db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: RouteContext) {
  const { id } = await params;
  if (!hasDatabaseConfig()) {
    const payload = await request.json().catch(() => ({}));
    return NextResponse.json(adminOk("상품 이미지가 등록되었습니다.", { id: decodeURIComponent(id), payload }), { status: 201 });
  }

  const denied = await requireAdmin(request);
  if (denied) return denied;
  return notLinked("이미지 파일을 보관할 저장소와 상품별 갤러리 테이블이 아직 없습니다.");
}
