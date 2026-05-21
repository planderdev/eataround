import { experiencePath, userRoutes } from "@/lib/routes";

export type HistoryTone = "pending" | "confirmed" | "done" | "received" | "cancelled";

export const myProfile = {
  name: "이슬안",
  organization: "플랜더",
  memberType: "기업회원",
  email: "planner@plander.co.kr",
  phone: "010-4821-2036",
  joinedAt: "2026.04.08",
  point: "12,400P",
  couponCount: 3,
  verified: true,
};

export const reservationHistory = [
  {
    id: "R-20260612-1020",
    title: "제주 발효 밥상 클래스",
    status: "예약 확정",
    statusTone: "confirmed" as const,
    schedule: "2026.06.12 오전 10:30",
    people: "2명",
    reservationType: "즉시확정",
    amount: "136,000원",
    location: "제주시 로컬 키친",
    payment: "카드 결제 완료",
    host: "이더라운드 로컬 키친",
    href: experiencePath("jeju-fermentation-table"),
    nextAction: "예약 상세 확인",
    timeline: ["예약 요청", "결제 완료", "예약 확정", "체험 예정"],
  },
  {
    id: "R-20260618-1515",
    title: "양조장과 마을 산책",
    status: "승인 대기",
    statusTone: "pending" as const,
    schedule: "2026.06.18 오후 3:00",
    people: "4명",
    reservationType: "호스트 승인",
    amount: "216,000원",
    location: "서귀포 로컬 브루어리",
    payment: "승인 후 결제",
    host: "서귀포 브루어리 크루",
    href: experiencePath("brewery-village-walk"),
    nextAction: "호스트 응답 대기",
    timeline: ["예약 요청", "호스트 확인 중", "결제 안내", "예약 확정"],
  },
  {
    id: "R-20260502-1330",
    title: "감귤 디저트 랩",
    status: "이용 완료",
    statusTone: "done" as const,
    schedule: "2026.05.02 오후 1:30",
    people: "3명",
    reservationType: "즉시확정",
    amount: "126,000원",
    location: "애월 스위트룸",
    payment: "카드 결제 완료",
    host: "애월 디저트 스튜디오",
    href: experiencePath("citrus-dessert-lab"),
    nextAction: "후기 작성 가능",
    timeline: ["예약 요청", "결제 완료", "체험 완료", "후기 작성"],
  },
];

export const quoteHistory = [
  {
    id: "Q-20260612-024",
    title: "제주문화재단 로컬워크숍",
    status: "검토 중",
    statusTone: "pending" as const,
    program: "발효 밥상 + 마을 투어",
    period: "2026.06.12 - 06.13",
    people: "24명",
    estimatedTotal: "2,180,000원",
    manager: "B2B 운영팀",
    lastUpdated: "2026.05.20 10:42",
    href: userRoutes.b2bQuote,
    timeline: ["요청 접수", "일정 검토", "견적 산출", "견적서 발송"],
  },
  {
    id: "Q-20260704-018",
    title: "교육기관 미식 클래스",
    status: "견적서 수신",
    statusTone: "received" as const,
    program: "미식 클래스 + 식사 포함",
    period: "2026.07.04",
    people: "18명",
    estimatedTotal: "1,420,000원",
    manager: "김다은 매니저",
    lastUpdated: "2026.05.19 16:10",
    href: userRoutes.b2bQuote,
    timeline: ["요청 접수", "견적 산출", "견적서 발송", "승인 대기"],
  },
  {
    id: "Q-20260719-052",
    title: "브랜드 팝업 프로그램",
    status: "추가 문의",
    statusTone: "confirmed" as const,
    program: "로컬 강의 + 팝업 체험",
    period: "2026.07.19 - 07.20",
    people: "52명",
    estimatedTotal: "별도 협의",
    manager: "파트너십 담당자",
    lastUpdated: "2026.05.18 09:24",
    href: userRoutes.b2bQuote,
    timeline: ["요청 접수", "요건 확인", "추가 문의", "맞춤 제안"],
  },
];

export const wishlistItems = [
  {
    title: "해녀의 계절 바다 밥상",
    region: "구좌",
    price: "96,000원",
    badge: "프리미엄",
    href: experiencePath("haenyeo-seafood-table"),
    image: "https://cdn.imweb.me/thumbnail/20230831/65c0d9fa53fd2.jpg",
  },
  {
    title: "제주 감귤 디저트 랩",
    region: "애월",
    price: "42,000원",
    badge: "가족 추천",
    href: experiencePath("citrus-dessert-lab"),
    image: "https://cdn.imweb.me/thumbnail/20230831/2ca78f5658b74.jpg",
  },
  {
    title: "제주 팜투마켓 피크닉",
    region: "한림",
    price: "38,000원",
    badge: "기획전",
    href: experiencePath("farm-to-market-picnic"),
    image: "https://cdn.imweb.me/thumbnail/20230831/266f4e7d5ddb5.jpg",
  },
];

export const reviewHistory = [
  {
    title: "감귤 디저트 랩",
    status: "작성 가능",
    statusTone: "pending" as const,
    date: "2026.05.02 이용 완료",
    rating: null,
    text: "체험 후기를 남기면 다음 예약에 사용할 수 있는 쿠폰을 받을 수 있어요.",
    href: `${userRoutes.me}/reviews`,
  },
  {
    title: "제주 발효 밥상 클래스",
    status: "작성 완료",
    statusTone: "done" as const,
    date: "2026.04.21 작성",
    rating: 5,
    text: "진행 동선이 깔끔하고 호스트 설명이 좋아서 다음 워크숍에도 추천하고 싶어요.",
    href: experiencePath("jeju-fermentation-table"),
  },
  {
    title: "양조장과 마을 산책",
    status: "호스트 답글",
    statusTone: "received" as const,
    date: "2026.04.18 답글 도착",
    rating: 5,
    text: "방문 후 남긴 문의에 호스트 답글이 도착했습니다.",
    href: experiencePath("brewery-village-walk"),
  },
];

export const profileRows = [
  { label: "이름", value: myProfile.name },
  { label: "회원 유형", value: myProfile.memberType },
  { label: "소속", value: myProfile.organization },
  { label: "이메일", value: myProfile.email },
  { label: "휴대폰", value: myProfile.phone },
  { label: "가입일", value: myProfile.joinedAt },
];

export const consentRows = [
  { label: "예약 알림", value: "카카오 알림톡 + 이메일 수신" },
  { label: "마케팅 수신", value: "이벤트·기획전 소식 수신 동의" },
  { label: "개인정보 보관", value: "거래 종료 후 법정 기간 보관" },
];
