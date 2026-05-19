# 이더라운드 Next.js 리뉴얼 작업 메모

## 실행

```bash
npm install
npm run dev
```

## Cafe24 MySQL 연결

`.env.local`에 아래 값을 넣으면 API Route가 MySQL에 저장을 시도합니다.

```bash
DB_HOST=localhost
DB_PORT=3306
DB_USER=eataround_user
DB_PASSWORD=비밀번호
DB_NAME=eataround
```

초기 테이블은 `database/schema.sql`을 phpMyAdmin에서 먼저 실행하면 됩니다.
샘플 데이터가 필요하면 이어서 `database/seed.sql`을 실행하세요.

`.env.example`을 참고해 `.env.local`을 만들면 됩니다. DB 환경변수가 없거나 쿼리가 실패하면 화면은 샘플 데이터로 동작합니다.

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
