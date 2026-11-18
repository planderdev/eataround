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
  - 회차 `PATCH /api/admin/schedules/{id}`: `capacity`, `maxTeams`, `teamCapacity`, `status`(`open`/`closed`). 이미 받은 예약(`booked`, `reserved_teams`)보다 작게 줄이면 409. 마감한 회차는 `POST /api/reservations`에서도 409로 거절합니다.
  - 상품 `PATCH /api/admin/products/{id}`: `title`, `summary`, `price`, `originalPrice`, `badge`, `isVisible`, `isFeatured`, `sortOrder`. `DELETE`는 비노출 처리.
  - 배너 `PATCH /api/admin/banners/{id}`, 기획전 `PATCH /api/admin/curations/{id}`(`collections` 테이블): `title`, `subtitle`, `linkUrl`, `imageUrl`, `isVisible`, `sortOrder`. `DELETE`는 비노출 처리.
  - 행사 `PATCH /api/admin/events/{id}`: `title`, `status`(`ongoing`/`ended`), `period`, `venue`, `partner`, `summary`, `imageUrl`, `sortOrder`. `DELETE`는 종료 처리.
  - 리뷰 `PATCH /api/admin/reviews/{id}`: `status`(`pending`/`approved`/`hidden`). `DELETE`는 숨김 처리.
  - 위 수정 라우트는 `lib/admin/patch.ts`의 `patchRow()`가 허용 필드만 골라 저장합니다. 목록 화면에서는 각 행 "상세보기"의 편집 영역(`AdminRowEditor`)이 바뀐 필드만 보냅니다.
  - 견적 `PATCH /api/admin/quotes/{id}`는 `estimatedTotal`(관리자 조정 금액)도 저장합니다.
  - 등록(POST): 상품 `/api/admin/products`(대표 이미지 URL·요약·소개·태그·회차를 한 트랜잭션으로), 회차 `/api/admin/schedules`(`endDate`+`weekdays`를 주면 반복 생성, 이미 있는 회차는 건너뜀), 기간 마감/다시 열기 `/api/admin/schedules/bulk-close`, 배너 `/api/admin/banners`, 기획전 `/api/admin/curations`, 행사 `/api/admin/events`, 저널 `/api/admin/journals`, 카테고리 `/api/admin/categories`. slug은 제목의 영문·숫자로 만들고, 남는 글자가 없으면 `접두사-시각`으로 만듭니다.
  - 저널 `PATCH /api/admin/journals/{id}`, 카테고리 `PATCH /api/admin/categories/{id}`(`DELETE`는 비공개/숨김).
  - 알림 `GET /api/admin/notifications`는 처리 대기 예약·새 견적·승인 대기 기업회원·검수 대기 리뷰 건수로 만듭니다(읽음 여부는 화면에서만 관리).
- 화면 구성 요소
  - `AdminRowEditor`: 목록 행 "상세보기"의 편집 영역. 바뀐 필드만 PATCH.
  - `AdminCreateForm`: 등록 화면 공용 폼. POST 후 목록으로 이동.
  - `AdminBulkBar`: 목록 상단 일괄 처리. 체크한 행의 `data-row-id`마다 PATCH를 보내고 성공·실패 건수를 알려 줍니다. 연결할 수 없는 항목은 "(미연결)"로 표시하고 이유를 안내합니다.
  - `ReviewVisibilityForm`: 리뷰 일괄 검수(체크 = 노출 승인, 해제 = 숨김).
- 관리자 목록은 `lib/admin/content.ts`의 전용 조회를 씁니다. 프론트용 조회와 달리 비노출·마감·검수 대기 행을 포함하고 DB 행 id를 돌려줍니다.
- 자체 저장 처리가 있는 영역은 `data-admin-own-action` 속성을 달아 `AdminShell`의 공용 버튼 처리에서 제외합니다. 그 밖의 버튼은 서버에 요청하지 않고 "아직 연결되지 않았습니다"를 안내합니다(`adminApi.actions.execute`). 이유를 함께 보여 주려면 버튼에 `data-admin-unlinked="이유"`를 답니다.
- 아직 연결되지 않은 것(화면에서 이유와 함께 안내, 해당 API는 DB 연결 환경에서 501):
  - 메일·알림 발송이 필요한 것: 예약/회원 안내 발송, 견적서 발송, 견적 공유, 호스트 답변 요청, 관리자 초대 메일
  - 파일이 필요한 것: 회원 엑셀 내보내기
  - 저장할 테이블·컬럼이 없는 것: 패키지 묶음(`/api/admin/packages`), 약관 버전, 사이트 설정, 관리자 권한 등급·잠금·접속 로그, 일반회원 메모·휴면·마케팅 동의, 예약 노쇼·환불, 견적 담당자, 행사 노출 여부, 기획전–상품 연결, 저널 SEO·연관 상품, 배너 노출 기간 예약, 상품 상세 항목(추천 대상·일정·FAQ 등) 편집
  - 규칙이 정해지지 않은 것: 견적 → 예약 전환
- 이미지 업로드
  - 저장소는 Vercel Blob 스토어 `eataround-images`(public)입니다. Vercel의 Production·Preview 환경에 `BLOB_READ_WRITE_TOKEN`이 주입됩니다. 로컬(development)에는 연결돼 있지 않습니다.
  - 파일은 브라우저가 Blob으로 직접 올립니다(`@vercel/blob/client`의 `upload`). 함수 요청 본문 4.5MB 제한을 피하기 위해서입니다. `POST /api/admin/uploads`는 관리자에게만 일회용 토큰을 내주고, 폴더(`products`/`banners`/`curations`/`events`/`journals`/`categories`), 형식(JPG·PNG·WebP·AVIF·GIF), 크기(10MB)를 제한합니다. 규칙은 `lib/admin/upload-rules.ts`에 있습니다.
  - 화면의 `ImageUploadButton`은 올린 주소를 이미지 주소 입력란에 넣기만 합니다. DB에는 기존 저장 버튼을 눌러야 반영됩니다. 주소를 직접 입력해도 됩니다.
  - 토큰이 없는 환경이나 DB가 없는 샘플 모드에서는 올리지 않고 "이 환경에서는 업로드할 수 없습니다"를 안내합니다(`GET /api/admin/uploads`의 `enabled`).
  - 상품 대표 이미지는 `PATCH /api/admin/products/{id}`의 `imageUrl`로 저장합니다.
  - 올린 뒤 저장하지 않았거나 다른 이미지로 바꾼 파일은 Blob에 남습니다(자동 삭제 없음).
- 상품 갤러리(상품 한 개에 사진 여러 장)
  - `product_images` 테이블(`product_id`, `image_url`, `alt`, `sort_order`)에 저장합니다. 대표 이미지는 여전히 `products.image_url`입니다.
  - `GET/POST/PATCH /api/admin/products/{id}/images`: 목록, 한 장 추가(`imageUrl`, `alt`, `primary`), 순서 변경(`order`에 사진 id 전체). 상품당 12장까지이며 상품 행을 잠그고 셉니다.
  - `PATCH/DELETE /api/admin/products/{id}/images/{imageId}`: 설명 수정, 대표 지정(`primary: true`면 그 사진 주소를 `products.image_url`에 복사), 갤러리에서 빼기.
  - 갤러리에서 빼면 Blob 파일도 함께 지웁니다(`lib/admin/blob-cleanup.ts`). 관리자 업로드로 만든 주소(`*.public.blob.vercel-storage.com`의 업로드 폴더)만 지우고, 같은 주소를 다른 갤러리 행·상품 대표 이미지·배너·기획전·이벤트·저널·카테고리에서 쓰고 있으면 남깁니다. 파일은 DB 커밋 뒤에 지우며, 실패해도 요청은 성공이고 서버 로그만 남습니다. `BLOB_READ_WRITE_TOKEN`이 없는 환경에서는 건너뜁니다. 응답의 `data.file`로 결과(`deleted`/`in-use`/`external`/`no-storage`/`failed`)를 알 수 있습니다.
  - 상품을 지우거나 대표 이미지를 바꿀 때는 파일을 정리하지 않습니다.
  - 관리자 상품 목록의 행 "상세보기"에 `ProductGalleryEditor`가 있습니다(여러 장 올리기, 주소로 추가, 사진 설명 저장, 앞으로/뒤로, 대표로 지정, 빼기).
  - 고객 상세(`/local-experiences/[slug]`, `/experiences/[slug]`)는 `getProductGallery()`로 읽어, 사진이 있으면 대표 이미지 + 갤러리를, 없으면 대표 이미지 + 공용 샘플 사진을 씁니다. 사진 설명(`alt`)은 `/local-experiences/[slug]`의 "현장 사진" 제목·대체 텍스트로 쓰입니다.
- 고객 화면 갱신: 홈과 상품·행사·저널·기획전 상세는 빌드 때 만드는 정적 페이지입니다. 관리자 저장 라우트와 예약 접수는 `revalidateSite()`(`lib/admin/revalidate.ts`)로 전체를 무효화해 다음 요청 때 다시 만들게 합니다. 이 호출이 없으면 다음 배포 전까지 예전 내용이 보입니다.
- 관리자 화면은 요청마다 DB를 다시 읽습니다(`loadAdminData`의 `connection()`).
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
