import { patchRow, readPayload, type FieldSpec } from "@/lib/admin/patch";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const SPECS: Record<string, FieldSpec> = {
  title: { column: "title", kind: "text", label: "제목", max: 190, required: true },
  category: { column: "category", kind: "text", label: "카테고리", max: 80 },
  excerpt: { column: "excerpt", kind: "text", label: "요약", max: 500 },
  content: { column: "content", kind: "text", label: "본문", max: 20000 },
  imageUrl: { column: "image_url", kind: "text", label: "커버 이미지 주소", max: 500 },
  isVisible: { column: "is_visible", kind: "flag", label: "발행 여부" },
};

const OPTIONS = { table: "journals", specs: SPECS, notFoundMessage: "저널을 찾을 수 없습니다." };

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  return patchRow(request, id, await readPayload(request), {
    ...OPTIONS,
    okMessage: "저널을 저장했습니다.",
    sampleMessage: "저널 정보를 저장했습니다.",
  });
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const { id } = await params;
  return patchRow(request, id, { isVisible: false }, {
    ...OPTIONS,
    okMessage: "저널을 비공개 처리했습니다.",
    sampleMessage: "저널이 비공개 처리되었습니다.",
  });
}
