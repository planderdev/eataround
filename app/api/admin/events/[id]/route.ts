import { patchRow, readPayload, type FieldSpec } from "@/lib/admin/patch";

type RouteContext = {
  params: Promise<{ id: string }>;
};

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

const OPTIONS = {
  table: "events",
  specs: SPECS,
  notFoundMessage: "행사를 찾을 수 없습니다.",
};

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  return patchRow(request, id, await readPayload(request), {
    ...OPTIONS,
    okMessage: "행사 정보를 저장했습니다.",
    sampleMessage: "행사 정보를 업데이트했습니다.",
  });
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const { id } = await params;
  return patchRow(request, id, { status: "ended" }, {
    ...OPTIONS,
    okMessage: "행사를 종료 처리했습니다.",
    sampleMessage: "행사를 종료 처리했습니다.",
  });
}
