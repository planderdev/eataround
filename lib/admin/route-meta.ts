export const adminActionTargets: Record<string, { primary?: string; secondary?: string }> = {
  dashboard: { primary: "/admin/reservations", secondary: "/admin/quotes" },
  "members/general": { primary: "/admin/members/general/export" },
  "members/corporate": { primary: "/admin/members/corporate/approval" },
  products: { primary: "/admin/products/new", secondary: "/admin/products/bulk-visibility" },
  "products/categories": { primary: "/admin/products/categories/new" },
  reservations: { primary: "/admin/reservations/confirm", secondary: "/admin/reservations/mail" },
  "reservations/schedules": { primary: "/admin/reservations/schedules/new", secondary: "/admin/reservations/schedules/recurring" },
  "events/ongoing": { primary: "/admin/events/ongoing/new" },
  "events/closed": { primary: "/admin/events/closed/result" },
  packages: { primary: "/admin/packages/new" },
  quotes: { primary: "/admin/quotes/send", secondary: "/admin/quotes/convert" },
  banners: { primary: "/admin/banners/new" },
  curations: { primary: "/admin/curations/new" },
  journal: { primary: "/admin/journal/new" },
  reviews: { primary: "/admin/reviews/visibility" },
  "settings/admins": { primary: "/admin/settings/admins/invite" },
  "settings/policies": { primary: "/admin/settings/policies/new" },
};

export type WorkflowCopy = {
  backHref: string;
  scope: string;
  fields: string[];
  checklist: string[];
};

export const workflowCopy: Record<string, WorkflowCopy> = {
  "members/general/export": {
    backHref: "/admin/members/general",
    scope: "회원 데이터 내보내기",
    fields: ["내보내기 기간", "회원 상태", "가입 경로", "마스킹 기준"],
    checklist: ["개인정보 마스킹 적용", "다운로드 만료 시간 설정", "관리자 작업 로그 저장"],
  },
  "members/corporate/approval": {
    backHref: "/admin/members/corporate",
    scope: "기업·기관 승인",
    fields: ["기관명", "사업자 구분", "견적 접근 권한", "승인 안내 메시지"],
    checklist: ["기관 정보 확인", "패키지 견적 권한 반영", "담당자에게 승인 안내 발송"],
  },
  "products/bulk-visibility": {
    backHref: "/admin/products",
    scope: "상품 일괄 변경",
    fields: ["대상 상품", "노출 상태", "예약 가능 여부", "적용 예약일"],
    checklist: ["상품 목록 노출 확인", "상세 예약 CTA 상태 확인", "변경 이력 저장"],
  },
  "reservations/confirm": {
    backHref: "/admin/reservations",
    scope: "예약 승인",
    fields: ["예약번호", "이용일", "회차", "확정 안내 문구"],
    checklist: ["팀 단위 재고 차감", "예약 상태 확정 처리", "고객 안내 메시지 발송"],
  },
  "reservations/mail": {
    backHref: "/admin/reservations",
    scope: "예약 안내 발송",
    fields: ["예약 상태", "발송 대상", "메일 템플릿", "예약 발송 시간"],
    checklist: ["취소·환불 문구 포함", "중복 발송 방지", "발송 이력 저장"],
  },
  "reservations/schedules/new": {
    backHref: "/admin/reservations/schedules",
    scope: "회차 생성",
    fields: ["상품", "날짜", "시간", "팀 재고", "팀당 인원"],
    checklist: ["예약 유형 확인", "승인 필요 여부 설정", "캘린더 재고 반영"],
  },
  "reservations/schedules/recurring": {
    backHref: "/admin/reservations/schedules",
    scope: "반복 회차",
    fields: ["반복 기간", "요일", "시간대", "팀 재고"],
    checklist: ["공휴일 제외 여부 확인", "중복 회차 방지", "생성 전 미리보기"],
  },
  "reservations/schedules/bulk-close": {
    backHref: "/admin/reservations/schedules",
    scope: "회차 마감",
    fields: ["대상 기간", "상품", "마감 사유", "고객 안내"],
    checklist: ["예약 가능 재고 0 처리", "기존 예약 유지", "프론트 캘린더 마감 반영"],
  },
  "events/ongoing/new": {
    backHref: "/admin/events/ongoing",
    scope: "행사 등록",
    fields: ["행사명", "모집 기간", "장소", "신청 CTA"],
    checklist: ["진행중 행사 리스트 노출", "행사 상세 페이지 연결", "배너 슬롯 연결"],
  },
  "events/closed/result": {
    backHref: "/admin/events/closed",
    scope: "행사 결과",
    fields: ["행사명", "결과 요약", "대표 이미지", "파트너"],
    checklist: ["종료된 행사로 분류", "포트폴리오 이미지 등록", "기관 영업 자료로 사용"],
  },
  "quotes/send": {
    backHref: "/admin/quotes",
    scope: "견적서 발송",
    fields: ["견적번호", "최종 금액", "포함 옵션", "발송 메시지"],
    checklist: ["견적 상태 QUOTED 처리", "기관 담당자 연락처 확인", "견적서 이력 저장"],
  },
  "quotes/convert": {
    backHref: "/admin/quotes",
    scope: "예약 전환",
    fields: ["견적번호", "이용 기간", "예약 상태", "결제 방식"],
    checklist: ["예약번호 생성", "회차 재고 연결", "마이페이지 견적 상태 변경"],
  },
  "settings/policies/new": {
    backHref: "/admin/settings/policies",
    scope: "약관 버전 발행",
    fields: ["정책 종류", "버전", "시행일", "변경 요약", "본문"],
    checklist: ["푸터 모달 내용 반영", "이전 버전 보관", "시행일 예약 발행"],
  },
};
