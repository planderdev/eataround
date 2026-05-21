import type { RemixiconComponentType } from "@remixicon/react";
import {
  RiArticleLine,
  RiBarChartBoxLine,
  RiBookOpenLine,
  RiBuilding2Line,
  RiCalendarCheckLine,
  RiCalendarLine,
  RiFileList3Line,
  RiFileTextLine,
  RiGroupLine,
  RiImageLine,
  RiLockPasswordLine,
  RiMegaphoneLine,
  RiSettings3Line,
  RiShieldUserLine,
  RiShoppingBag3Line,
  RiStore2Line,
  RiUserSettingsLine,
} from "@remixicon/react";

export type AdminNavGroup = "홈" | "회원" | "예약·상품" | "콘텐츠" | "B2B" | "설정";

export type AdminNavItem = {
  id: string;
  label: string;
  href: string;
  icon: RemixiconComponentType;
  group: AdminNavGroup;
  badge?: "1차" | "최우선" | "SUPER";
};

export type AdminRouteConfig = {
  key: string;
  title: string;
  eyebrow: string;
  description: string;
  primaryAction?: string;
  secondaryAction?: string;
  mode: "dashboard" | "list" | "form" | "calendar" | "settings";
};

export const adminNavItems: AdminNavItem[] = [
  { id: "dashboard", label: "대시보드", href: "/admin/dashboard", icon: RiBarChartBoxLine, group: "홈", badge: "1차" },
  { id: "members-general", label: "일반회원", href: "/admin/members/general", icon: RiGroupLine, group: "회원" },
  { id: "members-corporate", label: "기업·단체회원", href: "/admin/members/corporate", icon: RiBuilding2Line, group: "회원" },
  { id: "products", label: "상품 목록", href: "/admin/products", icon: RiStore2Line, group: "예약·상품" },
  { id: "products-new", label: "상품 등록", href: "/admin/products/new", icon: RiShoppingBag3Line, group: "예약·상품" },
  { id: "product-categories", label: "카테고리", href: "/admin/products/categories", icon: RiFileList3Line, group: "예약·상품" },
  { id: "reservations", label: "예약 목록", href: "/admin/reservations", icon: RiCalendarCheckLine, group: "예약·상품", badge: "최우선" },
  { id: "reservation-schedules", label: "회차·재고", href: "/admin/reservations/schedules", icon: RiCalendarLine, group: "예약·상품", badge: "최우선" },
  { id: "events-ongoing", label: "진행중 행사", href: "/admin/events/ongoing", icon: RiMegaphoneLine, group: "콘텐츠" },
  { id: "events-closed", label: "종료된 행사", href: "/admin/events/closed", icon: RiArticleLine, group: "콘텐츠" },
  { id: "banners", label: "배너관리", href: "/admin/banners", icon: RiImageLine, group: "콘텐츠" },
  { id: "curations", label: "기획전관리", href: "/admin/curations", icon: RiFileList3Line, group: "콘텐츠" },
  { id: "journal", label: "저널관리", href: "/admin/journal", icon: RiBookOpenLine, group: "콘텐츠" },
  { id: "packages", label: "패키지관리", href: "/admin/packages", icon: RiBuilding2Line, group: "B2B" },
  { id: "quotes", label: "견적관리", href: "/admin/quotes", icon: RiFileTextLine, group: "B2B" },
  { id: "reviews", label: "리뷰관리", href: "/admin/reviews", icon: RiShieldUserLine, group: "콘텐츠" },
  { id: "settings-admins", label: "관리자 계정", href: "/admin/settings/admins", icon: RiUserSettingsLine, group: "설정", badge: "SUPER" },
  { id: "settings-site", label: "사이트 기본정보", href: "/admin/settings/site", icon: RiSettings3Line, group: "설정" },
  { id: "settings-policies", label: "약관·정책", href: "/admin/settings/policies", icon: RiLockPasswordLine, group: "설정", badge: "SUPER" },
];

export const adminRouteConfigs: AdminRouteConfig[] = [
  {
    key: "dashboard",
    title: "대시보드",
    eyebrow: "Dashboard",
    description: "오늘 예약, 매출, 미처리 견적, 진행 행사 등 운영 지표를 한 화면에서 확인합니다.",
    primaryAction: "예약 처리",
    secondaryAction: "견적 검토",
    mode: "dashboard",
  },
  {
    key: "members/general",
    title: "일반회원",
    eyebrow: "Members",
    description: "일반회원의 가입 경로, 예약 건수, 누적 결제액, 상태를 관리합니다.",
    primaryAction: "회원 내보내기",
    mode: "list",
  },
  {
    key: "members/corporate",
    title: "기업·단체회원",
    eyebrow: "Corporate Members",
    description: "기관 정보와 승인 상태를 검토하고 패키지 견적 접근 권한을 제어합니다.",
    primaryAction: "승인 안내",
    mode: "list",
  },
  {
    key: "products",
    title: "상품 목록",
    eyebrow: "Products",
    description: "상품, 카테고리, 지역, 예약유형, 노출상태, 최근 예약수를 관리합니다.",
    primaryAction: "상품 등록",
    secondaryAction: "일괄 노출변경",
    mode: "list",
  },
  {
    key: "products/new",
    title: "상품 등록",
    eyebrow: "Product Editor",
    description: "기본정보, 미디어, 상세 콘텐츠, 가격·예약, 회차·재고, 연관 설정을 탭 구조로 입력합니다.",
    primaryAction: "상품 저장",
    secondaryAction: "임시저장",
    mode: "form",
  },
  {
    key: "products/categories",
    title: "카테고리 관리",
    eyebrow: "Categories",
    description: "홈 아이콘 카테고리와 상품 카테고리 트리를 2단계까지 관리합니다.",
    primaryAction: "카테고리 추가",
    mode: "list",
  },
  {
    key: "reservations",
    title: "예약 목록",
    eyebrow: "Reservations",
    description: "예약번호, 이용일정, 결제상태, 예약상태, 회원구분을 기준으로 승인 흐름을 처리합니다.",
    primaryAction: "예약 확정",
    secondaryAction: "메일 발송",
    mode: "list",
  },
  {
    key: "reservations/schedules",
    title: "회차·재고 관리",
    eyebrow: "Schedules",
    description: "캘린더에서 날짜·시간·팀수·인원 재고를 확인하고 일괄 오픈/마감합니다.",
    primaryAction: "회차 추가",
    secondaryAction: "반복 등록",
    mode: "calendar",
  },
  {
    key: "events/ongoing",
    title: "진행중 행사",
    eyebrow: "Ongoing Events",
    description: "현재 모집 또는 진행 중인 행사와 신청자 상태를 운영합니다.",
    primaryAction: "행사 등록",
    mode: "list",
  },
  {
    key: "events/closed",
    title: "종료된 행사",
    eyebrow: "Closed Events",
    description: "종료된 행사를 포트폴리오 콘텐츠로 전환하고 결과 요약을 관리합니다.",
    primaryAction: "결과 등록",
    mode: "list",
  },
  {
    key: "packages",
    title: "패키지관리",
    eyebrow: "기업·기관 패키지",
    description: "B2B 견적 단위가 되는 묶음 상품, 옵션, 인원 구간별 할인율을 관리합니다.",
    primaryAction: "패키지 등록",
    mode: "form",
  },
  {
    key: "quotes",
    title: "견적관리",
    eyebrow: "Quotes",
    description: "기관 견적 요청을 검토하고 금액 조정, 발송, 예약 전환 흐름을 처리합니다.",
    primaryAction: "견적서 발송",
    secondaryAction: "예약 전환",
    mode: "list",
  },
  {
    key: "banners",
    title: "배너관리",
    eyebrow: "Banners",
    description: "히어로, 이벤트, 기획전, B2B CTA, 리스트 상단 슬롯을 관리합니다.",
    primaryAction: "배너 등록",
    mode: "list",
  },
  {
    key: "curations",
    title: "기획전관리",
    eyebrow: "Curations",
    description: "테마 큐레이션, 포함 상품, 노출기간, 페이지뷰를 관리합니다.",
    primaryAction: "기획전 등록",
    mode: "list",
  },
  {
    key: "journal",
    title: "저널관리",
    eyebrow: "Journal",
    description: "로컬 스토리 콘텐츠의 발행 상태, SEO, 연관 상품 추천을 관리합니다.",
    primaryAction: "저널 작성",
    mode: "list",
  },
  {
    key: "reviews",
    title: "리뷰관리",
    eyebrow: "Reviews",
    description: "리뷰 노출 상태, 신고 누적, 호스트 답변을 검수합니다.",
    primaryAction: "선택 리뷰 노출",
    mode: "list",
  },
  {
    key: "settings/admins",
    title: "관리자 계정",
    eyebrow: "Admin Accounts",
    description: "SUPER_ADMIN과 OPERATOR 계정, 초대, 역할 변경, 잠금 상태를 관리합니다.",
    primaryAction: "관리자 초대",
    mode: "settings",
  },
  {
    key: "settings/site",
    title: "사이트 기본정보",
    eyebrow: "Site Settings",
    description: "사업자 정보, 고객센터, 푸터, 기본 SEO, 외부 연동 키를 관리합니다.",
    primaryAction: "설정 저장",
    mode: "settings",
  },
  {
    key: "settings/policies",
    title: "약관·정책",
    eyebrow: "Policies",
    description: "이용약관, 개인정보처리방침, 환불정책, 취소·환불 템플릿을 버전 관리합니다.",
    primaryAction: "새 버전 발행",
    mode: "settings",
  },
];

export const adminRouteSlugs = adminRouteConfigs.map((route) => ({
  slug: route.key.split("/"),
}));

export function getAdminRouteConfig(key: string) {
  return adminRouteConfigs.find((route) => route.key === key);
}

export function getCurrentAdminNavItem(pathname: string) {
  return [...adminNavItems]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
}
