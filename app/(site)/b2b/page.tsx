import type { Metadata } from "next";
import Link from "next/link";
import {
  RiArrowRightLine,
  RiBuilding2Line,
  RiCheckboxCircleLine,
  RiGroupLine,
  RiLightbulbFlashLine,
  RiMapPinLine,
} from "@remixicon/react";
import { EventCard } from "@/components/EventCard";
import { SectionHeader } from "@/components/SectionHeader";
import { getDiscountTiers, getEvents, getPackagePrograms } from "@/lib/content";
import { formatWon } from "@/lib/format";
import { userRoutes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "기업·기관 패키지",
  description: "기업과 기관을 위한 제주 로컬 체험, 워크숍, 교육 패키지를 설계합니다.",
};

const useCases = [
  { title: "워크숍", description: "팀 빌딩과 리프레시 목적의 반나절·1박2일 일정", icon: RiGroupLine },
  { title: "MICE", description: "제주 방문객을 위한 로컬 미식·문화 프로그램", icon: RiBuilding2Line },
  { title: "교육", description: "지역, 식문화, 지속가능성을 주제로 한 강의와 체험", icon: RiLightbulbFlashLine },
  { title: "복지", description: "임직원과 가족이 함께 참여하는 소규모 클래스", icon: RiCheckboxCircleLine },
];

export default async function B2BPage() {
  const [programs, tiers, events] = await Promise.all([getPackagePrograms(), getDiscountTiers(), getEvents()]);
  const portfolioEvents = events.filter((event) => event.status === "ended").slice(0, 2);

  return (
    <>
      <section className="b2b-hero page-section">
        <div className="b2b-hero-copy">
          <span className="eyebrow">B2B Package</span>
          <h1>기업·기관을 위한 제주 로컬 체험</h1>
          <p>기간, 인원, 목적에 맞춰 제주 로컬 프로그램을 구성합니다.</p>
          <div className="b2b-hero-actions">
            <Link className="primary-button" href={userRoutes.b2bQuote}>
              단체 견적 요청하기
              <RiArrowRightLine size={18} />
            </Link>
            <Link className="secondary-button" href={userRoutes.b2bPackages}>
              패키지 보기
            </Link>
          </div>
        </div>
        <div className="b2b-hero-panel" aria-label="패키지 핵심 정보">
          <article>
            <strong>10명부터</strong>
            <span>체험형 단체 일정</span>
          </article>
          <article>
            <strong>20·30명</strong>
            <span>인원 구간별 할인</span>
          </article>
          <article>
            <strong>50명 이상</strong>
            <span>담당자 별도 상담</span>
          </article>
        </div>
      </section>

      <section className="page-section">
        <SectionHeader eyebrow="Packages" title="추천 프로그램" href={userRoutes.b2bPackages} actionLabel="패키지 전체보기" />
        <div className="b2b-program-grid">
          {programs.slice(0, 4).map((program) => (
            <Link className="b2b-program-card" href={`${userRoutes.b2bPackages}/${program.id}`} key={program.id}>
              <span>{program.type}</span>
              <strong>{program.title}</strong>
              <small>{program.duration}</small>
              <b>{formatWon(program.basePrice)}~</b>
            </Link>
          ))}
        </div>
      </section>

      <section className="page-section b2b-use-section">
        <SectionHeader eyebrow="Use Cases" title="이런 담당자에게 맞아요" />
        <div className="b2b-use-grid">
          {useCases.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title}>
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
          <p>체험 상품은 단체 규모에 따라 운영 방식과 할인율이 달라집니다. 견적 요청 시 담당자가 최종 조건을 확인합니다.</p>
        </div>
        <div className="b2b-discount-table">
          {tiers.map((tier) => (
            <div key={tier.min}>
              <span>{tier.label}</span>
              <strong>{tier.rate ? `${Math.round(tier.rate * 100)}% 할인` : "기본가"}</strong>
            </div>
          ))}
        </div>
      </section>

      {portfolioEvents.length ? (
        <section className="page-section">
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
