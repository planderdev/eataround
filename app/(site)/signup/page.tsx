import type { Metadata } from "next";
import { RiBuilding2Line, RiShieldCheckLine, RiUser3Line } from "@remixicon/react";
import { SectionHeader } from "@/components/SectionHeader";
import { SignupForm } from "@/components/SignupForm";

export const metadata: Metadata = {
  title: "회원가입",
};

export default function SignupPage() {
  return (
    <section className="page-section">
      <SectionHeader
        eyebrow="Join"
        title="회원가입"
        description="체험 예약과 단체 프로그램 상담을 더 편하게 이용하세요."
        level="h1"
      />
      <div className="signup-layout">
        <aside className="signup-panel">
          <span className="eyebrow">Member Type</span>
          <h2>가입 유형</h2>
          <ul className="check-list">
            <li>
              <RiUser3Line size={18} /> 일반회원 : 체험 예약, 리뷰, 문의
            </li>
            <li>
              <RiBuilding2Line size={18} /> 기업·기관 : 패키지 견적, 단체 예약, 세금계산서 정보
            </li>
            <li>
              <RiShieldCheckLine size={18} /> 기업·기관 회원은 단체 프로그램 상담과 견적 요청을 이용할 수 있습니다.
            </li>
          </ul>
        </aside>

        <section className="signup-panel signup-auth-card">
          <SignupForm />
        </section>
      </div>
    </section>
  );
}
