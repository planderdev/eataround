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
