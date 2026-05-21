import type { Metadata } from "next";
import Link from "next/link";
import {
  RiArrowRightLine,
  RiBuilding2Line,
  RiLightbulbFlashLine,
  RiLock2Line,
  RiMapPinLine,
  RiRestaurant2Line,
  RiRouteLine,
  RiShieldCheckLine,
} from "@remixicon/react";
import { SectionHeader } from "@/components/SectionHeader";
import { getDiscountTiers, getPackagePrograms } from "@/lib/content";
import type { DiscountTier, PackageProgram } from "@/lib/data";
import { formatWon } from "@/lib/format";
import { userRoutes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "패키지 목록",
  description: "기업·기관 담당자를 위한 이더라운드 패키지 목록입니다.",
};

type ProgramMeta = {
  description: string;
  icon: typeof RiRestaurant2Line;
  outcome: string;
  title: string;
  tone: "class" | "tour" | "lecture" | "picnic";
};

const programMeta: Record<string, ProgramMeta> = {
  "food-class": {
    description: "조리 체험과 공동 식사를 중심으로 구성하는 팀빌딩형 패키지입니다.",
    icon: RiRestaurant2Line,
    outcome: "팀빌딩",
    title: "제주 미식 클래스",
    tone: "class",
  },
  "brewery-tour": {
    description: "양조장 방문과 마을 산책을 엮어 지역 스토리를 경험합니다.",
    icon: RiRouteLine,
    outcome: "현장 탐방",
    title: "양조장 마을 투어",
    tone: "tour",
  },
  "host-lecture": {
    description: "로컬 브랜드와 지역 콘텐츠를 강의형 프로그램으로 전달합니다.",
    icon: RiLightbulbFlashLine,
    outcome: "교육",
    title: "로컬 브랜드 강의",
    tone: "lecture",
  },
  "market-picnic": {
    description: "시장 탐방과 피크닉을 결합해 가족 참여 행사에 적합합니다.",
    icon: RiMapPinLine,
    outcome: "복지 행사",
    title: "전통시장 피크닉",
    tone: "picnic",
  },
};

function programView(program: PackageProgram) {
  return programMeta[program.id] ?? {
    description: "기관 목적과 인원에 맞춰 일정과 옵션을 조합할 수 있는 패키지입니다.",
    icon: RiBuilding2Line,
    outcome: program.type,
    title: program.title,
    tone: "class" as const,
  };
}

function tierLabel(tier: DiscountTier) {
  if (tier.min >= 50) return "50명 이상";
  if (tier.min >= 30) return "30~49명";
  if (tier.min >= 20) return "20~29명";
  if (tier.min >= 10) return "10~19명";
  return "1~9명";
}

function tierRateLabel(tier: DiscountTier) {
  if (tier.min >= 50) return "별도 문의";
  return tier.rate ? `${Math.round(tier.rate * 100)}%` : "정상가";
}

export default async function B2BPackagesPage() {
  const [programs, tiers] = await Promise.all([getPackagePrograms(), getDiscountTiers()]);

  return (
    <section className="page-section b2b-packages-page">
      <SectionHeader
        eyebrow="B2B Packages"
        title="패키지 목록"
        description="비로그인 상태에서도 프로그램은 확인할 수 있고, 견적 요청은 기업·기관 회원 승인 후 진행됩니다."
        level="h1"
      />

      <div className="package-list-hero">
        <div className="package-list-state">
          <RiLock2Line size={22} />
          <span>
            <strong>기업회원 로그인 후 견적 요청 가능</strong>
            <small>승인 대기 중인 회원은 담당자 확인 후 요청 권한이 활성화됩니다.</small>
          </span>
        </div>
        <div className="package-list-summary" aria-label="패키지 이용 요약">
          <span>프로그램 확인</span>
          <span>인원별 할인</span>
          <span>담당자 견적</span>
        </div>
      </div>

      <div className="b2b-program-catalog">
        {programs.map((program, index) => {
          const view = programView(program);
          const Icon = view.icon;
          return (
            <Link className="b2b-program-row" data-featured={index === 0} href={`${userRoutes.b2bPackages}/${program.id}`} key={program.id}>
              <span className="b2b-program-icon" data-tone={view.tone}>
                <Icon size={22} />
              </span>
              <span>
                <small>{view.outcome}</small>
                <strong>{view.title}</strong>
                <em>{view.description}</em>
              </span>
              <b>{program.type === "강의" ? formatWon(program.basePrice) : `${formatWon(program.basePrice)}~`}</b>
              <RiArrowRightLine size={18} />
            </Link>
          );
        })}
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
              <span>{tierLabel(tier)}</span>
              <strong>{tierRateLabel(tier)}</strong>
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
