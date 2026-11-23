import { NextResponse } from "next/server";
import { adminApiData, adminOk, paginated } from "@/lib/admin/api-data";
import { requireAdmin, requireAdminWhenConnected } from "@/lib/admin/guard";
import { insertRow, readPayload, type FieldSpec } from "@/lib/admin/patch";
import { hasDatabaseConfig } from "@/lib/db";

const SPECS: Record<string, FieldSpec> = {
  placement: { column: "placement", kind: "enum", label: "노출 슬롯", values: ["home_main", "home_event", "package_cta"] },
  theme: { column: "theme", kind: "enum", label: "테마", values: ["red", "green", "blue"] },
  eyebrow: { column: "eyebrow", kind: "text", label: "아이브로", max: 80 },
  title: { column: "title", kind: "text", label: "제목", max: 190, required: true },
  subtitle: { column: "subtitle", kind: "text", label: "서브카피", max: 300 },
  linkUrl: { column: "link_url", kind: "text", label: "연결 링크", max: 300 },
  imageUrl: { column: "image_url", kind: "text", label: "이미지 주소", max: 500 },
  isVisible: { column: "is_visible", kind: "flag", label: "노출 여부" },
  sortOrder: { column: "sort_order", kind: "int", label: "정렬 순서" },
};

export async function GET(request: Request) {
  const denied = await requireAdminWhenConnected(request);
  if (denied) return denied;
  return NextResponse.json(paginated(request, adminApiData.banners));
}

export async function POST(request: Request) {
  const payload = await readPayload(request);
  if (!hasDatabaseConfig()) return NextResponse.json(adminOk("배너가 등록되었습니다.", payload), { status: 201 });

  const denied = await requireAdmin(request);
  if (denied) return denied;

  return insertRow({ placement: "home_main", ...payload }, {
    table: "banners",
    specs: SPECS,
    okMessage: "배너를 등록했습니다.",
    duplicateMessage: "같은 위치에 같은 제목의 배너가 이미 있습니다.",
  });
}
