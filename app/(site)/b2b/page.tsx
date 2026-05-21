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
import { B2BProgramSlider, type B2BProgramSlideItem } from "@/components/B2BProgramSlider";
import { EventCard } from "@/components/EventCard";
import { SectionHeader } from "@/components/SectionHeader";
import { getDiscountTiers, getEvents, getPackagePrograms } from "@/lib/content";
import type { DiscountTier, PackageProgram } from "@/lib/data";
import { formatWon } from "@/lib/format";
import { userRoutes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "기업·기관 패키지",
  description: "워크숍, 연수, 고객 초청 행사에 맞춘 제주 로컬 체험 패키지와 단체 견적을 안내합니다.",
};

type ProgramMeta = {
  description: string;
  icon: typeof RiRestaurant2Line;
  image: string;
  imageAlt: string;
  outcome: string;
  title: string;
  tone: "class" | "tour" | "lecture" | "picnic";
};

const b2bImages = {
  hero: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
  heroInset: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=900&q=80",
  workflow: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=80",
  discount: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80",
};

const programMeta: Record<string, ProgramMeta> = {
  "food-class": {
    description: "제주 로컬 식재료를 활용한 쿠킹·다이닝 체험으로 팀 교류와 공동 식사를 함께 운영합니다.",
    icon: RiRestaurant2Line,
    image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "로컬 식재료로 차린 테이블",
    outcome: "공동 식사·팀빌딩",
    title: "제주 미식 클래스",
    tone: "class",
  },
  "brewery-tour": {
    description: "양조장 방문과 마을 산책을 결합한 제주 전통주·지역 탐방 프로그램입니다.",
    icon: RiRouteLine,
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "여행지의 마을 풍경",
    outcome: "지역 탐방·스토리 투어",
    title: "양조장 마을 투어",
    tone: "tour",
  },
  "host-lecture": {
    description: "제주 로컬 브랜드와 지속가능한 지역 콘텐츠를 주제로 한 교육형 세션입니다.",
    icon: RiLightbulbFlashLine,
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "테이블에서 아이디어를 나누는 팀",
    outcome: "교육·인사이트 세션",
    title: "로컬 브랜드 강의",
    tone: "lecture",
  },
  "market-picnic": {
    description: "전통시장 탐방과 야외 피크닉을 연결한 가족·복지 행사형 프로그램입니다.",
    icon: RiMapPinLine,
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "피크닉에 어울리는 음식과 식탁",
    outcome: "복지·가족 참여형",
    title: "전통시장 피크닉",
    tone: "picnic",
  },
};

const useCases = [
  { title: "임직원 워크숍", tag: "Team", description: "팀빌딩, 리프레시, 신규 조직 온보딩 목적에 맞춰 소요 시간과 이동 동선을 조율합니다.", icon: RiGroupLine },
  { title: "기관 연수·MICE", tag: "MICE", description: "제주 방문 일정에 맞춰 로컬 미식·문화 체험을 반나절 또는 1일 코스로 구성합니다.", icon: RiBuilding2Line },
  { title: "교육 프로그램", tag: "Education", description: "지역 생산자, 로컬 브랜드, 지속가능성을 주제로 강의와 체험을 결합합니다.", icon: RiLightbulbFlashLine },
  { title: "복지·가족 행사", tag: "Family", description: "참여자 연령대와 동반 가족 여부에 맞춰 안전하고 쉬운 참여형 일정으로 운영합니다.", icon: RiCheckboxCircleLine },
];

const processSteps = [
  { title: "요청 정보 확인", description: "행사 목적, 예산, 참여자 특성, 희망 일정을 확인합니다.", icon: RiFileList3Line },
  { title: "프로그램 구성", description: "체험, 강의, 식사, 이동 옵션을 일정에 맞게 조합합니다.", icon: RiCalendarCheckLine },
  { title: "최종 견적 안내", description: "인원별 할인과 운영 조건을 반영해 최종 견적을 안내합니다.", icon: RiTeamLine },
];

function programView(program: PackageProgram) {
  return programMeta[program.id] ?? {
    description: "행사 목적과 참여 인원에 맞춰 일정과 옵션을 조합할 수 있는 단체 프로그램입니다.",
    icon: RiBuilding2Line,
    image: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "함께 모여 프로그램을 진행하는 사람들",
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
  const programSlides: B2BProgramSlideItem[] = programs.map((program) => {
    const view = programView(program);

    return {
      description: view.description,
      duration: program.duration,
      href: `${userRoutes.b2bPackages}/${program.id}`,
      image: view.image,
      imageAlt: view.imageAlt,
      outcome: view.outcome,
      price: `${formatWon(program.basePrice)}~`,
      title: view.title,
      tone: view.tone,
    };
  });

  return (
    <div className="b2b-page">
      <div className="b2b-band b2b-band--hero">
        <section className="b2b-hero page-section">
          <div className="b2b-hero-copy" data-aos="fade-up">
            <span className="eyebrow">기업·기관 패키지</span>
            <h1>제주 로컬 체험으로 완성하는 단체 프로그램</h1>
            <p>워크숍, 연수, 고객 초청 행사에 맞춰 쿠킹·전통주·마을투어·로컬 다이닝을 조합하고 견적 요청까지 연결합니다.</p>
            <div className="b2b-hero-actions">
              <Link className="primary-button" href={userRoutes.b2bQuote}>
                단체 견적 요청
                <RiArrowRightLine size={18} />
              </Link>
              <Link className="secondary-button" href={userRoutes.b2bPackages}>
                프로그램 보기
              </Link>
            </div>
            <dl className="b2b-hero-proof">
              <div>
                <dt>예약 유형</dt>
                <dd>문의형·패키지 견적</dd>
              </div>
              <div>
                <dt>견적 방식</dt>
                <dd>인원별 할인</dd>
              </div>
              <div>
                <dt>운영 기준</dt>
                <dd>10명 이상 단체</dd>
              </div>
            </dl>
          </div>
          <div className="b2b-hero-media" data-aos="fade-left" data-aos-delay="120">
            <img alt="제주 바다를 배경으로 한 단체 프로그램 이미지" src={b2bImages.hero} />
            <div className="b2b-hero-media-card">
              <img alt="테이블에 둘러앉은 워크숍 참가자" src={b2bImages.heroInset} />
              <span>
                <small>단체 프로그램</small>
                <strong>기간·인원·프로그램을 남기면 운영팀이 최종 견적을 안내합니다</strong>
              </span>
            </div>
          </div>
        </section>
      </div>

      <div className="b2b-band b2b-band--programs">
        <section className="page-section b2b-program-section">
          <SectionHeader eyebrow="Packages" title="목적별 추천 프로그램" href={userRoutes.b2bPackages} actionLabel="전체 프로그램 보기" />
          <div className="b2b-program-showcase">
            <div className="b2b-program-story" data-aos="fade-up">
              <span className="eyebrow">추천 구성</span>
              <h2>행사 목적에 맞는 제주 로컬 프로그램을 선택하세요</h2>
              <p>참여 인원, 소요 시간, 이동 조건에 따라 쿠킹·전통주·투어·피크닉 프로그램을 조합할 수 있습니다.</p>
              <dl>
                <div>
                  <dt>탐색 기준</dt>
                  <dd>지역·카테고리·소요시간·대상</dd>
                </div>
                <div>
                  <dt>견적 흐름</dt>
                  <dd>프로그램 선택 후 기간·인원 입력</dd>
                </div>
              </dl>
            </div>
            <B2BProgramSlider items={programSlides} />
          </div>
        </section>
      </div>

      <div className="b2b-band b2b-band--workflow">
        <section className="page-section b2b-use-section">
          <div className="b2b-flow-layout">
            <figure className="b2b-flow-image" data-aos="zoom-in">
              <img alt="회의 테이블에서 프로그램을 설계하는 팀" src={b2bImages.workflow} />
              <figcaption>일정, 장소, 모집 인원, 이동 조건을 함께 검토합니다</figcaption>
            </figure>
            <div className="b2b-flow-copy" data-aos="fade-up" data-aos-delay="120">
              <span className="eyebrow">Workflow</span>
              <h2>견적 요청부터 최종 안내까지</h2>
              <p>기업·기관회원이 기간, 인원, 프로그램, 옵션을 남기면 운영팀이 가능 여부와 최종 견적을 확인해 안내합니다.</p>
              <ol className="b2b-process-list">
                {processSteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <li data-aos="fade-up" data-aos-delay={String(80 + index * 70)} key={step.title}>
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
          </div>

          <SectionHeader eyebrow="Use Cases" title="단체 목적별 추천" />
          <div className="b2b-use-grid">
            {useCases.map((item, index) => {
              const Icon = item.icon;
              return (
                <article data-aos="fade-up" data-aos-delay={String(index * 60)} key={item.title}>
                  <span>{item.tag}</span>
                  <Icon size={24} />
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                </article>
              );
            })}
          </div>
        </section>
      </div>

      <div className="b2b-band b2b-band--discount">
        <section className="page-section b2b-discount-section">
          <div className="b2b-discount-copy" data-aos="fade-up">
            <span className="eyebrow">Discount</span>
            <h2>인원별 할인 기준</h2>
            <p>단체 규모에 따라 할인율과 운영 방식이 달라집니다. 50명 이상은 별도 상담으로 최종 조건을 안내합니다.</p>
            <Link className="secondary-button" href={userRoutes.b2bQuote}>
              내 인원으로 견적 요청
              <RiArrowRightLine size={18} />
            </Link>
          </div>
          <figure className="b2b-discount-visual" data-aos="zoom-in">
            <img alt="단체 식사와 행사를 위한 레스토랑 공간" src={b2bImages.discount} />
          </figure>
          <div className="b2b-discount-table" data-aos="fade-up" data-aos-delay="100">
            {tiers.map((tier) => (
              <div key={tier.min}>
                <span>{tierLabel(tier)}</span>
                <strong>{tierRateLabel(tier)}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>

      {portfolioEvents.length ? (
        <div className="b2b-band b2b-band--portfolio">
          <section className="page-section b2b-portfolio-section">
          <SectionHeader eyebrow="Portfolio" title="종료된 행사 사례" href="/events/ended" actionLabel="운영 사례 보기" />
          <div className="event-grid">
            {portfolioEvents.map((event) => (
              <EventCard event={event} key={event.slug} />
            ))}
          </div>
          </section>
        </div>
      ) : null}

      <div className="b2b-band b2b-band--final">
        <section className="page-section b2b-final-cta">
        <RiMapPinLine size={24} />
        <h2>일정과 인원만 정해져 있어도 요청할 수 있습니다</h2>
        <p>희망 기간, 참여 인원, 관심 프로그램을 남겨주시면 운영 가능한 구성과 견적을 안내합니다.</p>
        <Link className="primary-button" href={userRoutes.b2bQuote}>
          단체 견적 요청하기
          <RiArrowRightLine size={18} />
        </Link>
        </section>
      </div>
    </div>
  );
}
