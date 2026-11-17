import { NextResponse } from "next/server";
import { adminApiData, adminOk, paginated } from "@/lib/admin/api-data";
import { requireAdmin } from "@/lib/admin/guard";
import { insertRow, makeSlug, readPayload, type FieldSpec } from "@/lib/admin/patch";
import { hasDatabaseConfig } from "@/lib/db";

const SPECS: Record<string, FieldSpec> = {
  eyebrow: { column: "eyebrow", kind: "text", label: "아이브로", max: 80 },
  title: { column: "title", kind: "text", label: "기획전명", max: 190, required: true },
  subtitle: { column: "subtitle", kind: "text", label: "설명", max: 300 },
  linkUrl: { column: "link_url", kind: "text", label: "연결 링크", max: 300 },
  imageUrl: { column: "image_url", kind: "text", label: "이미지 주소", max: 500 },
  isVisible: { column: "is_visible", kind: "flag", label: "노출 여부" },
  sortOrder: { column: "sort_order", kind: "int", label: "정렬 순서" },
};

export async function GET(request: Request) {
  return NextResponse.json(paginated(request, adminApiData.curations));
}

export async function POST(request: Request) {
  const payload = await readPayload(request);
  if (!hasDatabaseConfig()) return NextResponse.json(adminOk("기획전이 등록되었습니다.", payload), { status: 201 });

  const denied = await requireAdmin(request);
  if (denied) return denied;

  return insertRow(payload, {
    table: "collections",
    specs: SPECS,
    extra: { slug: makeSlug(payload.slug ?? payload.title, "curation") },
    okMessage: "기획전을 등록했습니다.",
    duplicateMessage: "같은 주소(slug)의 기획전이 이미 있습니다. 기획전명을 바꿔 주세요.",
  });
}
