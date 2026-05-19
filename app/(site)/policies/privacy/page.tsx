import type { Metadata } from "next";
import { SectionHeader } from "@/components/SectionHeader";

export const metadata: Metadata = {
  title: "개인정보처리방침",
};

export default function PrivacyPage() {
  return (
    <section className="page-section policy-page">
      <SectionHeader eyebrow="Privacy" title="개인정보처리방침" description="예약, 회원, 견적 상담에 필요한 개인정보 처리 기준입니다." level="h1" />
      <div className="policy-prose">
        <h2>수집 항목</h2>
        <p>회원가입, 예약, 견적 문의 과정에서 이름, 연락처, 이메일, 예약 정보, 기업·기관 정보를 수집할 수 있습니다.</p>
        <h2>이용 목적</h2>
        <p>수집한 정보는 회원 관리, 체험 예약 확인, 문의 응대, 견적 안내, 고객센터 운영을 위해 사용됩니다.</p>
        <h2>책임자</h2>
        <p>개인정보보호 책임자: 김선재 / 비즈니스 문의: hello@eataround.co.kr / 고객센터: 070-8825-0227</p>
      </div>
    </section>
  );
}
