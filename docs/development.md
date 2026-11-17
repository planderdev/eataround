# 이더라운드 Next.js 리뉴얼 작업 메모

## 실행

```bash
npm install
npm run dev
```

## Supabase(Postgres) 연결

DB는 Supabase 프로젝트 `eataround`(서울 리전)를 사용합니다. `.env.local`에 연결 문자열을 넣으면 API Route와 화면이 DB를 읽고 씁니다.

```bash
DATABASE_URL=postgresql://postgres.<project-ref>:<password>@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres
```

- 값은 Supabase 대시보드 > Connect > Transaction pooler(포트 6543)에서 복사합니다. Vercel에는 같은 이름의 환경변수로 등록합니다.
- 스키마는 `database/schema.sql`, 샘플 데이터는 `database/seed.sql`입니다. 시드는 `lib/data.ts`와 같은 내용이며 여러 번 실행해도 안전합니다.
- 모든 테이블에 RLS가 켜져 있고 정책이 없습니다. 서버가 `DATABASE_URL`로 직접 접속할 때만 읽기·쓰기가 되고, 공개 API 키로는 접근할 수 없습니다.
- `DATABASE_URL`이 없거나 쿼리가 실패하면 화면은 샘플 데이터로 동작합니다.
- `lib/db.ts`가 기존 mysql2 호출 형태(`?` 플레이스홀더, `[rows]` 반환)를 Postgres로 변환합니다.

## 로그인 세션

- 세션 쿠키는 `SESSION_SECRET`으로 서명한 토큰(`lib/session-token.ts`)이며 만료 시각을 포함합니다. 서명이 맞지 않거나 만료된 쿠키는 인정하지 않습니다.
- DB를 연결한 환경에서는 `SESSION_SECRET`(32자 이상)이 필수입니다. 없으면 로그인이 503으로 막히고 기존 쿠키도 인정되지 않습니다. `openssl rand -base64 48`로 만들어 Vercel 환경변수에 등록합니다.

## 관리자

### 인증
- DB를 연결한 환경에서는 `/admin/*`과 `/api/admin/*`이 관리자 세션을 요구합니다(`proxy.ts`). 세션이 없으면 화면은 `/admin/login`으로 이동하고 API는 401을 돌려줍니다.
- 관리자 로그인(`POST /api/admin/auth/login`)은 `users.role = 'admin'`인 계정만 통과시킵니다. 세션은 기본 8시간, "로그인 상태 유지" 시 7일입니다.
- DB가 없는 샘플 모드에서는 실제 데이터가 없으므로 로그인 없이 화면을 볼 수 있습니다.
- 첫 관리자 계정 만들기: 사이트에서 일반 회원으로 가입한 뒤 Supabase SQL Editor에서 권한을 올립니다.

```sql
update users set role = 'admin' where email = '관리자 이메일';
```

### 화면별 데이터 연결 현황
- DB에서 읽는 것: 대시보드·예약·견적·회원 목록(`lib/admin/data.ts` → `lib/content.ts`), 상품 목록.
- DB에 저장되는 변경 동작(관리자 세션을 라우트에서 다시 확인, 실제 행 id 사용):
  - 예약 `PATCH /api/admin/reservations/{id}`: `status`가 `confirmed`/`paid`/`requested`면 상태 변경, `cancelled`/`rejected`면 `canceled`로 바꾸고 사유를 `memo`에 남기며 회차 재고(`product_schedules.booked`, `reserved_teams`)를 되돌립니다. 이미 취소된 예약은 재고를 다시 복원하지 않고, 되돌릴 수도 없습니다(409).
  - 기업회원 `PATCH /api/admin/members/{id}`: `action`이 `approve`면 `company_approved = 1`, `reject`면 `company_approved = 0`과 `company_rejected_reason`(반려 사유) 저장. 사유가 있으면 목록에 "반려"로 표시됩니다.
  - 견적 `PATCH /api/admin/quotes/{id}`: `status`(`requested`/`reviewing`/`sent`/`accepted`/`closed`)와 `adminMemo` 저장.
  - 상품 생성 `POST /api/admin/products`.
- 아직 목업인 것: 안내 발송(메일/알림 발송 수단 없음, DB 연결 환경에서는 501), 견적서 발송(`/api/admin/quotes/{id}/send`), 견적 금액 조정·예약 전환, 목록 상단 일괄 처리, 일정·상품 수정·배너·기획전·행사·리뷰 수정. 이 라우트들은 `lib/admin/api-data.ts`의 고정 응답을 돌려주고 DB를 바꾸지 않습니다.
- 자체 핸들러로 저장하는 버튼은 `data-admin-own-action` 속성을 달아 `AdminShell`의 라벨 추측 처리(`adminApi.actions.execute`)에서 제외합니다.
- 관리자 화면은 요청마다 DB를 다시 읽습니다(`loadAdminData`의 `connection()`).
- 그 밖의 버튼 동작은 `NEXT_PUBLIC_USE_MOCK`이 `false`가 아니면 서버를 호출하지 않고 `lib/mock/admin.ts`를 씁니다.
- 로그인 실패 5회 잠금은 화면에서만 세는 값이라 서버에서는 강제되지 않습니다.

## 배포

Vercel 프로젝트 `eataround`가 GitHub 저장소와 연결되어 있어 `master`에 푸시하면 프로덕션으로 배포됩니다.

## 현재 구현된 화면

- 홈: 메인 배너, 아이콘 카테고리, 추천 로컬체험, 특가 배너, 기획전, 진행중인 행사, 패키지 CTA, 저널
- 로컬체험: 지역/카테고리/태그 필터, 세로형 상품 카드
- 상품 상세: 앵커 메뉴, 예약 패널, 날짜별 팀 재고, 포함사항/장소/호스트/환불규정
- 행사: 진행중인 행사와 종료된 행사 분리
- 기업·기관 패키지: 기간, 인원수, 프로그램 선택 기반 견적 계산
- 회원가입: 일반회원/기업·기관 구분
- 마이페이지: 예약내역, 견적내역, 회원정보, 문의내역 구조
- 관리자: 대시보드, 예약관리, 견적관리, 상품 운영 체크

## API

- `POST /api/signup`: 일반회원/기업·기관 회원 가입 신청
- `POST /api/reservations`: 상품 상세 예약 요청
- `POST /api/quote`: 패키지 견적 요청
- `GET /api/admin/summary`: 관리자 대시보드 카운트
- `GET /api/admin/products`: 상품 목록
- `POST /api/admin/products`: 관리자 상품 생성
