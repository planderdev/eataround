import type { Metadata } from "next";
import { SectionHeader } from "@/components/SectionHeader";
import { SignupForm } from "@/components/SignupForm";

export const metadata: Metadata = {
  title: "일반 회원가입",
};

export default function GeneralSignupPage() {
  return (
    <section className="page-section auth-page">
      <SectionHeader
        eyebrow="General"
        title="일반 회원가입"
        description="예약 내역, 리뷰, 문의를 편하게 관리할 수 있는 기본 회원 계정입니다."
        level="h1"
      />
      <div className="auth-card signup-auth-card">
        <SignupForm initialMemberType="personal" lockMemberType />
      </div>
    </section>
  );
}
