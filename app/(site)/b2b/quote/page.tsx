import type { Metadata } from "next";
import { QuoteBuilder } from "@/components/QuoteBuilder";
import { getDiscountTiers, getPackageOptions, getPackagePrograms } from "@/lib/content";

export const metadata: Metadata = {
  title: "단체 견적 요청",
  description: "기업·기관회원이 기간, 인원, 프로그램, 옵션을 선택해 제주 로컬 체험 단체 견적을 요청하는 페이지입니다.",
};

export default async function B2BQuotePage() {
  const [programs, options, tiers] = await Promise.all([getPackagePrograms(), getPackageOptions(), getDiscountTiers()]);

  return <QuoteBuilder fullscreen options={options} programs={programs} tiers={tiers} />;
}
