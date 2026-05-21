import type { Metadata } from "next";
import { QuoteBuilder } from "@/components/QuoteBuilder";
import { SectionHeader } from "@/components/SectionHeader";
import { getDiscountTiers, getPackageOptions, getPackagePrograms } from "@/lib/content";

export const metadata: Metadata = {
  title: "단체 견적 요청",
  description: "기업·기관회원이 기간, 인원, 프로그램, 옵션을 선택해 제주 로컬 체험 단체 견적을 요청하는 페이지입니다.",
};

export default async function B2BQuotePage() {
  const [programs, options, tiers] = await Promise.all([getPackagePrograms(), getPackageOptions(), getDiscountTiers()]);

  return (
    <section className="page-section">
      <SectionHeader
        eyebrow="Group Quote"
        title="단체 견적 요청"
        description="기간, 인원, 프로그램, 식사·숙박·이동 옵션을 선택해 기업·기관 단체 견적을 접수할 수 있습니다."
        level="h1"
      />
      <QuoteBuilder options={options} programs={programs} tiers={tiers} />
    </section>
  );
}
