import type { Metadata } from "next";
import Link from "next/link";
import {
  RiArrowRightLine,
  RiBuilding2Line,
  RiCalendarCheckLine,
  RiCheckboxCircleLine,
  RiFileList3Line,
  RiGroupLine,
  RiLightbulbFlashLine,
  RiMapPinLine,
  RiRestaurant2Line,
  RiRouteLine,
  RiTeamLine,
} from "@remixicon/react";
import { EventCard } from "@/components/EventCard";
import { SectionHeader } from "@/components/SectionHeader";
import { getDiscountTiers, getEvents, getPackagePrograms } from "@/lib/content";
import type { DiscountTier, PackageProgram } from "@/lib/data";
import { formatWon } from "@/lib/format";
import { userRoutes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "기업·기관 패키지",
  description: "기업과 기관을 위한 제주 로컬 체험, 워크숍, 교육 패키지를 설계합니다.",
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
    description: "로컬 식재료와 조리 체험을 중심으로 팀 교류 시간을 설계합니다.",
    icon: RiRestaurant2Line,
    outcome: "공동 식사·팀빌딩",
    title: "제주 미식 클래스",
    tone: "class",
  },
  "brewery-tour": {
    description: "마을 산책과 양조장 방문을 묶어 지역 이해도를 높이는 코스입니다.",
    icon: RiRouteLine,
    outcome: "지역 탐방·스토리 투어",
    title: "양조장 마을 투어",
    tone: "tour",
  },
  "host-lecture": {
    description: "로컬 브랜드, 지역 콘텐츠, 지속가능성을 주제로 강의를 구성합니다.",
    icon: RiLightbulbFlashLine,
    outcome: "교육·인사이트 세션",
    title: "로컬 브랜드 강의",
    tone: "lecture",
  },
  "market-picnic": {
    description: "전통시장과 야외 피크닉을 연결해 가족·복지 행사에 맞춥니다.",
    icon: RiMapPinLine,
    outcome: "복지·가족 참여형",
    title: "전통시장 피크닉",
    tone: "picnic",
  },
};

const useCases = [
  { title: "임직원 워크숍", tag: "Team", description: "팀빌딩과 리프레시 목적에 맞춰 체험 강도와 이동 동선을 조정합니다.", icon: RiGroupLine },
  { title: "기관 연수·MICE", tag: "MICE", description: "제주 방문객을 위한 로컬 미식·문화 프로그램을 반나절 또는 1일 코스로 구성합니다.", icon: RiBuilding2Line },
  { title: "교육 프로그램", tag: "Education", description: "지역 생산자, 로컬 브랜드, 지속가능성을 주제로 강의와 체험을 결합합니다.", icon: RiLightbulbFlashLine },
  { title: "복지·가족 행사", tag: "Family", description: "참여자 연령대와 동반 가족 여부에 맞춰 안전하고 쉬운 참여형 일정으로 조율합니다.", icon: RiCheckboxCircleLine },
];

const processSteps = [
  { title: "목적 정리", description: "행사 목표, 예산, 참여자 특성을 먼저 확인합니다.", icon: RiFileList3Line },
  { title: "프로그램 조합", description: "체험·강의·이동·식사 옵션을 일정 단위로 묶습니다.", icon: RiCalendarCheckLine },
  { title: "견적 확정", description: "인원별 할인과 운영 조건을 반영해 최종안을 안내합니다.", icon: RiTeamLine },
];

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
  return tier.rate ? `${Math.round(tier.rate * 100)}% 할인` : "정상가";
}

export default async function B2BPage() {
  const [programs, tiers, events] = await Promise.all([getPackagePrograms(), getDiscountTiers(), getEvents()]);
  const portfolioEvents = events.filter((event) => event.status === "ended").slice(0, 2);
  const featuredProgram = programs[0];
  const secondaryPrograms = programs.slice(1, 4);

  return (
    <>
      <section className="b2b-hero page-section">
        <div className="b2b-hero-copy">
          <span className="eyebrow">B2B Package</span>
          <h1>기업·기관을 위한 제주 로컬 체험 설계</h1>
          <p>기간, 인원, 목적에 맞춰 체험·강의·투어를 조합하고 단체 운영에 필요한 견적과 동선을 함께 정리합니다.</p>
          <div className="b2b-hero-actions">
            <Link className="primary-button" href={userRoutes.b2bQuote}>
              단체 견적 요청하기
              <RiArrowRightLine size={18} />
            </Link>
            <Link className="secondary-button" href={userRoutes.b2bPackages}>
              패키지 보기
            </Link>
          </div>
          <dl className="b2b-hero-proof">
            <div>
              <dt>운영 단위</dt>
              <dd>10명부터</dd>
            </div>
            <div>
              <dt>견적 방식</dt>
              <dd>인원별 할인</dd>
            </div>
            <div>
              <dt>상담 기준</dt>
              <dd>50명+ 별도 설계</dd>
            </div>
          </dl>
        </div>
        <aside className="b2b-hero-panel" aria-label="패키지 설계 기준">
          <header>
            <span className="eyebrow">Quote Guide</span>
            <strong>담당자가 먼저 확인하는 기준</strong>
          </header>
          <article data-tone="team">
            <small>01</small>
            <strong>참여 인원</strong>
            <span>10·20·30명 구간별 운영 방식과 할인율을 나눕니다.</span>
          </article>
          <article data-tone="time">
            <small>02</small>
            <strong>소요 시간</strong>
            <span>90분 강의부터 반나절 체험까지 일정 밀도를 조절합니다.</span>
          </article>
          <article data-tone="place">
            <small>03</small>
            <strong>이동 조건</strong>
            <span>장소, 식사, 차량 옵션을 포함해 실행 가능성을 확인합니다.</span>
          </article>
        </aside>
      </section>

      <section className="page-section b2b-program-section">
        <SectionHeader eyebrow="Packages" title="목적별 추천 프로그램" href={userRoutes.b2bPackages} actionLabel="패키지 전체보기" />
        <div className="b2b-program-layout">
          {featuredProgram ? (
            <Link className="b2b-program-feature" href={`${userRoutes.b2bPackages}/${featuredProgram.id}`}>
              {(() => {
                const view = programView(featuredProgram);
                const Icon = view.icon;
                return (
                  <>
                    <span className="b2b-program-icon" data-tone={view.tone}>
                      <Icon size={24} />
                    </span>
                    <span className="eyebrow">Featured Package</span>
                    <strong>{view.title}</strong>
                    <p>{view.description}</p>
                    <dl>
                      <div>
                        <dt>운영 시간</dt>
                        <dd>{featuredProgram.duration}</dd>
                      </div>
                      <div>
                        <dt>기대 효과</dt>
                        <dd>{view.outcome}</dd>
                      </div>
                    </dl>
                    <b>{formatWon(featuredProgram.basePrice)}~</b>
                  </>
                );
              })()}
            </Link>
          ) : null}

          <div className="b2b-program-list">
            {secondaryPrograms.map((program) => {
              const view = programView(program);
              const Icon = view.icon;
              return (
                <Link className="b2b-program-row" href={`${userRoutes.b2bPackages}/${program.id}`} key={program.id}>
                  <span className="b2b-program-icon" data-tone={view.tone}>
                    <Icon size={22} />
                  </span>
                  <span>
                    <small>{view.outcome}</small>
                    <strong>{view.title}</strong>
                    <em>{view.description}</em>
                  </span>
                  <b>{formatWon(program.basePrice)}~</b>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="page-section b2b-use-section">
        <div className="b2b-section-band">
          <div>
            <span className="eyebrow">Workflow</span>
            <h2>상담 전환까지 한 흐름으로 보이게</h2>
            <p>담당자가 검토해야 할 정보를 단계별로 모아, 프로그램 선택에서 견적 요청까지 끊기지 않게 연결합니다.</p>
          </div>
          <ol className="b2b-process-list">
            {processSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <li key={step.title}>
                  <span>
                    <Icon size={20} />
                  </span>
                  <small>{String(index + 1).padStart(2, "0")}</small>
                  <strong>{step.title}</strong>
                  <p>{step.description}</p>
                </li>
              );
            })}
          </ol>
        </div>

        <SectionHeader eyebrow="Use Cases" title="이런 담당자에게 맞아요" />
        <div className="b2b-use-grid">
          {useCases.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title}>
                <span>{item.tag}</span>
                <Icon size={24} />
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="page-section b2b-discount-section">
        <div className="b2b-discount-copy">
          <span className="eyebrow">Discount</span>
          <h2>인원 구간에 맞춘 견적 구조</h2>
          <p>체험 상품은 단체 규모에 따라 운영 방식과 할인율이 달라집니다. 견적 요청 후 담당자가 최종 조건을 확인해 안내합니다.</p>
          <Link className="secondary-button" href={userRoutes.b2bQuote}>
            내 인원으로 견적 보기
            <RiArrowRightLine size={18} />
          </Link>
        </div>
        <div className="b2b-discount-table">
          {tiers.map((tier) => (
            <div key={tier.min}>
              <span>{tierLabel(tier)}</span>
              <strong>{tierRateLabel(tier)}</strong>
            </div>
          ))}
        </div>
      </section>

      {portfolioEvents.length ? (
        <section className="page-section b2b-portfolio-section">
          <SectionHeader eyebrow="Portfolio" title="진행 사례" href="/events/ended" actionLabel="사례 더보기" />
          <div className="event-grid">
            {portfolioEvents.map((event) => (
              <EventCard event={event} key={event.slug} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="page-section b2b-final-cta">
        <RiMapPinLine size={24} />
        <h2>일정과 인원만 정해져 있어도 괜찮습니다</h2>
        <p>프로그램 선택, 기간, 인원, 옵션을 남기면 담당자가 운영 가능한 구성으로 다시 안내합니다.</p>
        <Link className="primary-button" href={userRoutes.b2bQuote}>
          지금 견적 요청하기
          <RiArrowRightLine size={18} />
        </Link>
      </section>
    </>
  );
}
