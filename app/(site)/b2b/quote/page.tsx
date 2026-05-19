import type { Metadata } from "next";
import { QuoteBuilder } from "@/components/QuoteBuilder";
import { SectionHeader } from "@/components/SectionHeader";
import { getDiscountTiers, getPackageOptions, getPackagePrograms } from "@/lib/content";

export const metadata: Metadata = {
  title: "견적 요청",
  description: "기업·기관 전용 제주 로컬 프로그램 견적 요청",
};

export default async function B2BQuotePage() {
  const [programs, options, tiers] = await Promise.all([getPackagePrograms(), getPackageOptions(), getDiscountTiers()]);

  return (
    <section className="page-section">
      <SectionHeader
        eyebrow="Quote"
        title="견적 요청"
        description="기간, 인원, 프로그램, 옵션을 선택하면 단체 일정에 맞춘 예상 견적을 확인할 수 있습니다."
        level="h1"
      />
      <QuoteBuilder options={options} programs={programs} tiers={tiers} />
    </section>
  );
}
