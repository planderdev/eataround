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
  title: "기업·기관 프로그램",
  description: "기업·기관 단체 행사에 맞춘 제주 로컬 체험 프로그램을 확인하세요.",
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
    description: "행사 목적과 참여 인원에 맞춰 일정과 옵션을 조합할 수 있는 단체 프로그램입니다.",
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
        eyebrow="Group Programs"
        title="기업·기관 프로그램"
        description="제주 로컬 체험 프로그램을 확인하고, 기업·기관회원 승인 후 단체 견적을 요청할 수 있습니다."
        level="h1"
      />

      <div className="package-list-hero">
        <div className="package-list-state">
          <RiLock2Line size={22} />
          <span>
            <strong>기업·기관회원 승인 후 견적 요청 가능</strong>
            <small>가입 신청이 승인되면 단체 견적 요청과 기관 전용 상담을 이용할 수 있습니다.</small>
          </span>
        </div>
        <div className="package-list-summary" aria-label="패키지 이용 요약">
          <span>프로그램 확인</span>
          <span>인원별 할인</span>
          <span>운영팀 견적 안내</span>
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
          <h2>인원별 할인 기준</h2>
          <p>10명 이상 단체부터 인원 구간별 할인율을 적용하고, 50명 이상은 별도 상담으로 최종 조건을 안내합니다.</p>
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
          단체 견적 요청
        </Link>
      </section>
    </section>
  );
}
