import { patchRow, readPayload, type FieldSpec } from "@/lib/admin/patch";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const SPECS: Record<string, FieldSpec> = {
  title: { column: "title", kind: "text", label: "제목", max: 190, required: true },
  subtitle: { column: "subtitle", kind: "text", label: "서브카피", max: 300 },
  linkUrl: { column: "link_url", kind: "text", label: "연결 링크", max: 300 },
  imageUrl: { column: "image_url", kind: "text", label: "이미지 주소", max: 500 },
  isVisible: { column: "is_visible", kind: "flag", label: "노출 여부" },
  sortOrder: { column: "sort_order", kind: "int", label: "정렬 순서" },
};

const OPTIONS = {
  table: "banners",
  specs: SPECS,
  notFoundMessage: "배너를 찾을 수 없습니다.",
  duplicateMessage: "같은 위치에 같은 제목의 배너가 이미 있습니다.",
};

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  return patchRow(request, id, await readPayload(request), {
    ...OPTIONS,
    okMessage: "배너 정보를 저장했습니다.",
    sampleMessage: "배너 노출 정보를 저장했습니다.",
  });
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const { id } = await params;
  return patchRow(request, id, { isVisible: false }, {
    ...OPTIONS,
    okMessage: "배너를 비노출 처리했습니다.",
    sampleMessage: "배너가 비노출 처리되었습니다.",
  });
}
