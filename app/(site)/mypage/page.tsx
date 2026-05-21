import type { Metadata } from "next";
import Link from "next/link";
import {
  RiArrowRightSLine,
  RiCalendarCheckLine,
  RiCoupon3Line,
  RiFileTextLine,
  RiHeart3Line,
  RiQuestionAnswerLine,
  RiShieldCheckLine,
  RiStarLine,
  RiUser3Line,
} from "@remixicon/react";
import { MypageHistoryCarousel, type MypageHistoryCardItem } from "@/components/MypageHistoryCarousel";
import { SectionHeader } from "@/components/SectionHeader";
import { myProfile, quoteHistory, reservationHistory, reviewHistory, wishlistItems } from "@/lib/mypage-data";
import { userRoutes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "마이페이지",
};

const dashboardItems = [
  {
    title: "예약내역",
    description: "일정, 인원, 예약방식과 결제 상태를 확인합니다.",
    href: `${userRoutes.me}/reservations`,
    icon: RiCalendarCheckLine,
    value: `${reservationHistory.length}건`,
  },
  {
    title: "견적내역",
    description: "B2B 견적 요청과 관리자 응답 흐름을 봅니다.",
    href: `${userRoutes.me}/quotes`,
    icon: RiFileTextLine,
    value: `${quoteHistory.length}건`,
  },
  {
    title: "찜",
    description: "관심 있는 로컬체험을 다시 비교합니다.",
    href: `${userRoutes.me}/wishlist`,
    icon: RiHeart3Line,
    value: `${wishlistItems.length}개`,
  },
  {
    title: "내 리뷰",
    description: "작성 가능한 후기와 호스트 답글을 관리합니다.",
    href: `${userRoutes.me}/reviews`,
    icon: RiStarLine,
    value: `${reviewHistory.length}건`,
  },
  {
    title: "회원정보",
    description: "연락처, 알림 수신, 기업회원 정보를 수정합니다.",
    href: `${userRoutes.me}/profile`,
    icon: RiUser3Line,
    value: myProfile.memberType,
  },
];

const summaryItems = [
  { label: "다가오는 예약", value: `${reservationHistory.filter((item) => item.statusTone !== "done").length}건`, note: "가장 가까운 일정 06.12" },
  { label: "진행 중 견적", value: `${quoteHistory.length}건`, note: "1건은 견적서 수신" },
  { label: "쿠폰", value: `${myProfile.couponCount}장`, note: "후기 작성 시 추가 지급" },
  { label: "포인트", value: myProfile.point, note: "예약 결제에 사용 가능" },
];

export default function MyPage() {
  const reservationPreviewItems: MypageHistoryCardItem[] = reservationHistory.map((item) => ({
    actionHref: `${userRoutes.me}/reservations/${item.id}`,
    actionLabel: "예약 상세",
    meta: [
      ["일정", item.schedule],
      ["인원", item.people],
      ["예약방식", item.reservationType],
    ],
    note: item.nextAction,
    status: item.status,
    title: item.title,
    tone: item.statusTone,
  }));
  const quotePreviewItems: MypageHistoryCardItem[] = quoteHistory.map((item) => ({
    actionHref: `${userRoutes.me}/quotes/${item.id}`,
    actionLabel: "견적 상세",
    meta: [
      ["프로그램", item.program],
      ["인원", item.people],
      ["예상견적", item.estimatedTotal],
    ],
    note: `${item.manager} · ${item.lastUpdated}`,
    status: item.status,
    title: item.title,
    tone: item.statusTone,
  }));

  return (
    <section className="page-section mypage-dashboard">
      <SectionHeader
        eyebrow="My Page"
        title="마이페이지"
        description="예약, 견적, 관심 체험, 후기와 계정 정보를 한곳에서 확인하세요."
        level="h1"
      />

      <section className="mypage-hero" aria-label="계정 요약">
        <div className="mypage-hero-copy">
          <span className="eyebrow">Account</span>
          <h2>{myProfile.name}님, 다음 로컬 일정을 준비하고 있어요.</h2>
          <p>{myProfile.organization} 계정으로 예약과 B2B 견적을 관리 중입니다. 진행 중인 요청은 상태가 바뀌면 이 화면에서 바로 확인할 수 있습니다.</p>
          <div className="mypage-hero-actions">
            <Link className="primary-button" href={`${userRoutes.me}/reservations`}>
              <RiCalendarCheckLine size={18} />
              예약 확인
            </Link>
            <Link className="secondary-button" href={userRoutes.b2bQuote}>
              <RiFileTextLine size={18} />
              새 견적 요청
            </Link>
          </div>
        </div>
        <aside className="mypage-account-card">
          <div className="mypage-account-main">
            <span className="mypage-avatar">{myProfile.organization.slice(0, 1)}</span>
            <span>
              <small>현재 계정</small>
              <strong>{myProfile.organization}</strong>
            </span>
          </div>
          <dl className="mypage-account-list">
            <div>
              <dt>회원 유형</dt>
              <dd>{myProfile.memberType}</dd>
            </div>
            <div>
              <dt>담당자</dt>
              <dd>{myProfile.name}</dd>
            </div>
            <div>
              <dt>이메일</dt>
              <dd>{myProfile.email}</dd>
            </div>
          </dl>
          <span className="mypage-verified">
            <RiShieldCheckLine size={16} />
            본인인증 완료
          </span>
        </aside>
      </section>

      <div className="mypage-summary-grid">
        {summaryItems.map((item) => (
          <article className="mypage-summary-card" key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{item.note}</small>
          </article>
        ))}
      </div>

      <section className="mypage-content-band" aria-label="진행 중인 이용 내역">
        <div className="mypage-content-grid">
          <section className="mypage-panel" aria-labelledby="mypage-upcoming-title">
            <header className="mypage-panel-head">
              <div>
                <span className="eyebrow">Upcoming</span>
                <h2 id="mypage-upcoming-title">다가오는 예약</h2>
              </div>
              <Link href={`${userRoutes.me}/reservations`}>
                전체보기
                <RiArrowRightSLine size={16} />
              </Link>
            </header>
            <MypageHistoryCarousel items={reservationPreviewItems} label="다가오는 예약 내역 슬라이드" />
          </section>

          <section className="mypage-panel" aria-labelledby="mypage-quote-title">
            <header className="mypage-panel-head">
              <div>
                <span className="eyebrow">B2B Quote</span>
                <h2 id="mypage-quote-title">진행 중 견적</h2>
              </div>
              <Link href={`${userRoutes.me}/quotes`}>
                전체보기
                <RiArrowRightSLine size={16} />
              </Link>
            </header>
            <MypageHistoryCarousel items={quotePreviewItems} label="진행 중 견적 내역 슬라이드" />
          </section>
        </div>
      </section>

      <section className="mypage-nav-grid" aria-label="마이페이지 메뉴">
        {dashboardItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link className="mypage-nav-card" href={item.href} key={item.title}>
              <span>
                <Icon size={22} />
              </span>
              <strong>{item.title}</strong>
              <small>{item.description}</small>
              <b>{item.value}</b>
              <RiArrowRightSLine aria-hidden size={18} />
            </Link>
          );
        })}
      </section>

      <section className="mypage-support-strip" aria-label="빠른 도움">
        <span>
          <RiCoupon3Line size={20} />
          쿠폰과 포인트는 결제 단계에서 자동 적용할 수 있습니다.
        </span>
        <Link href={userRoutes.help}>
          <RiQuestionAnswerLine size={18} />
          문의하기
        </Link>
      </section>
    </section>
  );
}
