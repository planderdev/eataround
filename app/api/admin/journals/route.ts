import { NextResponse } from "next/server";
import { adminOk } from "@/lib/admin/api-data";
import { requireAdmin } from "@/lib/admin/guard";
import { insertRow, makeSlug, readPayload, type FieldSpec } from "@/lib/admin/patch";
import { hasDatabaseConfig } from "@/lib/db";

const JOURNAL_SPECS: Record<string, FieldSpec> = {
  title: { column: "title", kind: "text", label: "제목", max: 190, required: true },
  category: { column: "category", kind: "text", label: "카테고리", max: 80 },
  excerpt: { column: "excerpt", kind: "text", label: "요약", max: 500 },
  content: { column: "content", kind: "text", label: "본문", max: 20000 },
  imageUrl: { column: "image_url", kind: "text", label: "커버 이미지 주소", max: 500 },
  isVisible: { column: "is_visible", kind: "flag", label: "발행 여부" },
};

export async function POST(request: Request) {
  const payload = await readPayload(request);
  if (!hasDatabaseConfig()) return NextResponse.json(adminOk("저널이 등록되었습니다.", payload), { status: 201 });

  const denied = await requireAdmin(request);
  if (denied) return denied;

  return insertRow(payload, {
    table: "journals",
    specs: JOURNAL_SPECS,
    extra: { slug: makeSlug(payload.slug ?? payload.title, "journal"), published_at: new Date().toISOString() },
    okMessage: "저널을 등록했습니다.",
    duplicateMessage: "같은 주소(slug)의 저널이 이미 있습니다. 제목을 바꿔 주세요.",
  });
}
