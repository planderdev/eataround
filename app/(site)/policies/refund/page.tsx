import type { Metadata } from "next";
import { SectionHeader } from "@/components/SectionHeader";

export const metadata: Metadata = {
  title: "환불 정책",
};

export default function RefundPage() {
  return (
    <section className="page-section policy-page">
      <SectionHeader eyebrow="Refund" title="환불 정책" description="상품별 상세 환불규정을 우선 적용합니다." level="h1" />
      <div className="policy-prose">
        <h2>기본 기준</h2>
        <p>체험 3일 전까지는 100%, 1일 전까지는 50% 환불을 기본 기준으로 하며 상품별 정책이 우선합니다.</p>
        <h2>당일 취소</h2>
        <p>당일 취소와 노쇼는 환불이 어렵습니다. 호스트 사정 또는 기상 악화로 취소될 경우 전액 환불됩니다.</p>
        <h2>단체 견적</h2>
        <p>기업·기관 패키지는 견적서와 계약 조건에 명시된 취소·환불 기준을 따릅니다.</p>
      </div>
    </section>
  );
}
