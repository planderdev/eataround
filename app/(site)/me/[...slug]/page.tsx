import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import type { RemixiconComponentType } from "@remixicon/react";
import {
  RiArrowLeftLine,
  RiArrowRightLine,
  RiCalendarCheckLine,
  RiEdit2Line,
  RiFileTextLine,
  RiHeart3Line,
  RiMailLine,
  RiPhoneLine,
  RiQuestionAnswerLine,
  RiShieldCheckLine,
  RiStarLine,
  RiTimeLine,
  RiUserSettingsLine,
} from "@remixicon/react";
import { SectionHeader } from "@/components/SectionHeader";
import {
  consentRows,
  myProfile,
  profileRows,
  quoteHistory,
  reservationHistory,
  reviewHistory,
  wishlistItems,
  type HistoryTone,
} from "@/lib/mypage-data";
import { userRoutes } from "@/lib/routes";

type PageProps = {
  params: Promise<{ slug: string[] }>;
};

type PageKey = "reservations" | "quotes" | "wishlist" | "reviews" | "profile";

const pageMap: Record<PageKey, { title: string; description: string; icon: RemixiconComponentType }> = {
  reservations: {
    title: "예약 내역",
    description: "예약 대기, 확정, 완료 상태와 일정 정보를 확인합니다.",
    icon: RiCalendarCheckLine,
  },
  quotes: {
    title: "견적 내역",
    description: "B2B 견적 요청과 관리자 응답, 예상 견적을 확인합니다.",
    icon: RiFileTextLine,
  },
  wishlist: {
    title: "찜",
    description: "관심 있는 로컬체험을 다시 비교하고 바로 예약합니다.",
    icon: RiHeart3Line,
  },
  reviews: {
    title: "내 리뷰",
    description: "작성 가능한 후기와 작성 완료된 리뷰를 관리합니다.",
    icon: RiStarLine,
  },
  profile: {
    title: "회원정보 수정",
    description: "연락처, 소속, 알림 수신 동의와 보안 상태를 관리합니다.",
    icon: RiUserSettingsLine,
  },
};

const tabs = Object.entries(pageMap).map(([key, page]) => ({
  key: key as PageKey,
  href: `${userRoutes.me}/${key}`,
  label: page.title,
}));

export function generateStaticParams() {
  return [
    ...tabs.map((item) => ({ slug: [item.key] })),
    ...reservationHistory.map((item) => ({ slug: ["reservations", item.id] })),
    ...quoteHistory.map((item) => ({ slug: ["quotes", item.id] })),
  ];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = pageMap[toPageKey(slug[0]) ?? "reservations"];
  return { title: page.title, description: page.description };
}

export default async function MeSectionPage({ params }: PageProps) {
  const { slug } = await params;
  const sectionKey = toPageKey(slug[0]);
  if (!sectionKey) notFound();

  const page = pageMap[sectionKey];
  const Icon = page.icon;
  const detailId = slug[1];

  return (
    <section className="page-section me-page">
      <Link className="journal-detail-back" href={userRoutes.me}>
        <RiArrowLeftLine size={18} />
        마이페이지
      </Link>

      <SectionHeader
        eyebrow={detailId ? "Detail" : "My Page"}
        title={detailId ? `${page.title} 상세` : page.title}
        description={detailId ? "상태 변경 이력과 다음 액션을 확인하세요." : page.description}
        level="h1"
      />

      <nav className="me-section-tabs" aria-label="마이페이지 메뉴">
        {tabs.map((item) => (
          <Link aria-current={item.key === sectionKey ? "page" : undefined} data-active={item.key === sectionKey} href={item.href} key={item.key}>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="me-section-panel">
        <span className="me-section-icon">
          <Icon size={26} />
        </span>
        <div className="me-section-list">
          {detailId ? renderDetail(sectionKey, detailId) : renderSection(sectionKey)}
        </div>
      </div>
    </section>
  );
}

function toPageKey(value?: string): PageKey | null {
  if (value === "reservations" || value === "quotes" || value === "wishlist" || value === "reviews" || value === "profile") return value;
  return null;
}

function renderSection(sectionKey: PageKey) {
  if (sectionKey === "reservations") return reservationHistory.map((card) => <ReservationCard card={card} key={card.id} />);
  if (sectionKey === "quotes") return quoteHistory.map((card) => <QuoteCard card={card} key={card.id} />);
  if (sectionKey === "wishlist") return <WishlistSection />;
  if (sectionKey === "reviews") return <ReviewSection />;
  return <ProfileSection />;
}

function renderDetail(sectionKey: PageKey, detailId: string) {
  if (sectionKey === "reservations") {
    const reservation = reservationHistory.find((item) => item.id === detailId);
    if (!reservation) notFound();
    return <ReservationDetail reservation={reservation} />;
  }

  if (sectionKey === "quotes") {
    const quote = quoteHistory.find((item) => item.id === detailId);
    if (!quote) notFound();
    return <QuoteDetail quote={quote} />;
  }

  return renderSection(sectionKey);
}

function ReservationCard({ card }: { card: (typeof reservationHistory)[number] }) {
  return (
    <article className="me-history-card">
      <header>
        <div>
          <small>{card.id}</small>
          <strong>{card.title}</strong>
        </div>
        <StatusBadge tone={card.statusTone}>{card.status}</StatusBadge>
      </header>
      <dl className="me-history-meta">
        <MetaItem label="일정" value={card.schedule} />
        <MetaItem label="인원" value={card.people} />
        <MetaItem label="예약방식" value={card.reservationType} />
        <MetaItem label="금액" value={card.amount} />
      </dl>
      <div className="me-history-actions">
        <Link className="secondary-button" href={`${userRoutes.me}/reservations/${card.id}`}>
          상세보기
        </Link>
        <Link className="primary-button" href={card.href}>
          다시 보기
        </Link>
      </div>
    </article>
  );
}

function QuoteCard({ card }: { card: (typeof quoteHistory)[number] }) {
  return (
    <article className="me-history-card">
      <header>
        <div>
          <small>{card.id}</small>
          <strong>{card.title}</strong>
        </div>
        <StatusBadge tone={card.statusTone}>{card.status}</StatusBadge>
      </header>
      <dl className="me-history-meta">
        <MetaItem label="프로그램" value={card.program} />
        <MetaItem label="기간" value={card.period} />
        <MetaItem label="인원" value={card.people} />
        <MetaItem label="예상견적" value={card.estimatedTotal} />
      </dl>
      <div className="me-history-actions">
        <Link className="secondary-button" href={`${userRoutes.me}/quotes/${card.id}`}>
          상세보기
        </Link>
        <Link className="primary-button" href={userRoutes.b2bQuote}>
          견적 수정 요청
        </Link>
      </div>
    </article>
  );
}

function ReservationDetail({ reservation }: { reservation: (typeof reservationHistory)[number] }) {
  return (
    <article className="me-detail-card">
      <header>
        <div>
          <small>{reservation.id}</small>
          <h2>{reservation.title}</h2>
        </div>
        <StatusBadge tone={reservation.statusTone}>{reservation.status}</StatusBadge>
      </header>
      <dl className="me-detail-grid">
        <MetaItem label="일정" value={reservation.schedule} />
        <MetaItem label="인원" value={reservation.people} />
        <MetaItem label="장소" value={reservation.location} />
        <MetaItem label="호스트" value={reservation.host} />
        <MetaItem label="예약방식" value={reservation.reservationType} />
        <MetaItem label="결제" value={reservation.payment} />
        <MetaItem label="금액" value={reservation.amount} />
        <MetaItem label="다음 액션" value={reservation.nextAction} />
      </dl>
      <Timeline items={reservation.timeline} activeIndex={reservation.statusTone === "pending" ? 1 : reservation.statusTone === "done" ? 3 : 2} />
      <div className="me-history-actions">
        <Link className="secondary-button" href={`${userRoutes.me}/reservations`}>
          목록으로
        </Link>
        <Link className="primary-button" href={reservation.href}>
          상품 보기
        </Link>
      </div>
    </article>
  );
}

function QuoteDetail({ quote }: { quote: (typeof quoteHistory)[number] }) {
  return (
    <article className="me-detail-card">
      <header>
        <div>
          <small>{quote.id}</small>
          <h2>{quote.title}</h2>
        </div>
        <StatusBadge tone={quote.statusTone}>{quote.status}</StatusBadge>
      </header>
      <dl className="me-detail-grid">
        <MetaItem label="프로그램" value={quote.program} />
        <MetaItem label="기간" value={quote.period} />
        <MetaItem label="인원" value={quote.people} />
        <MetaItem label="예상견적" value={quote.estimatedTotal} />
        <MetaItem label="담당자" value={quote.manager} />
        <MetaItem label="최근 업데이트" value={quote.lastUpdated} />
      </dl>
      <Timeline items={quote.timeline} activeIndex={quote.statusTone === "pending" ? 1 : quote.statusTone === "received" ? 2 : 2} />
      <div className="me-history-actions">
        <Link className="secondary-button" href={`${userRoutes.me}/quotes`}>
          목록으로
        </Link>
        <Link className="primary-button" href={userRoutes.b2bQuote}>
          새 견적 요청
        </Link>
      </div>
    </article>
  );
}

function WishlistSection() {
  return (
    <div className="me-wishlist-grid">
      {wishlistItems.map((item) => (
        <article className="me-wishlist-card" key={item.title}>
          <Link href={item.href}>
            <img alt={item.title} src={item.image} />
          </Link>
          <div>
            <span className="last-seat-badge" data-tone="stock">
              {item.badge}
            </span>
            <strong>{item.title}</strong>
            <small>{item.region} · {item.price}</small>
          </div>
          <Link className="primary-button full" href={item.href}>
            예약하러 가기
          </Link>
        </article>
      ))}
    </div>
  );
}

function ReviewSection() {
  return (
    <div className="me-review-list">
      {reviewHistory.map((item) => (
        <article className="me-review-card" key={item.title}>
          <header>
            <div>
              <small>{item.date}</small>
              <strong>{item.title}</strong>
            </div>
            <StatusBadge tone={item.statusTone}>{item.status}</StatusBadge>
          </header>
          <p>{item.text}</p>
          <div className="me-review-bottom">
            <span>{item.rating ? `별점 ${item.rating}.0` : "후기 미작성"}</span>
            <Link href={item.href}>
              {item.rating ? "후기 보기" : "후기 작성"}
              <RiArrowRightLine size={16} />
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}

function ProfileSection() {
  return (
    <div className="me-profile-grid">
      <article className="me-profile-card">
        <header>
          <div>
            <span className="eyebrow">Basic</span>
            <h2>기본 정보</h2>
          </div>
          <button className="secondary-button" type="button">
            <RiEdit2Line size={16} />
            수정
          </button>
        </header>
        <dl>
          {profileRows.map((row) => (
            <MetaItem key={row.label} label={row.label} value={row.value} />
          ))}
        </dl>
      </article>

      <article className="me-profile-card">
        <header>
          <div>
            <span className="eyebrow">Security</span>
            <h2>보안 및 알림</h2>
          </div>
          <RiShieldCheckLine size={22} />
        </header>
        <div className="me-profile-checks">
          <span>
            <RiMailLine size={18} />
            {myProfile.email}
          </span>
          <span>
            <RiPhoneLine size={18} />
            {myProfile.phone}
          </span>
          <span>
            <RiShieldCheckLine size={18} />
            본인인증 완료
          </span>
        </div>
      </article>

      <article className="me-profile-card me-profile-card-wide">
        <header>
          <div>
            <span className="eyebrow">Agreement</span>
            <h2>수신 및 개인정보 동의</h2>
          </div>
        </header>
        <dl>
          {consentRows.map((row) => (
            <MetaItem key={row.label} label={row.label} value={row.value} />
          ))}
        </dl>
      </article>
    </div>
  );
}

function StatusBadge({ children, tone }: { children: ReactNode; tone: HistoryTone }) {
  return (
    <span className="me-status-badge" data-tone={tone}>
      {children}
    </span>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function Timeline({ activeIndex, items }: { activeIndex: number; items: string[] }) {
  return (
    <ol className="me-timeline">
      {items.map((item, index) => (
        <li data-active={index <= activeIndex} key={item}>
          <span>
            <RiTimeLine size={15} />
          </span>
          {item}
        </li>
      ))}
    </ol>
  );
}
