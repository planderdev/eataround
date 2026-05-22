import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  RiArrowLeftLine,
  RiArrowRightLine,
  RiBuilding2Line,
  RiCalendarLine,
  RiCheckboxCircleLine,
  RiFileList3Line,
  RiGroupLine,
  RiMapPinLine,
  RiSparkling2Line,
} from "@remixicon/react";
import { ProductBadge } from "@/components/Badge";
import { EventCard } from "@/components/EventCard";
import { getEvent, getEvents } from "@/lib/content";
import { userRoutes } from "@/lib/routes";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const events = await getEvents();
  return events.map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) return {};
  return {
    title: event.title,
    description: event.summary,
  };
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();

  const events = await getEvents();
  const related = events.filter((item) => item.slug !== event.slug).slice(0, 3);
  const isOngoing = event.status === "ongoing";
  const applicantCount = isOngoing ? 24 : 86;
  const capacity = isOngoing ? 40 : 80;
  const remainingCount = Math.max(capacity - applicantCount, 0);
  const progressRate = Math.min(100, Math.round((applicantCount / capacity) * 100));
  const [startDate = event.period, endDate = event.period] = event.period.split(" - ").map((item) => item.trim());
  const listHref = isOngoing ? userRoutes.events : `${userRoutes.events}/ended`;
  const badgeTone = event.badge.includes("예약") ? "booking" : isOngoing ? "ongoing" : "neutral";
  const progressStyle = { "--progress": `${progressRate}%` } as CSSProperties;

  const programHighlights = [
    {
      title: "로컬 파트너 큐레이션",
      description: `${event.partner}와 함께 지역 생산자, 공간, 호스트를 연결해 행사의 밀도를 높입니다.`,
      icon: RiSparkling2Line,
    },
    {
      title: "현장 운영 동선 설계",
      description: "참여자 입장, 체험 이동, 식음 제공, 안내 인력을 행사 규모에 맞춰 배치합니다.",
      icon: RiMapPinLine,
    },
    {
      title: isOngoing ? "신청자 안내 관리" : "결과 자료 정리",
      description: isOngoing
        ? "모집 현황과 잔여 인원을 확인하며 신청자에게 일정과 준비사항을 안내합니다."
        : "참여 데이터, 현장 사진, 운영 피드백을 다음 제안에 활용할 수 있게 정리합니다.",
      icon: RiFileList3Line,
    },
  ];

  return (
    <main className="event-detail-page">
      <section className="event-detail-hero">
        <div className="event-detail-hero-media" aria-hidden="true">
          <img src={event.image} alt="" />
        </div>
        <div className="event-detail-hero-content">
          <Link className="event-detail-back" href={listHref}>
            <RiArrowLeftLine size={18} />
            행사 목록
          </Link>
          <div className="event-detail-title">
            <ProductBadge tone={badgeTone}>{event.badge}</ProductBadge>
            <h1>{event.title}</h1>
            <p>{event.summary}</p>
          </div>
          <div className="event-detail-hero-meta">
            <span>
              <RiCalendarLine size={17} />
              {event.period}
            </span>
            <span>
              <RiMapPinLine size={17} />
              {event.venue}
            </span>
            <span>
              <RiBuilding2Line size={17} />
              {event.partner}
            </span>
          </div>
        </div>
      </section>

      <section className="event-detail-info-rail" aria-label="행사 주요 정보">
        <article>
          <RiCalendarLine size={22} />
          <span>시작일</span>
          <strong>{startDate}</strong>
        </article>
        <article>
          <RiCalendarLine size={22} />
          <span>종료일</span>
          <strong>{endDate}</strong>
        </article>
        <article>
          <RiMapPinLine size={22} />
          <span>장소</span>
          <strong>{event.venue}</strong>
        </article>
        <article>
          <RiGroupLine size={22} />
          <span>{isOngoing ? "모집 현황" : "참여 규모"}</span>
          <strong>
            {applicantCount}/{capacity}명
          </strong>
        </article>
      </section>

      <div className="event-detail-layout">
        <div className="event-detail-main">
          <section className="event-detail-section">
            <div className="event-detail-section-header">
              <span>Event Story</span>
              <h2>행사 소개</h2>
            </div>
            <p className="event-detail-lead">{event.summary}</p>
            <div className="event-detail-copy-grid">
              <p>
                이더라운드는 제주의 지역 자원과 호스트의 이야기를 바탕으로 체험형 행사를 설계합니다. 단순한 방문이 아니라
                참여자가 지역의 맛과 사람, 공간을 자연스럽게 만날 수 있도록 일정과 운영 흐름을 구성합니다.
              </p>
              <p>
                행사 목적, 인원, 참여자 특성에 따라 동선과 프로그램을 조정하며 현장 안내부터 사후 결과 정리까지 하나의
                운영 경험으로 관리합니다.
              </p>
            </div>
          </section>

          <section className="event-detail-section">
            <div className="event-detail-section-header">
              <span>Operation</span>
              <h2>운영 방식</h2>
            </div>
            <ol className="event-detail-flow">
              <li>
                <b>01</b>
                <div>
                  <strong>참여 목적 확인</strong>
                  <p>행사 성격, 참여 인원, 이동 범위, 식음 조건을 확인해 운영 가능한 구성을 정리합니다.</p>
                </div>
              </li>
              <li>
                <b>02</b>
                <div>
                  <strong>프로그램과 호스트 매칭</strong>
                  <p>지역 호스트와 공간을 연결하고, 현장 상황에 맞춰 시간표와 안내 포인트를 세분화합니다.</p>
                </div>
              </li>
              <li>
                <b>03</b>
                <div>
                  <strong>현장 운영 및 결과 관리</strong>
                  <p>접수, 안내, 체험 진행, 사진 기록, 만족도 피드백까지 행사 전후의 흐름을 관리합니다.</p>
                </div>
              </li>
            </ol>
          </section>

          <section className="event-detail-section">
            <div className="event-detail-section-header">
              <span>Highlights</span>
              <h2>운영 포인트</h2>
            </div>
            <div className="event-detail-highlight-list">
              {programHighlights.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.title}>
                    <span>
                      <Icon size={22} />
                    </span>
                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.description}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="event-detail-section">
            <div className="event-detail-section-header">
              <span>{isOngoing ? "Apply" : "Archive"}</span>
              <h2>{isOngoing ? "신청 안내" : "행사 결과"}</h2>
            </div>
            <div className="event-detail-outcome-band">
              <div>
                <span>{isOngoing ? "현재 신청" : "누적 참여"}</span>
                <strong>{applicantCount}명</strong>
              </div>
              <div>
                <span>{isOngoing ? "잔여 인원" : "운영 회차"}</span>
                <strong>{isOngoing ? `${remainingCount}명` : "3회"}</strong>
              </div>
              <div>
                <span>상태</span>
                <strong>{isOngoing ? "신청 가능" : "결과 공개"}</strong>
              </div>
            </div>
            <p className="event-detail-note">
              {isOngoing
                ? "신청 후 운영팀이 일정, 참여 조건, 준비사항을 확인해 최종 안내합니다."
                : "종료된 행사는 기관 제안서와 포트폴리오 자료로 활용할 수 있도록 결과 내용을 정리해 제공합니다."}
            </p>
          </section>
        </div>

        <aside className="event-detail-sidebar" aria-label="행사 신청 정보">
          <div className="event-detail-cta">
            <span>{isOngoing ? "모집 진행중" : "포트폴리오"}</span>
            <h2>{isOngoing ? "단체 신청을 준비할까요?" : "비슷한 행사를 기획하고 있나요?"}</h2>
            <p>
              {isOngoing
                ? "희망 일정과 인원을 남기면 운영팀이 참여 가능 여부와 안내 사항을 확인합니다."
                : "종료된 행사와 유사한 프로그램을 기관 일정에 맞춰 다시 구성할 수 있습니다."}
            </p>
            <div className="event-detail-progress" style={progressStyle}>
              <div>
                <strong>{progressRate}%</strong>
                <span>
                  {applicantCount}/{capacity}명
                </span>
              </div>
              <span className="event-detail-progress-bar">
                <span />
              </span>
            </div>
            <Link className="primary-button full" href={isOngoing ? userRoutes.b2bQuote : userRoutes.b2b}>
              {isOngoing ? "단체 신청 문의" : "행사 기획 문의"}
              <RiArrowRightLine size={18} />
            </Link>
          </div>
          <div className="event-detail-side-note">
            <RiCheckboxCircleLine size={20} />
            <div>
              <strong>운영팀 확인 후 안내</strong>
              <p>일정, 장소, 인원, 프로그램 난이도에 따라 최종 조건이 달라질 수 있습니다.</p>
            </div>
          </div>
        </aside>
      </div>

      {related.length > 0 ? (
        <section className="event-detail-related">
          <div className="event-detail-section-header">
            <span>More Events</span>
            <h2>다른 행사 보기</h2>
          </div>
          <div className="event-detail-related-grid">
            {related.map((item) => (
              <EventCard event={item} key={item.slug} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
