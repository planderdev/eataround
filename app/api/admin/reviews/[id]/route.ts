import { patchRow, readPayload, type FieldSpec } from "@/lib/admin/patch";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const SPECS: Record<string, FieldSpec> = {
  status: { column: "status", kind: "enum", label: "리뷰 상태", values: ["pending", "approved", "hidden"] },
};

const OPTIONS = {
  table: "product_reviews",
  specs: SPECS,
  notFoundMessage: "리뷰를 찾을 수 없습니다.",
};

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  return patchRow(request, id, await readPayload(request), {
    ...OPTIONS,
    okMessage: "리뷰 노출 상태를 저장했습니다.",
    sampleMessage: "리뷰 노출 상태를 변경했습니다.",
  });
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const { id } = await params;
  return patchRow(request, id, { status: "hidden" }, {
    ...OPTIONS,
    okMessage: "리뷰를 숨김 처리했습니다.",
    sampleMessage: "리뷰가 숨김 처리되었습니다.",
  });
}
