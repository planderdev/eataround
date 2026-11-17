import { NextResponse } from "next/server";
import { adminOk } from "@/lib/admin/api-data";
import { requireAdmin } from "@/lib/admin/guard";
import { insertRow, readPayload, type FieldSpec } from "@/lib/admin/patch";
import { hasDatabaseConfig } from "@/lib/db";

const SPECS: Record<string, FieldSpec> = {
  label: { column: "label", kind: "text", label: "카테고리명", max: 80, required: true },
  href: { column: "href", kind: "text", label: "연결 경로", max: 300, required: true },
  iconAsset: { column: "icon_asset", kind: "text", label: "아이콘 에셋", max: 300 },
  tone: { column: "tone", kind: "enum", label: "톤", values: ["green", "coral", "blue", "yellow", "red", "ink"] },
  isVisible: { column: "is_visible", kind: "flag", label: "노출 여부" },
  sortOrder: { column: "sort_order", kind: "int", label: "정렬 순서" },
};

export async function POST(request: Request) {
  const payload = await readPayload(request);
  if (!hasDatabaseConfig()) return NextResponse.json(adminOk("카테고리가 등록되었습니다.", payload), { status: 201 });

  const denied = await requireAdmin(request);
  if (denied) return denied;

  return insertRow(payload, {
    table: "categories",
    specs: SPECS,
    okMessage: "카테고리를 등록했습니다.",
    duplicateMessage: "같은 이름의 카테고리가 이미 있습니다.",
  });
}
