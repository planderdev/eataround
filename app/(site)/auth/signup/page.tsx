import type { Metadata } from "next";
import Link from "next/link";
import {
  RiArrowRightLine,
  RiBuilding2Line,
  RiUser3Line,
} from "@remixicon/react";
import { SectionHeader } from "@/components/SectionHeader";
import { userRoutes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "회원가입",
};

export default function AuthSignupPage() {
  return (
    <section className="page-section auth-page">
      <SectionHeader
        eyebrow="Join"
        title="회원가입 유형 선택"
        description="로컬체험 예약은 일반회원으로, 단체 프로그램 견적과 기관 상담은 기업·기관 회원으로 가입해 주세요."
        level="h1"
      />

      <div className="auth-choice-grid">
        <Link className="auth-choice-card" href="/auth/signup/general">
          <span className="auth-choice-icon">
            <RiUser3Line size={24} />
          </span>
          <span>
            <strong>일반회원으로 가입</strong>
            <small>체험 예약, 리뷰, 문의 내역을 한 곳에서 관리합니다.</small>
          </span>
          <RiArrowRightLine size={18} />
        </Link>
        <Link className="auth-choice-card" href="/auth/signup/corporate">
          <span className="auth-choice-icon">
            <RiBuilding2Line size={24} />
          </span>
          <span>
            <strong>기업·기관 회원으로 가입</strong>
            <small>패키지 견적, 단체 예약, 승인 기반 상담을 이용합니다.</small>
          </span>
          <RiArrowRightLine size={18} />
        </Link>
      </div>

      <div className="auth-bottom-action">
        <Link className="secondary-button" href={userRoutes.login}>
          가입된 아이디가 있어요
        </Link>
      </div>
    </section>
  );
}
