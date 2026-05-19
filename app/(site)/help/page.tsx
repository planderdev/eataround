import type { Metadata } from "next";
import { RiMailLine, RiPhoneLine, RiQuestionAnswerLine } from "@remixicon/react";
import { SectionHeader } from "@/components/SectionHeader";

export const metadata: Metadata = {
  title: "고객센터",
};

const faqs = [
  { q: "예약은 바로 확정되나요?", a: "즉시예약 상품은 결제 또는 신청 후 확정되고, 승인예약 상품은 호스트 확인 후 안내됩니다." },
  { q: "기업·기관 견적은 어떻게 요청하나요?", a: "기업·기관 패키지에서 기간, 인원, 프로그램을 선택해 요청하면 담당자가 최종 견적을 안내합니다." },
  { q: "비 오는 날에도 가능한 체험이 있나요?", a: "필터에서 비오는날 또는 실내 옵션을 선택하면 우천 가능 상품을 확인할 수 있습니다." },
];

export default function HelpPage() {
  return (
    <section className="page-section help-page">
      <SectionHeader eyebrow="Help" title="고객센터" description="예약, 견적, 행사 문의를 안내합니다." level="h1" />
      <div className="help-layout">
        <div className="help-faq-list">
          {faqs.map((faq) => (
            <details key={faq.q}>
              <summary>
                <RiQuestionAnswerLine size={18} />
                {faq.q}
              </summary>
              <p>{faq.a}</p>
            </details>
          ))}
        </div>
        <aside className="help-contact-card">
          <span>
            <RiPhoneLine size={20} />
            고객센터
          </span>
          <strong>070-8825-0227</strong>
          <span>
            <RiMailLine size={20} />
            비즈니스
          </span>
          <strong>hello@eataround.co.kr</strong>
        </aside>
      </div>
    </section>
  );
}
