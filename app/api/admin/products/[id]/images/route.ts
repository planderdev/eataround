import { NextResponse } from "next/server";
import { adminOk } from "@/lib/admin/api-data";
import { adminError } from "@/lib/admin/guard";
import { patchRow, readPayload, type FieldSpec } from "@/lib/admin/patch";
import { hasDatabaseConfig } from "@/lib/db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const SPECS: Record<string, FieldSpec> = {
  imageUrl: { column: "image_url", kind: "text", label: "대표 이미지 주소", max: 500, required: true },
};

/**
 * 상품 대표 이미지를 지정한다. 파일 자체는 `/api/admin/uploads` 토큰으로 브라우저가 Vercel Blob에 직접 올리고,
 * 여기에는 그 결과 주소(`imageUrl`)만 보낸다. 상품별 갤러리(여러 장)는 저장할 테이블이 없어 받지 않는다.
 */
export async function POST(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const payload = await readPayload(request);

  if (!hasDatabaseConfig()) {
    return NextResponse.json(adminOk("상품 이미지가 등록되었습니다.", { id: decodeURIComponent(id), payload }), { status: 201 });
  }

  if (Array.isArray(payload.images) || Array.isArray(payload.gallery)) {
    return adminError("아직 연결되지 않은 기능입니다. 상품별 갤러리(여러 장)를 저장할 테이블이 없습니다. 대표 이미지는 imageUrl로 보내 주세요.", 501);
  }
  if (typeof payload.imageUrl !== "string" || !/^https?:\/\//i.test(payload.imageUrl.trim())) {
    return adminError("대표 이미지 주소(imageUrl)를 http(s) 주소로 보내 주세요.", 400);
  }

  return patchRow(request, id, { imageUrl: payload.imageUrl }, {
    table: "products",
    specs: SPECS,
    okMessage: "상품 대표 이미지를 저장했습니다.",
    sampleMessage: "상품 이미지가 등록되었습니다.",
    notFoundMessage: "상품을 찾을 수 없습니다.",
  });
}
