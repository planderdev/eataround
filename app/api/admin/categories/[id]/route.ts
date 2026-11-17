import { patchRow, readPayload, type FieldSpec } from "@/lib/admin/patch";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const SPECS: Record<string, FieldSpec> = {
  label: { column: "label", kind: "text", label: "카테고리명", max: 80, required: true },
  href: { column: "href", kind: "text", label: "연결 경로", max: 300, required: true },
  iconAsset: { column: "icon_asset", kind: "text", label: "아이콘 에셋", max: 300 },
  tone: { column: "tone", kind: "enum", label: "톤", values: ["green", "coral", "blue", "yellow", "red", "ink"] },
  isVisible: { column: "is_visible", kind: "flag", label: "노출 여부" },
  sortOrder: { column: "sort_order", kind: "int", label: "정렬 순서" },
};

const OPTIONS = {
  table: "categories",
  specs: SPECS,
  notFoundMessage: "카테고리를 찾을 수 없습니다.",
  duplicateMessage: "같은 이름의 카테고리가 이미 있습니다.",
};

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  return patchRow(request, id, await readPayload(request), {
    ...OPTIONS,
    okMessage: "카테고리를 저장했습니다.",
    sampleMessage: "카테고리 정보를 저장했습니다.",
  });
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const { id } = await params;
  return patchRow(request, id, { isVisible: false }, {
    ...OPTIONS,
    okMessage: "카테고리를 숨김 처리했습니다.",
    sampleMessage: "카테고리가 숨김 처리되었습니다.",
  });
}
