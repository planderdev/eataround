# 관리자 DB 연동 매핑

프론트 화면은 `lib/content.ts`의 getter를 통해 데이터를 읽습니다. `DATABASE_URL`이 없거나 쿼리가 실패하면 `lib/data.ts`의 샘플 데이터로 fallback 됩니다.

## 홈

- 히어로 슬라이드: `banners` where `placement = 'home_main'`
- 아이콘 카테고리: `categories`
- 추천 로컬체험/원데이 클래스: `products`, `product_tags`, `product_schedules`
- 기획전: `collections`
- 진행중인 행사: `events` where `status = 'ongoing'`
- 기업·기관 CTA: `banners` where `placement = 'package_cta'`
- 저널: `journals`

## 로컬체험

- 상품 카드: `products`
- 태그/필터 기반 정보: `product_tags`, `product_schedules`
- 일정/회차/팀 재고: `product_schedules`
- 예약 요청: `reservations`

## 상품 상세

- 기본 정보: `products`
- 태그: `product_tags`
- 예약 가능 회차: `product_schedules`
- 추천 대상/불포함/일정 타임라인: `product_detail_items`
- 승인된 리뷰: `product_reviews`

## 기업·기관 패키지

- 프로그램 선택: `package_programs`
- 숙박/식사/이동 옵션: `package_options`
- 인원별 할인율: `discount_tiers`
- 견적 요청: `quote_requests`

## 행사/저널

- 진행중/종료 행사: `events`
- 저널 콘텐츠: `journals`

## 관리자

- 회원관리: `users`
- 상품관리: `products`, `product_tags`, `product_schedules`, `product_detail_items`
- 예약관리: `reservations`
- 견적관리: `quote_requests`
- 행사관리: `events`
- 배너관리: `banners`
- 기획전관리: `collections`
- 저널관리: `journals`
- 리뷰관리: `product_reviews`
- 쿠폰/이벤트: `coupons`
- 정산관리: `host_settlements`

## 프론트 연동 규칙

- 새 화면 데이터는 직접 배열을 만들지 않고 `lib/content.ts`에 getter를 추가합니다.
- 관리자에서 바뀌는 값은 `database/schema.sql`에 테이블/컬럼을 먼저 정의합니다.
- 샘플 표시는 `lib/data.ts` fallback으로 유지하되, 실제 서비스에서는 같은 형태를 DB에서 반환해야 합니다.
- 이미지 필드는 URL 문자열로 먼저 처리하고, 업로드 기능은 백엔드에서 파일 저장 정책 확정 후 연결합니다.
