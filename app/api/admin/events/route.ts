import { NextResponse } from "next/server";
import { adminApiData, adminOk, paginated } from "@/lib/admin/api-data";
import { requireAdmin, requireAdminWhenConnected } from "@/lib/admin/guard";
import { insertRow, makeSlug, readPayload, type FieldSpec } from "@/lib/admin/patch";
import { hasDatabaseConfig } from "@/lib/db";

const SPECS: Record<string, FieldSpec> = {
  title: { column: "title", kind: "text", label: "행사명", max: 190, required: true },
  status: { column: "status", kind: "enum", label: "행사 상태", values: ["ongoing", "ended"] },
  period: { column: "period_label", kind: "text", label: "기간", max: 120, required: true },
  venue: { column: "venue", kind: "text", label: "장소", max: 190 },
  partner: { column: "partner", kind: "text", label: "파트너", max: 190 },
  summary: { column: "summary", kind: "text", label: "요약", max: 500 },
  imageUrl: { column: "image_url", kind: "text", label: "이미지 주소", max: 500 },
  sortOrder: { column: "sort_order", kind: "int", label: "정렬 순서" },
};

export async function GET(request: Request) {
  const denied = await requireAdminWhenConnected(request);
  if (denied) return denied;
  return NextResponse.json(paginated(request, adminApiData.events));
}

export async function POST(request: Request) {
  const payload = await readPayload(request);
  if (!hasDatabaseConfig()) return NextResponse.json(adminOk("행사가 등록되었습니다.", payload), { status: 201 });

  const denied = await requireAdmin(request);
  if (denied) return denied;

  return insertRow(payload, {
    table: "events",
    specs: SPECS,
    extra: { slug: makeSlug(payload.slug ?? payload.title, "event") },
    okMessage: "행사를 등록했습니다.",
    duplicateMessage: "같은 주소(slug)의 행사가 이미 있습니다. 행사명을 바꿔 주세요.",
  });
}
