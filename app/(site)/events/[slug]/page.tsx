import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
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
  const related = events.filter((item) => item.slug !== event.slug).slice(0, 2);
  const isOngoing = event.status === "ongoing";
  const applicantCount = isOngoing ? 24 : 86;
  const capacity = isOngoing ? 40 : 80;

  return (
    <section className="page-section">
      <div className="detail-gallery">
        <img src={event.image} alt={event.title} />
      </div>
      <div className="detail-summary">
        <span className="eyebrow">{event.badge}</span>
        <h1>{event.title}</h1>
        <p>{event.summary}</p>
        <div className="card-meta">
          <span>{event.period}</span>
          <span>{event.venue}</span>
          <span>{event.partner}</span>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-stack">
          <section className="detail-section">
            <h2>행사 소개</h2>
            <p>{event.summary}</p>
            <p>로컬 호스트와 참여자가 만나는 시간으로 준비되며, 일정과 장소는 현장 상황에 맞춰 세심하게 안내됩니다.</p>
          </section>
          <section className="detail-section">
            <h2>운영 정보</h2>
            <ul className="check-list">
              <li>기간 : {event.period}</li>
              <li>장소 : {event.venue}</li>
              <li>파트너 : {event.partner}</li>
              <li>상태 : {event.status === "ongoing" ? "진행중" : "종료"}</li>
              <li>모집 인원 : {applicantCount}/{capacity}명</li>
            </ul>
          </section>
          <section className="detail-section">
            <h2>{isOngoing ? "신청 안내" : "행사 결과"}</h2>
            <div className="event-outcomes">
              <article>
                <span>{isOngoing ? "모집" : "참여"}</span>
                <strong>{applicantCount}명</strong>
              </article>
              <article>
                <span>{isOngoing ? "잔여" : "협업"}</span>
                <strong>{isOngoing ? `${capacity - applicantCount}명` : "3팀"}</strong>
              </article>
              <article>
                <span>{isOngoing ? "상태" : "성과"}</span>
                <strong>{isOngoing ? "신청 가능" : "포트폴리오 공개"}</strong>
              </article>
            </div>
            <p>
              {isOngoing
                ? "신청 후 담당자가 일정과 참여 조건을 확인해 최종 안내합니다."
                : "종료된 행사는 기관·브랜드 협업 제안 시 참고할 수 있는 운영 사례로 활용됩니다."}
            </p>
          </section>
        </div>
        <aside className="detail-stack">
          <section className="detail-section event-apply-panel">
            <span className="eyebrow">{isOngoing ? "Apply" : "Portfolio"}</span>
            <h2>{isOngoing ? "행사 신청" : "결과 자료 문의"}</h2>
            <p>{isOngoing ? "모집 인원과 장소를 확인한 뒤 신청해 주세요." : "기관 제안서에 필요한 결과 자료를 요청할 수 있습니다."}</p>
            <Link className="primary-button full" href={isOngoing ? userRoutes.b2bQuote : userRoutes.b2b}>
              {isOngoing ? "단체 신청 문의" : "협업 문의"}
            </Link>
          </section>
          <section className="detail-section">
            <h2>다른 행사</h2>
            <div className="detail-stack">
              {related.map((item) => (
                <EventCard event={item} key={item.slug} />
              ))}
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}
