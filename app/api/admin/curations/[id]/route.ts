import { patchRow, readPayload, type FieldSpec } from "@/lib/admin/patch";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// 기획전은 collections 테이블에 저장한다.
const SPECS: Record<string, FieldSpec> = {
  title: { column: "title", kind: "text", label: "기획전명", max: 190, required: true },
  subtitle: { column: "subtitle", kind: "text", label: "설명", max: 300 },
  linkUrl: { column: "link_url", kind: "text", label: "연결 링크", max: 300 },
  imageUrl: { column: "image_url", kind: "text", label: "이미지 주소", max: 500 },
  isVisible: { column: "is_visible", kind: "flag", label: "노출 여부" },
  sortOrder: { column: "sort_order", kind: "int", label: "정렬 순서" },
};

const OPTIONS = {
  table: "collections",
  specs: SPECS,
  notFoundMessage: "기획전을 찾을 수 없습니다.",
};

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  return patchRow(request, id, await readPayload(request), {
    ...OPTIONS,
    okMessage: "기획전 정보를 저장했습니다.",
    sampleMessage: "기획전 정보를 저장했습니다.",
  });
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const { id } = await params;
  return patchRow(request, id, { isVisible: false }, {
    ...OPTIONS,
    okMessage: "기획전을 비노출 처리했습니다.",
    sampleMessage: "기획전이 비노출 처리되었습니다.",
  });
}
