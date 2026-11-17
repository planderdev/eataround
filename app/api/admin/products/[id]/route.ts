import { patchRow, readPayload, type FieldSpec } from "@/lib/admin/patch";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const SPECS: Record<string, FieldSpec> = {
  title: { column: "title", kind: "text", label: "상품명", max: 190, required: true },
  summary: { column: "summary", kind: "text", label: "요약", max: 500 },
  price: { column: "price", kind: "int", label: "기본가", min: 0 },
  originalPrice: { column: "original_price", kind: "int", label: "정가", min: 0, nullable: true },
  badge: { column: "badge", kind: "text", label: "배지", max: 40 },
  imageUrl: { column: "image_url", kind: "text", label: "대표 이미지 주소", max: 500 },
  isVisible: { column: "is_visible", kind: "flag", label: "노출 여부" },
  isFeatured: { column: "is_featured", kind: "flag", label: "추천 여부" },
  sortOrder: { column: "sort_order", kind: "int", label: "정렬 순서" },
};

const OPTIONS = {
  table: "products",
  specs: SPECS,
  notFoundMessage: "상품을 찾을 수 없습니다.",
};

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  return patchRow(request, id, await readPayload(request), {
    ...OPTIONS,
    okMessage: "상품 정보를 저장했습니다.",
    sampleMessage: "상품 운영 정보가 저장되었습니다.",
  });
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const { id } = await params;
  return patchRow(request, id, { isVisible: false }, {
    ...OPTIONS,
    okMessage: "상품을 비노출 처리했습니다.",
    sampleMessage: "상품이 비노출 처리되었습니다.",
  });
}
