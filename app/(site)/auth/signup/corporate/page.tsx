import type { Metadata } from "next";
import { RiBuilding2Line, RiFileUploadLine, RiShieldCheckLine } from "@remixicon/react";
import { SectionHeader } from "@/components/SectionHeader";
import { SignupForm } from "@/components/SignupForm";

export const metadata: Metadata = {
  title: "기업·기관 회원가입",
};

export default function CorporateSignupPage() {
  return (
    <section className="page-section auth-page">
      <SectionHeader
        eyebrow="Corporate"
        title="기업·기관 회원가입"
        description="단체 프로그램 견적 요청과 기관 맞춤 상담을 위한 계정입니다."
        level="h1"
      />
      <div className="corporate-signup-layout">
        <aside className="auth-info-panel">
          <RiBuilding2Line size={24} />
          <strong>승인 절차 안내</strong>
          <p>기관 정보와 담당자 정보를 남기면 담당자가 확인 후 영업일 기준 1~2일 안에 결과를 안내합니다.</p>
          <ul>
            <li>
              <RiFileUploadLine size={16} />
              사업자등록증 또는 기관 증빙은 운영 단계에서 파일 업로드로 확장됩니다.
            </li>
            <li>
              <RiShieldCheckLine size={16} />
              승인된 기업·기관 회원은 정식 견적 요청과 단체 상담 기능을 이용할 수 있습니다.
            </li>
          </ul>
        </aside>
        <div className="auth-card signup-auth-card">
          <SignupForm initialMemberType="company" lockMemberType />
        </div>
      </div>
    </section>
  );
}
