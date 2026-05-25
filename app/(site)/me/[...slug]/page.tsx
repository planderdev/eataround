import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { RemixiconComponentType } from "@remixicon/react";
import {
  RiArrowLeftLine,
  RiArrowRightSLine,
  RiCalendarCheckLine,
  RiChat3Line,
  RiFileTextLine,
  RiHeart3Line,
  RiStarLine,
  RiTimeLine,
  RiUserSettingsLine,
} from "@remixicon/react";
import { StatusBadge } from "@/components/Badge";
import { ExperienceCard } from "@/components/ExperienceCard";
import { MyReviewList, type MyReviewItem } from "@/components/MyReviewList";
import { SectionHeader } from "@/components/SectionHeader";
import { InquiryDetailSection } from "@/components/mypage/InquiryDetailSection";
import { InquiryListSection } from "@/components/mypage/InquiryListSection";
import { ProfileSection } from "@/components/mypage/ProfileSection";
import { QuoteDetailSection } from "@/components/mypage/QuoteDetailSection";
import { QuoteListSection } from "@/components/mypage/QuoteListSection";
import { ReservationDetailSection } from "@/components/mypage/ReservationDetailSection";
import { ReservationListSection } from "@/components/mypage/ReservationListSection";
import { ReviewSection as MypageReviewSection } from "@/components/mypage/ReviewSection";
import { WishlistSection as MypageWishlistSection } from "@/components/mypage/WishlistSection";
import { getExperiences } from "@/lib/content";
import {
  inquiryHistory,
  myProfile,
  quoteHistory,
  reservationHistory,
  reviewHistory,
  wishlistItems,
} from "@/lib/mypage-data";
import { experiencePath, userRoutes } from "@/lib/routes";

type PageProps = {
  params: Promise<{ slug: string[] }>;
};

type PageKey = "reservations" | "quotes" | "inquiries" | "wishlist" | "reviews" | "profile";
type ExperienceList = Awaited<ReturnType<typeof getExperiences>>;

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
  inquiries: {
    title: "문의 내역",
    description: "문의 예약·상담 요청과 호스트 답변을 확인합니다.",
    icon: RiChat3Line,
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

const sectionActions: Record<PageKey, { href: string; label: string }> = {
  reservations: { href: userRoutes.experiences, label: "새 체험 찾기" },
  quotes: { href: userRoutes.b2bQuote, label: "새 견적 요청" },
  inquiries: { href: userRoutes.experiences, label: "문의 가능 체험 보기" },
  wishlist: { href: userRoutes.experiences, label: "체험 더보기" },
  reviews: { href: `${userRoutes.me}/reservations`, label: "이용 내역 보기" },
  profile: { href: userRoutes.help, label: "고객센터 문의" },
};

const sectionStats: Record<PageKey, { label: string; value: string; note: string }[]> = {
  reservations: [
    { label: "전체 예약", value: `${reservationHistory.length}건`, note: "최근 예약순" },
    { label: "다가오는 일정", value: `${reservationHistory.filter((item) => item.statusTone !== "done").length}건`, note: "확정/승인 대기 포함" },
    { label: "후기 가능", value: `${reservationHistory.filter((item) => item.statusTone === "done").length}건`, note: "쿠폰 지급 대상" },
  ],
  quotes: [
    { label: "전체 견적", value: `${quoteHistory.length}건`, note: "요청 기준" },
    { label: "검토 중", value: `${quoteHistory.filter((item) => item.statusTone === "pending").length}건`, note: "담당자 확인 중" },
    { label: "견적서 수신", value: `${quoteHistory.filter((item) => item.statusTone === "received").length}건`, note: "승인 대기" },
  ],
  inquiries: [
    { label: "전체 문의", value: `${inquiryHistory.length}건`, note: "접수 기준" },
    { label: "답변 대기", value: `${inquiryHistory.filter((item) => item.statusTone === "pending").length}건`, note: "호스트 확인 중" },
    { label: "답변 완료", value: `${inquiryHistory.filter((item) => item.statusTone === "received" || item.statusTone === "done").length}건`, note: "최신 회신순" },
  ],
  wishlist: [
    { label: "관심 체험", value: `${wishlistItems.length}개`, note: "저장된 체험" },
    { label: "가족 추천", value: "1개", note: "아이 동반 가능" },
    { label: "프리미엄", value: "1개", note: "호스트 특화" },
  ],
  reviews: [
    { label: "전체 후기", value: `${reviewHistory.length}건`, note: "작성 가능 포함" },
    { label: "작성 가능", value: `${reviewHistory.filter((item) => item.statusTone === "pending").length}건`, note: "쿠폰 지급 대상" },
    { label: "평균 별점", value: "5.0", note: "작성 완료 기준" },
  ],
  profile: [
    { label: "회원 유형", value: myProfile.memberType, note: "B2B 견적 가능" },
    { label: "쿠폰", value: `${myProfile.couponCount}장`, note: "보유 쿠폰" },
    { label: "포인트", value: myProfile.point, note: "결제 사용 가능" },
  ],
};

export function generateStaticParams() {
  return [
    ...tabs.map((item) => ({ slug: [item.key] })),
    ...reservationHistory.map((item) => ({ slug: ["reservations", item.id] })),
    ...quoteHistory.map((item) => ({ slug: ["quotes", item.id] })),
    ...inquiryHistory.map((item) => ({ slug: ["inquiries", item.id] })),
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
  const experiences = sectionKey === "wishlist" || sectionKey === "reviews" ? await getExperiences() : [];

  return (
    <section className="page-section me-page">
      <Link className="me-back-link" href={userRoutes.me}>
        <RiArrowLeftLine size={18} />
        마이페이지
      </Link>

      <SectionHeader
        eyebrow={detailId ? "Detail" : "My Page"}
        title={detailId ? `${page.title} 상세` : page.title}
        description={detailId ? "상태 변경 이력과 다음 액션을 확인하세요." : page.description}
        level="h1"
      />

      <nav className="tabs" aria-label="마이페이지 메뉴">
        {tabs.map((item) => (
          <Link aria-current={item.key === sectionKey ? "page" : undefined} className="tab" data-active={item.key === sectionKey} href={item.href} key={item.key}>
            {item.label}
          </Link>
        ))}
      </nav>

      <section className="me-section-overview" aria-label={`${page.title} 요약`}>
        <div className="me-section-overview-main">
          <span className="me-section-icon">
            <Icon size={26} />
          </span>
          <div>
            <span className="eyebrow">{detailId ? "Detail View" : "Overview"}</span>
            <h2>{detailId ? `${page.title} 상세 확인` : page.title}</h2>
            <p>{detailId ? "상세 정보와 진행 단계를 확인하고 필요한 다음 액션으로 이동하세요." : page.description}</p>
          </div>
        </div>
        <Link className="secondary-button" href={sectionActions[sectionKey].href}>
          {sectionActions[sectionKey].label}
          <RiArrowRightSLine size={16} />
        </Link>
      </section>

      <div className="me-section-stat-grid">
        {sectionStats[sectionKey].map((item) => (
          <article className="me-section-stat-card" key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{item.note}</small>
          </article>
        ))}
      </div>

      <div className="me-section-list">{detailId ? renderDetail(sectionKey, detailId, experiences) : renderSection(sectionKey, experiences)}</div>
    </section>
  );
}

function toPageKey(value?: string): PageKey | null {
  if (
    value === "reservations" ||
    value === "quotes" ||
    value === "inquiries" ||
    value === "wishlist" ||
    value === "reviews" ||
    value === "profile"
  )
    return value;
  return null;
}

function renderSection(sectionKey: PageKey, experiences: ExperienceList = []) {
  if (sectionKey === "reservations") return <ReservationListSection />;
  if (sectionKey === "quotes") return <QuoteListSection />;
  if (sectionKey === "inquiries") return <InquiryListSection />;
  if (sectionKey === "wishlist") return <MypageWishlistSection experiences={experiences} />;
  if (sectionKey === "reviews") return <MypageReviewSection experiences={experiences} />;
  return <ProfileSection />;
}

function renderDetail(sectionKey: PageKey, detailId: string, experiences: ExperienceList = []) {
  if (sectionKey === "reservations") {
    return <ReservationDetailSection id={detailId} />;
  }

  if (sectionKey === "quotes") {
    return <QuoteDetailSection id={detailId} />;
  }

  if (sectionKey === "inquiries") {
    return <InquiryDetailSection id={detailId} />;
  }

  return renderSection(sectionKey, experiences);
}

function ReservationCard({ card }: { card: (typeof reservationHistory)[number] }) {
  return (
    <article className="me-history-card" data-tone={card.statusTone}>
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
      <p className="me-history-note">{card.nextAction}</p>
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
    <article className="me-history-card" data-tone={card.statusTone}>
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
      <p className="me-history-note">{card.manager} · {card.lastUpdated}</p>
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
      <p className="me-detail-alert">{reservation.nextAction}</p>
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
      <p className="me-detail-alert">{quote.manager}가 최근 {quote.lastUpdated}에 상태를 업데이트했습니다.</p>
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

function WishlistSection({ experiences }: { experiences: ExperienceList }) {
  const wishlistProducts = wishlistItems
    .map((item) => item.href.split("?")[0].split("/").filter(Boolean).at(-1))
    .map((slug) => experiences.find((experience) => experience.slug === slug))
    .filter((experience): experience is ExperienceList[number] => Boolean(experience));

  return (
    <div className="card-grid">
      {wishlistProducts.map((experience) => (
        <ExperienceCard experience={experience} key={experience.slug} />
      ))}
    </div>
  );
}

function ReviewSection({ experiences }: { experiences: ExperienceList }) {
  const items: MyReviewItem[] = reviewHistory.map((item) => {
    const product = findReviewProduct(experiences, item);
    const productHref = product ? experiencePath(product.slug) : item.href;

    return {
      ...item,
      product: product
        ? {
            href: productHref,
            image: product.image,
            title: product.title,
          }
        : undefined,
      productHref,
    };
  });

  return <MyReviewList items={items} />;
}

function findReviewProduct(experiences: ExperienceList, item: (typeof reviewHistory)[number]) {
  const slug = item.href.split("?")[0].split("/").filter(Boolean).at(-1);

  return (
    experiences.find((experience) => experience.slug === slug) ??
    experiences.find((experience) => experience.title === item.title) ??
    experiences.find((experience) => experience.title.includes(item.title) || item.title.includes(experience.title))
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
