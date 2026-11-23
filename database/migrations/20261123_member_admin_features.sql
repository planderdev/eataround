-- 2026-11-23 회원 기능(찜·리뷰 작성)·고객 문의 답변·로그인 실패 잠금
-- 여러 번 실행해도 안전하다(if not exists).

-- 찜: 회원 한 명이 상품 하나를 한 번만 저장한다.
create table if not exists wishlists (
  user_id bigint not null references users(id) on delete cascade,
  product_id bigint not null references products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);
create index if not exists idx_wishlists_product on wishlists (product_id);
alter table wishlists enable row level security;

-- 리뷰: 어떤 예약의 후기인지 남겨 예약 한 건에 후기 한 개만 받는다.
alter table product_reviews add column if not exists reservation_id bigint references reservations(id) on delete set null;
create unique index if not exists uq_product_reviews_reservation on product_reviews (reservation_id) where reservation_id is not null;

-- 문의: 관리자 답변과 답변 시각.
alter table inquiries add column if not exists answer text;
alter table inquiries add column if not exists answered_at timestamptz;

-- 로그인 실패 잠금: 이메일과 접속 주소(IP) 묶음마다 연속 실패를 센다(5회 실패 시 30분 잠금).
-- 계정 단위로 잠그면 남이 관리자 이메일로 일부러 틀려 관리자를 잠글 수 있어 접속 주소까지 묶는다.
-- 없는 이메일도 똑같이 세어, 응답으로 가입 여부를 알 수 없게 한다.
create table if not exists login_attempts (
  email varchar(190) not null,
  client_key varchar(64) not null,
  failed_count integer not null default 0,
  locked_until timestamptz,
  updated_at timestamptz not null default now(),
  primary key (email, client_key)
);
create index if not exists idx_login_attempts_updated on login_attempts (updated_at);
alter table login_attempts enable row level security;
