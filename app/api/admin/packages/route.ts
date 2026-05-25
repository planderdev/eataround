import { NextResponse } from "next/server";
import { adminOk } from "@/lib/admin/api-data";

type PackagePayload = {
  title?: string;
  code?: string;
  memo?: string;
  programIds?: string[];
  optionIds?: string[];
  discountTiers?: { label: string; min: number; rate: number }[];
};

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as PackagePayload;

  if (!payload.title?.trim()) {
    return NextResponse.json({ ok: false, message: "패키지명을 입력해 주세요." }, { status: 400 });
  }
  if (!payload.programIds?.length) {
    return NextResponse.json({ ok: false, message: "프로그램을 1개 이상 선택해 주세요." }, { status: 400 });
  }

  return NextResponse.json(adminOk("패키지를 저장했습니다.", payload));
}
