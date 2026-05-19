import type { Metadata } from "next";
import Link from "next/link";
import { RiArrowRightLine, RiLock2Line, RiShieldCheckLine } from "@remixicon/react";
import { SectionHeader } from "@/components/SectionHeader";
import { getDiscountTiers, getPackagePrograms } from "@/lib/content";
import { formatWon } from "@/lib/format";
import { userRoutes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "패키지 목록",
  description: "기업·기관 담당자를 위한 이더라운드 패키지 목록입니다.",
};

export default async function B2BPackagesPage() {
  const [programs, tiers] = await Promise.all([getPackagePrograms(), getDiscountTiers()]);

  return (
    <section className="page-section">
      <SectionHeader
        eyebrow="B2B Packages"
        title="패키지 목록"
        description="비로그인 상태에서도 프로그램은 확인할 수 있고, 견적 요청은 기업·기관 회원 승인 후 진행됩니다."
        level="h1"
      />

      <div className="package-list-state">
        <RiLock2Line size={22} />
        <span>
          <strong>기업회원 로그인 후 견적 요청 가능</strong>
          <small>승인 대기 중인 회원은 담당자 확인 후 요청 권한이 활성화됩니다.</small>
        </span>
      </div>

      <div className="b2b-program-grid">
        {programs.map((program) => (
          <Link className="b2b-program-card" href={`${userRoutes.b2bPackages}/${program.id}`} key={program.id}>
            <span>{program.type}</span>
            <strong>{program.title}</strong>
            <small>{program.duration}</small>
            <b>{program.type === "강의" ? formatWon(program.basePrice) : `${formatWon(program.basePrice)} / 인`}</b>
            <small className="package-card-link">
              상세 보기
              <RiArrowRightLine size={16} />
            </small>
          </Link>
        ))}
      </div>

      <section className="package-tier-panel">
        <div>
          <RiShieldCheckLine size={22} />
          <h2>인원 구간별 할인율</h2>
          <p>RFP 기준에 따라 10명, 20명, 30명 단위로 체험 상품 할인율을 적용하고 50명 이상은 별도 상담으로 전환합니다.</p>
        </div>
        <div className="b2b-discount-table">
          {tiers.map((tier) => (
            <div key={tier.min}>
              <span>{tier.label}</span>
              <strong>{tier.rate ? `${Math.round(tier.rate * 100)}%` : "기본"}</strong>
            </div>
          ))}
        </div>
        <Link className="primary-button full" href={userRoutes.b2bQuote}>
          정식 견적 요청
        </Link>
      </section>
    </section>
  );
}
