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
    return NextResponse.json(adminOk("견적서 발송 요청을 완료했습니다.", { id: decodeURIComponent(id) }));
  }

  const denied = await requireAdmin(request);
  if (denied) return denied;
  return notLinked("메일 발송 수단이 없어 견적서를 보낼 수 없습니다. 발송 후 견적 상태를 '발송완료'로 직접 바꿔 주세요.");
}
