import type { Metadata } from "next";
import { SectionHeader } from "@/components/SectionHeader";

export const metadata: Metadata = {
  title: "이용약관",
};

export default function TermsPage() {
  return (
    <section className="page-section policy-page">
      <SectionHeader eyebrow="Policy" title="이용약관" description="이더라운드 서비스 이용 기준을 안내합니다." level="h1" />
      <div className="policy-prose">
        <h2>서비스 이용</h2>
        <p>이더라운드는 제주 로컬체험, 행사, 기업·기관 패키지 예약과 문의를 연결하는 서비스를 제공합니다.</p>
        <h2>예약과 결제</h2>
        <p>이용자는 상품 상세의 일정, 포함사항, 장소, 유의사항, 환불규정을 확인한 뒤 예약을 진행합니다.</p>
        <h2>중개 책임</h2>
        <p>자사는 통신판매중개자이며 통신판매의 당사자가 아닙니다. 상품·거래정보 및 거래에 대하여 책임을 지지 않습니다.</p>
      </div>
    </section>
  );
}
