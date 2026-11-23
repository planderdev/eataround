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
import { loadMyPageData, nearestScheduleLabel, upcomingReservations, type MyPageData } from "@/lib/me/overview";
import { userRoutes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "마이페이지",
};

function buildDashboardItems(data: MyPageData) {
  return [
    {
      title: "예약내역",
      description: "일정, 인원, 예약방식과 결제 상태를 확인합니다.",
      href: `${userRoutes.me}/reservations`,
      icon: RiCalendarCheckLine,
      value: `${data.reservations.length}건`,
    },
    {
      title: "견적내역",
      description: "B2B 견적 요청과 관리자 응답 흐름을 봅니다.",
      href: `${userRoutes.me}/quotes`,
      icon: RiFileTextLine,
      value: `${data.quotes.length}건`,
    },
    {
      title: "찜",
      description: "관심 있는 로컬체험을 다시 비교합니다.",
      href: `${userRoutes.me}/wishlist`,
      icon: RiHeart3Line,
      value: `${data.wishlist.length}개`,
    },
    {
      title: "내 리뷰",
      description: data.live ? "이용을 마친 체험의 후기를 남기고 고칩니다." : "작성 가능한 후기와 호스트 답글을 관리합니다.",
      href: `${userRoutes.me}/reviews`,
      icon: RiStarLine,
      value: `${data.reviews.length}건`,
    },
    {
      title: "회원정보",
      description: data.live ? "이름, 연락처, 소속과 비밀번호를 수정합니다." : "연락처, 알림 수신, 기업회원 정보를 수정합니다.",
      href: `${userRoutes.me}/profile`,
      icon: RiUser3Line,
      value: data.profile.memberType,
    },
  ];
}

function buildSummaryItems(data: MyPageData) {
  const upcoming = upcomingReservations(data.reservations);
  const openQuotes = data.quotes.filter((item) => item.statusTone === "pending" || item.statusTone === "received");
  const receivedQuotes = data.quotes.filter((item) => item.statusTone === "received").length;
  const nearest = nearestScheduleLabel(data.reservations);

  const common = [
    { label: "다가오는 예약", value: `${upcoming.length}건`, note: nearest ? `가장 가까운 일정 ${nearest}` : "예정된 일정 없음" },
    { label: "진행 중 견적", value: `${openQuotes.length}건`, note: receivedQuotes ? `${receivedQuotes}건은 견적서 수신` : "운영팀 검토 기준" },
  ];
  if (!data.live) {
    // 쿠폰·포인트는 아직 저장하는 곳이 없어 예시 화면에서만 보여 준다.
    return [
      ...common,
      { label: "쿠폰", value: `${data.profile.couponCount}장`, note: "후기 작성 시 추가 지급" },
      { label: "포인트", value: data.profile.point, note: "예약 결제에 사용 가능" },
    ];
  }
  const writable = data.reviews.filter((item) => item.status === "작성 가능").length;
  return [
    ...common,
    { label: "찜", value: `${data.wishlist.length}개`, note: "저장한 관심 체험" },
    { label: "작성 가능 후기", value: `${writable}건`, note: "이용을 마친 예약" },
  ];
}

export default async function MyPage() {
  const data = await loadMyPageData();
  const profile = data.profile;
  const dashboardItems = buildDashboardItems(data);
  const summaryItems = buildSummaryItems(data);
  const previewReservations = data.live ? upcomingReservations(data.reservations) : data.reservations;
  const previewQuotes = data.live ? data.quotes.filter((item) => item.statusTone === "pending" || item.statusTone === "received") : data.quotes;
  const accountName = profile.organization || profile.name;
  const verifiedLabel = !data.live
    ? "본인인증 완료"
    : profile.memberType === "기업회원"
      ? data.companyApproved
        ? "기업회원 승인 완료"
        : "기업회원 승인 대기"
      : null;
  const reservationPreviewItems: MypageHistoryCardItem[] = previewReservations.map((item) => ({
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
  const quotePreviewItems: MypageHistoryCardItem[] = previewQuotes.map((item) => ({
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
          <h2>{profile.name}님, 다음 로컬 일정을 준비하고 있어요.</h2>
          <p>{accountName} 계정으로 예약과 B2B 견적을 관리 중입니다. 진행 중인 요청은 상태가 바뀌면 이 화면에서 바로 확인할 수 있습니다.</p>
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
            <span className="mypage-avatar">{accountName.slice(0, 1)}</span>
            <span>
              <small>현재 계정</small>
              <strong>{accountName}</strong>
            </span>
          </div>
          <dl className="mypage-account-list">
            <div>
              <dt>회원 유형</dt>
              <dd>{profile.memberType}</dd>
            </div>
            <div>
              <dt>담당자</dt>
              <dd>{profile.name}</dd>
            </div>
            <div>
              <dt>이메일</dt>
              <dd>{profile.email}</dd>
            </div>
          </dl>
          {verifiedLabel ? (
            <span className="mypage-verified">
              <RiShieldCheckLine size={16} />
              {verifiedLabel}
            </span>
          ) : null}
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
            {reservationPreviewItems.length ? (
              <MypageHistoryCarousel items={reservationPreviewItems} label="다가오는 예약 내역 슬라이드" />
            ) : (
              <p className="mypage-panel-empty">예정된 예약이 없습니다.</p>
            )}
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
            {quotePreviewItems.length ? (
              <MypageHistoryCarousel items={quotePreviewItems} label="진행 중 견적 내역 슬라이드" />
            ) : (
              <p className="mypage-panel-empty">진행 중인 견적이 없습니다.</p>
            )}
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
          {data.live ? "예약 변경이나 결제가 끝난 예약의 취소는 문의로 남겨 주세요." : "쿠폰과 포인트는 결제 단계에서 자동 적용할 수 있습니다."}
        </span>
        <Link href={userRoutes.help}>
          <RiQuestionAnswerLine size={18} />
          문의하기
        </Link>
      </section>
    </section>
  );
}
