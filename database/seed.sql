use eataround;

insert into categories
  (label, href, icon_asset, tone, sort_order)
values
  ('쿠킹·베이킹', '/experiences?tag=쿠킹', '/assets/images/plat-icon-cook.svg', 'coral', 1),
  ('아이와함께', '/experiences?tag=가족', '/assets/images/plat-icon-child.svg', 'yellow', 2),
  ('지역·전통', '/experiences?tag=마을', '/assets/images/plat-icon-org.svg', 'ink', 3),
  ('혼자여행', '/experiences?tag=소규모', '/assets/images/plat-icon-travel.svg', 'red', 4),
  ('웰니스·치유', '/experiences?tag=웰니스', '/assets/images/plat-icon-heal.svg', 'green', 5),
  ('비오는날', '/experiences?tag=실내', '/assets/images/plat-icon-rain.svg', 'blue', 6),
  ('캠핑·액티비티', '/experiences?tag=피크닉', '/assets/images/plat-icon-camp.svg', 'green', 7)
on duplicate key update href = values(href), icon_asset = values(icon_asset), tone = values(tone), sort_order = values(sort_order);

insert into banners
  (placement, eyebrow, title, subtitle, image_url, link_url, theme, host_label, host_images, sort_order)
values
  ('home_main', 'EAT.AROUND JEJU', '진짜 제주를 맛보는 로컬 경험', '요리연구가, 명인, 로컬 호스트가 안내하는 미식 클래스와 마을 투어를 한곳에서 예약하세요.', 'https://images.unsplash.com/photo-1612977512598-3b8d6a498bbb?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', '/experiences', null, null, null, 1),
  ('home_main', 'FOR TEAMS', '기관과 기업을 위한 맞춤 패키지', '10명, 20명, 30명 단위의 팀 예약과 할인 견적을 편하게 확인하세요.', 'https://images.unsplash.com/photo-1668755929372-89773da5547b?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', '/packages', null, null, null, 2),
  ('package_cta', null, '기업·기관 맞춤 패키지', '기관 워크숍 견적 안내', null, '/packages', 'red', 'SELECTED HOST', json_array('https://cdn.imweb.me/thumbnail/20230831/5089900ac1a12.jpg', 'https://cdn.imweb.me/thumbnail/20230831/65c0d9fa53fd2.jpg', 'https://cdn.imweb.me/thumbnail/20230831/2ca78f5658b74.jpg'), 1),
  ('package_cta', null, '단체 원데이 클래스', '10명부터 일정 조율 가능', null, '/packages', 'green', 'GROUP CLASS', json_array('https://cdn.imweb.me/thumbnail/20230831/266f4e7d5ddb5.jpg', 'https://cdn.imweb.me/thumbnail/20230831/dca60ec8c7676.jpg', 'https://cdn.imweb.me/thumbnail/20230831/c0504b329b735.jpg'), 2)
on duplicate key update
  eyebrow = values(eyebrow),
  subtitle = values(subtitle),
  image_url = values(image_url),
  link_url = values(link_url),
  theme = values(theme),
  host_label = values(host_label),
  host_images = values(host_images),
  sort_order = values(sort_order);

insert into products
  (slug, title, summary, description, region, category, price, original_price, duration, badge, image_url, host_name, host_description, place_name, place_address, is_featured, sort_order)
values
  ('jeju-fermentation-table', '제주 발효 밥상 클래스', '제주 식재료와 발효장을 활용해 로컬 밥상을 직접 완성하는 클래스입니다.', '호스트가 준비한 제철 식재료를 함께 손질하고 제주 장과 술지게미를 활용한 반찬과 메인 메뉴를 만듭니다.', '제주시', '미식', 68000, 82000, '150분', '특가', 'https://cdn.imweb.me/thumbnail/20230831/5089900ac1a12.jpg', '이더라운드 로컬 키친', '제주의 음식 문화와 생산자를 연결하는 미식 경험팀입니다.', '제주 로컬 키친', '제주특별자치도 제주시 중앙로 12', 1, 1),
  ('brewery-village-walk', '제주 양조장과 마을 산책', '작은 양조장의 발효실을 둘러보고 마을 이야기를 따라 걷는 투어입니다.', '양조사가 직접 들려주는 술 빚는 과정, 로컬 재료의 이동 경로, 마을 골목 산책이 이어집니다.', '서귀포', '양조', 54000, null, '120분', null, 'https://cdn.imweb.me/thumbnail/20230831/65c0d9fa53fd2.jpg', '서귀포 브루잉 크루', '제주 남쪽의 작은 양조장과 로컬 문화를 소개합니다.', '서귀포 로컬 브루어리', '제주특별자치도 서귀포시 남원읍 태위로 44', 1, 2)
on duplicate key update title = values(title);

insert into product_tags (product_id, tag)
select id, '쿠킹' from products where slug = 'jeju-fermentation-table'
on duplicate key update tag = values(tag);

insert into product_tags (product_id, tag)
select id, '막걸리' from products where slug = 'jeju-fermentation-table'
on duplicate key update tag = values(tag);

insert into product_tags (product_id, tag)
select id, '양조장' from products where slug = 'brewery-village-walk'
on duplicate key update tag = values(tag);

insert into product_tags (product_id, tag)
select id, '시음' from products where slug = 'brewery-village-walk'
on duplicate key update tag = values(tag);

insert into product_schedules
  (product_id, schedule_date, schedule_label, capacity, booked, max_teams, reserved_teams, team_capacity, reservation_type, approval_required, price)
select id, '2026-05-23', '오전 10:30', 12, 7, 3, 2, 4, 'approval', 1, 68000 from products where slug = 'jeju-fermentation-table'
union all
select id, '2026-05-24', '오후 14:00', 12, 11, 3, 3, 4, 'approval', 1, 68000 from products where slug = 'jeju-fermentation-table'
union all
select id, '2026-05-22', '오후 15:00', 20, 8, 4, 2, 5, 'instant', 0, 54000 from products where slug = 'brewery-village-walk'
union all
select id, '2026-05-29', '오후 15:00', 20, 19, 4, 4, 5, 'approval', 1, 54000 from products where slug = 'brewery-village-walk'
on duplicate key update
  capacity = values(capacity),
  booked = values(booked),
  max_teams = values(max_teams),
  reserved_teams = values(reserved_teams),
  team_capacity = values(team_capacity),
  reservation_type = values(reservation_type),
  approval_required = values(approval_required),
  price = values(price);

insert into events
  (slug, title, status, period_label, venue, partner, summary, image_url, sort_order)
values
  ('jeju-local-table-2026', '제주 로컬테이블 2026', 'ongoing', '2026.05.01 - 2026.06.30', '제주시 원도심 일대', '제주시 문화재단', '제주 생산자, 셰프, 여행자가 만나는 시즌형 미식 행사입니다.', 'https://cdn.imweb.me/thumbnail/20230831/5089900ac1a12.jpg', 1),
  ('market-picnic-day', '마켓 피크닉 데이', 'ended', '2025.10.03 - 2025.10.05', '한림 로컬마켓', '한림읍 상인회', '로컬 생산자 마켓과 가족 피크닉 체험을 결합한 행사 결과입니다.', 'https://cdn.imweb.me/thumbnail/20230831/dca60ec8c7676.jpg', 2)
on duplicate key update title = values(title);

insert into collections
  (slug, eyebrow, title, subtitle, image_url, link_url, sort_order)
values
  ('jeju-local-food', '미식 여행', '제주 한 끼를 오래 기억하는 방법', '로컬 식재료와 호스트가 있는 기획전', 'https://cdn.imweb.me/thumbnail/20230831/2ca78f5658b74.jpg', '/experiences?category=cooking', 1),
  ('seogwipo-brewery', '서귀포', '양조장과 마을 산책', '마을과 술 이야기를 함께 걷는 코스', 'https://cdn.imweb.me/thumbnail/20230831/65c0d9fa53fd2.jpg', '/experiences?region=서귀포', 2),
  ('team-workshop', 'Team', '기관 워크숍 추천 코스', '단체 인원에 맞춘 제주 로컬 패키지', 'https://cdn.imweb.me/thumbnail/20230831/dca60ec8c7676.jpg', '/packages', 3)
on duplicate key update title = values(title), subtitle = values(subtitle), image_url = values(image_url), link_url = values(link_url);

insert into package_programs
  (code, title, program_type, base_price, duration)
values
  ('food-class', '제주 미식 클래스', 'experience', 68000, '150분'),
  ('brewery-tour', '양조장 투어', 'tour', 54000, '120분'),
  ('host-lecture', '로컬 브랜드 강의', 'lecture', 350000, '90분'),
  ('market-picnic', '팜투마켓 피크닉', 'experience', 38000, '90분')
on duplicate key update title = values(title), base_price = values(base_price);

insert into package_options
  (code, title, description, price, price_type, sort_order)
values
  ('lodging', '숙박 섭외', '1박 기준 숙소 추천 및 견적', 90000, 'person', 1),
  ('meal', '식사 포함', '로컬 식당 또는 케이터링', 25000, 'person', 2),
  ('transport', '이동 차량', '일정 내 단체 이동 차량', 300000, 'flat', 3)
on duplicate key update title = values(title), description = values(description), price = values(price), price_type = values(price_type);

insert into discount_tiers
  (min_people, discount_rate, label, sort_order)
values
  (50, 0.1500, '50명 이상 별도 문의', 1),
  (30, 0.1500, '30명 이상 단체 할인', 2),
  (20, 0.1000, '20명 이상 단체 할인', 3),
  (10, 0.0500, '10명 이상 단체 할인', 4),
  (1, 0.0000, '기본가', 5)
on duplicate key update discount_rate = values(discount_rate), label = values(label), sort_order = values(sort_order);

insert into product_detail_items
  (product_id, content_type, label, body, sort_order)
select id, 'recommended', null, '제주시에서 미식 체험을 찾는 분', 1 from products where slug = 'jeju-fermentation-table'
union all
select id, 'recommended', null, '소규모로 깊이 있는 시간을 보내고 싶은 분', 2 from products where slug = 'jeju-fermentation-table'
union all
select id, 'recommended', null, '호스트 확인 후 확정되는 일정을 원하는 분', 3 from products where slug = 'jeju-fermentation-table'
union all
select id, 'excluded', null, '개인 여행자 보험', 1 from products where slug = 'jeju-fermentation-table'
union all
select id, 'excluded', null, '왕복 교통', 2 from products where slug = 'jeju-fermentation-table'
union all
select id, 'excluded', null, '포함사항 외 추가 주문', 3 from products where slug = 'jeju-fermentation-table'
union all
select id, 'schedule', '도착 10분 전', '체크인과 안내', 1 from products where slug = 'jeju-fermentation-table'
union all
select id, 'schedule', '0:10', '호스트 소개와 지역 이야기', 2 from products where slug = 'jeju-fermentation-table'
union all
select id, 'schedule', '0:30', '메인 체험 진행', 3 from products where slug = 'jeju-fermentation-table'
union all
select id, 'schedule', '마무리', '식사 또는 시음, 질의응답', 4 from products where slug = 'jeju-fermentation-table';

insert into product_reviews
  (product_id, user_id, rating, body, status)
select id, null, 5, '일정 안내가 명확했고 호스트 설명이 좋아서 제주를 더 가까이 느낄 수 있었어요.', 'approved'
  from products where slug = 'jeju-fermentation-table'
union all
select id, null, 5, '팀 단위로 예약 가능한 회차가 보여서 인원 조율이 편했습니다.', 'approved'
  from products where slug = 'jeju-fermentation-table';

insert into journals
  (slug, title, category, excerpt, image_url, published_at)
values
  ('how-to-meet-jeju-hosts', '좋은 로컬 호스트를 만나는 방법', 'Guide', '체험을 고를 때 확인하면 좋은 호스트, 장소, 일정 기준을 정리했습니다.', 'https://cdn.imweb.me/thumbnail/20230831/2ca78f5658b74.jpg', '2026-05-10 09:00:00'),
  ('team-workshop-checklist', '기관 워크숍 견적 전 체크리스트', 'B2B', '인원, 기간, 프로그램 조합을 빠르게 확정하기 위한 실무형 체크리스트입니다.', 'https://cdn.imweb.me/thumbnail/20230831/c0504b329b735.jpg', '2026-04-12 09:00:00')
on duplicate key update title = values(title);

insert into coupons
  (code, title, discount_type, discount_value, starts_at, ends_at)
values
  ('LASTSEAT10', '마감임박 10% 쿠폰', 'percent', 10, '2026-05-01 00:00:00', '2026-06-30 23:59:59'),
  ('RAINYDAY', '비 오는 날 실내체험 쿠폰', 'percent', 8, '2026-05-01 00:00:00', '2026-07-31 23:59:59')
on duplicate key update title = values(title), discount_value = values(discount_value);

insert into host_settlements
  (host_name, sales_amount, commission_amount, payout_amount, status)
values
  ('이더라운드 로컬 키친', 1360000, 204000, 1156000, 'draft'),
  ('서귀포 브루잉 크루', 864000, 129600, 734400, 'confirmed');
