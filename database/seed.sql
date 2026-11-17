-- 이더라운드 샘플 데이터 (lib/data.ts의 fallback 데이터와 같은 내용)
-- 여러 번 실행해도 안전하도록 on conflict로 작성되어 있습니다.

insert into categories
  (label, href, icon_asset, tone, sort_order)
values
  ('쿠킹·베이킹', '/local-experiences?tag=쿠킹', '/assets/images/plat-icon-cook.svg', 'coral', 1),
  ('아이와함께', '/local-experiences?tag=가족', '/assets/images/plat-icon-child.svg', 'yellow', 2),
  ('지역·전통', '/local-experiences?tag=마을', '/assets/images/plat-icon-org.svg', 'ink', 3),
  ('혼자여행', '/local-experiences?tag=소규모', '/assets/images/plat-icon-travel.svg', 'red', 4),
  ('웰니스·치유', '/local-experiences?tag=웰니스', '/assets/images/plat-icon-heal.svg', 'green', 5),
  ('비오는날', '/local-experiences?tag=실내', '/assets/images/plat-icon-rain.svg', 'blue', 6),
  ('캠핑·액티비티', '/local-experiences?tag=피크닉', '/assets/images/plat-icon-camp.svg', 'green', 7)
on conflict (label) do update set href = excluded.href, icon_asset = excluded.icon_asset, tone = excluded.tone, sort_order = excluded.sort_order;

insert into banners
  (placement, eyebrow, title, subtitle, image_url, link_url, theme, host_label, host_images, sort_order)
values
  ('home_main', 'EAT.AROUND JEJU', '진짜 제주를 맛보는 로컬 경험', '요리연구가, 명인, 로컬 호스트가 안내하는 미식 클래스와 마을 투어를 한곳에서 예약하세요.', 'https://images.unsplash.com/photo-1612977512598-3b8d6a498bbb?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', '/local-experiences', null, null, null, 1),
  ('home_main', 'FOR TEAMS', '기관과 기업을 위한 맞춤 패키지', '10명, 20명, 30명 단위의 팀 예약과 할인 견적을 편하게 확인하세요.', 'https://images.unsplash.com/photo-1668755929372-89773da5547b?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', '/b2b', null, null, null, 2),
  ('package_cta', null, '기업·기관 맞춤 패키지', '기관 워크숍 견적 안내', null, '/b2b/quote', 'red', 'SELECTED HOST', '["https://cdn.imweb.me/thumbnail/20230831/5089900ac1a12.jpg","https://cdn.imweb.me/thumbnail/20230831/65c0d9fa53fd2.jpg","https://cdn.imweb.me/thumbnail/20230831/2ca78f5658b74.jpg"]'::jsonb, 1),
  ('package_cta', null, '단체 원데이 클래스', '10명부터 일정 조율 가능', null, '/b2b/quote', 'green', 'GROUP CLASS', '["https://cdn.imweb.me/thumbnail/20230831/266f4e7d5ddb5.jpg","https://cdn.imweb.me/thumbnail/20230831/dca60ec8c7676.jpg","https://cdn.imweb.me/thumbnail/20230831/c0504b329b735.jpg"]'::jsonb, 2)
on conflict (placement, title) do update set eyebrow = excluded.eyebrow, subtitle = excluded.subtitle, image_url = excluded.image_url, link_url = excluded.link_url, theme = excluded.theme, host_label = excluded.host_label, host_images = excluded.host_images, sort_order = excluded.sort_order;

insert into products
  (slug, title, summary, description, region, category, price, original_price, duration, badge, image_url, host_name, host_description, place_name, place_address, is_featured, sort_order, eyebrow, rating, review_count, kicker, group_label, booking_deadline, course_intro)
values
  ('jeju-fermentation-table', '제주 발효 밥상 클래스', '제주 식재료와 발효장을 활용해 로컬 밥상을 직접 완성하는 클래스입니다.', '호스트가 준비한 제철 식재료를 함께 손질하고, 제주 장과 술지게미를 활용한 반찬과 메인 메뉴를 만듭니다. 여행 중 하루를 깊게 기억하고 싶은 분에게 잘 맞습니다.', '제주시', '미식', 68000, 82000, '150분', '특가', 'https://cdn.imweb.me/thumbnail/20230831/5089900ac1a12.jpg', '이더라운드 로컬 키친', '제주의 음식 문화와 생산자를 연결하는 미식 경험팀입니다.', '제주 로컬 키친', '제주특별자치도 제주시 중앙로 12', 1, 1, '명인 클래스', 4.9, 128, '이더라운드 에디터 픽 · 제주 장과 발효로 차리는 한 상', '2~12명 · 초등학생 이상', '체험 2일 전 오후 6시', '식재료 이야기를 듣고, 발효 양념을 맛본 뒤 직접 조리해 한 상을 함께 나눕니다.'),
  ('brewery-village-walk', '제주 양조장과 마을 산책', '작은 양조장의 발효실을 둘러보고 마을 이야기를 따라 걷는 투어입니다.', '양조사가 직접 들려주는 술 빚는 과정, 로컬 재료의 이동 경로, 마을 골목 산책이 이어집니다.', '서귀포', '양조', 54000, null, '120분', null, 'https://cdn.imweb.me/thumbnail/20230831/65c0d9fa53fd2.jpg', '서귀포 브루잉 크루', '제주 남쪽의 작은 양조장과 로컬 문화를 소개합니다.', '서귀포 로컬 브루어리', '제주특별자치도 서귀포시 남원읍 태위로 44', 1, 2, '로컬 투어', 4.8, 94, '이더라운드 에디터 픽 · 양조사가 안내하는 마을 한 바퀴', '2~20명 · 성인', '체험 1일 전 오후 6시', '양조장 발효실에서 시작해 마을 골목을 걷고, 시음으로 마무리합니다.'),
  ('haenyeo-seafood-table', '해녀의 계절 바다 밥상', '해녀가 들려주는 바다 이야기와 제철 해산물 식사를 함께합니다.', '구좌 바다의 계절과 물질 이야기를 듣고, 그날 들어온 식재료로 차린 밥상을 나눕니다.', '구좌', '미식', 96000, null, '180분', '마감임박', 'https://cdn.imweb.me/thumbnail/20230831/2ca78f5658b74.jpg', '구좌 바다 호스트', '지역 생산자와 여행자를 연결하는 해녀 커뮤니티입니다.', '구좌 바다 작업장', '제주특별자치도 제주시 구좌읍 해맞이해안로 88', 1, 3, '프리미엄', 5, 47, '이더라운드 에디터 픽 · 해녀에게 듣는 바다와 밥상', '2~10명 · 초등학생 이상', '체험 3일 전 오후 6시', '해녀의 바다 이야기를 듣고, 그날 들어온 해산물로 차린 밥상을 함께합니다.'),
  ('citrus-dessert-lab', '제주 감귤 디저트 랩', '감귤을 활용한 작은 디저트와 음료를 만드는 체험입니다.', '아이와 어른이 함께 즐길 수 있도록 난도를 낮추고, 제주 감귤의 품종 이야기를 곁들였습니다.', '애월', '베이킹', 42000, 50000, '100분', null, 'https://cdn.imweb.me/thumbnail/20230831/266f4e7d5ddb5.jpg', '애월 디저트 스튜디오', '제주 과일을 활용한 베이킹 클래스를 운영합니다.', '애월 스위트룸', '제주특별자치도 제주시 애월읍 애월로 22', 1, 4, '가족 추천', 4.7, 83, '이더라운드 에디터 픽 · 아이와 함께 만드는 감귤 디저트', '2~18명 · 5세 이상(보호자 동반)', '체험 1일 전 오후 6시', '감귤 품종 이야기를 듣고, 디저트와 음료를 만들어 포장해 갑니다.'),
  ('farm-to-market-picnic', '팜투마켓 피크닉', '농장 산책 후 로컬 마켓 키트로 피크닉을 즐기는 프로그램입니다.', '생산자의 밭을 둘러보고 직접 고른 재료로 작은 피크닉 바구니를 준비합니다.', '한림', '팜투어', 38000, null, '90분', null, 'https://cdn.imweb.me/thumbnail/20230831/dca60ec8c7676.jpg', '한림 로컬팜', '농장과 작은 시장을 연결하는 로컬 파트너입니다.', '한림 로컬팜', '제주특별자치도 제주시 한림읍 협재로 33', 0, 5, '기획전', 4.6, 62, '이더라운드 에디터 픽 · 밭에서 바구니까지', '2~25명 · 전 연령', '체험 1일 전 오후 6시', '농장을 걷고 마켓 키트를 골라 피크닉으로 마무리합니다.'),
  ('private-fine-dining-night', '제주 파인다이닝 나이트', '제주 식재료 기반의 코스와 페어링을 즐기는 저녁 프로그램입니다.', '셰프가 큐레이션한 코스 메뉴와 로컬 술 페어링으로 여행의 밤을 완성합니다.', '중문', '미식', 142000, null, '210분', null, 'https://cdn.imweb.me/thumbnail/20230831/c0504b329b735.jpg', '중문 셰프 테이블', '제주 식재료를 현대적으로 해석하는 다이닝 팀입니다.', '중문 셰프 테이블', '제주특별자치도 서귀포시 중문관광로 72', 0, 6, '스페셜', 4.9, 36, '이더라운드 에디터 픽 · 제주 식재료 코스와 페어링', '2~8명 · 성인', '체험 3일 전 오후 6시', '셰프의 코스 소개로 시작해 페어링과 함께 저녁을 즐깁니다.'),
  ('haenyeo-private-storytelling', '해녀 프라이빗 스토리텔링 살롱', '해녀의 일생과 바다 이야기를 작은 살롱에서 깊이 듣는 비공개 프로그램입니다.', '회당 정원이 작고, 해녀 호스트의 일정과 인원 구성에 맞춰 운영되어 사전 문의 예약으로 진행됩니다. 희망 일정·인원을 남기면 호스트가 운영 가능 여부와 안내를 함께 회신합니다.', '구좌', '스토리', 0, null, '120분', '문의예약', 'https://cdn.imweb.me/thumbnail/20230831/2ca78f5658b74.jpg', '구좌 해녀 살롱', '구좌 해녀 5인이 직접 운영하는 비공개 살롱입니다.', '구좌 해녀 살롱', '제주특별자치도 제주시 구좌읍 해맞이해안로 88', 0, 7, '문의 예약', 5, 12, '이더라운드 에디터 픽 · 해녀 다섯 분이 여는 작은 살롱', '최대 6명 · 성인', '문의 후 일정 확정', '살롱에서 해녀의 일생과 바다 이야기를 가까이에서 듣는 비공개 프로그램입니다.'),
  ('corporate-workshop-package', '기업·기관 제주 로컬 워크숍 패키지', '팀 빌딩과 로컬 체험을 묶은 단체 견적 전용 패키지입니다. 10명부터 단체 할인이 적용됩니다.', '발효 클래스·양조장 투어·해녀 살롱을 기간과 인원에 맞춰 조합합니다. 기간·인원·옵션(숙박·식사·이동)을 선택해 단체 견적을 즉시 받아볼 수 있습니다.', '제주시', '워크숍', 580000, null, '1박 2일', '단체', 'https://cdn.imweb.me/thumbnail/20230831/5089900ac1a12.jpg', '이더라운드 B2B 운영팀', '기업·기관 워크숍과 로컬 패키지를 전담 운영합니다.', '제주 전역 (희망 지역 기준)', '선택한 일정·지역에 따라 운영팀이 안내합니다.', 0, 8, '기업·기관 패키지', 4.9, 21, '기업·기관 전용 · 인원과 기간에 맞춘 로컬 워크숍', '10~50명 · 단체', '견적 협의 후 확정', '체험·강의·투어를 기간과 인원에 맞춰 조합하고, 숙박·식사·이동 옵션을 더합니다.')
on conflict (slug) do update set title = excluded.title, summary = excluded.summary, description = excluded.description, region = excluded.region, category = excluded.category, price = excluded.price, original_price = excluded.original_price, duration = excluded.duration, badge = excluded.badge, image_url = excluded.image_url, host_name = excluded.host_name, host_description = excluded.host_description, place_name = excluded.place_name, place_address = excluded.place_address, is_featured = excluded.is_featured, sort_order = excluded.sort_order, eyebrow = excluded.eyebrow, rating = excluded.rating, review_count = excluded.review_count, kicker = excluded.kicker, group_label = excluded.group_label, booking_deadline = excluded.booking_deadline, course_intro = excluded.course_intro;

insert into product_tags
  (product_id, tag)
select id, '쿠킹' from products where slug = 'jeju-fermentation-table'
union all
select id, '막걸리' from products where slug = 'jeju-fermentation-table'
union all
select id, '소규모' from products where slug = 'jeju-fermentation-table'
union all
select id, '실내' from products where slug = 'jeju-fermentation-table'
union all
select id, '양조장' from products where slug = 'brewery-village-walk'
union all
select id, '마을' from products where slug = 'brewery-village-walk'
union all
select id, '시음' from products where slug = 'brewery-village-walk'
union all
select id, '해녀' from products where slug = 'haenyeo-seafood-table'
union all
select id, '식사' from products where slug = 'haenyeo-seafood-table'
union all
select id, '스토리' from products where slug = 'haenyeo-seafood-table'
union all
select id, '웰니스' from products where slug = 'haenyeo-seafood-table'
union all
select id, '쿠킹' from products where slug = 'citrus-dessert-lab'
union all
select id, '베이킹' from products where slug = 'citrus-dessert-lab'
union all
select id, '가족' from products where slug = 'citrus-dessert-lab'
union all
select id, '감귤' from products where slug = 'citrus-dessert-lab'
union all
select id, '실내' from products where slug = 'citrus-dessert-lab'
union all
select id, '농장' from products where slug = 'farm-to-market-picnic'
union all
select id, '마켓' from products where slug = 'farm-to-market-picnic'
union all
select id, '피크닉' from products where slug = 'farm-to-market-picnic'
union all
select id, '파인다이닝' from products where slug = 'private-fine-dining-night'
union all
select id, '와인' from products where slug = 'private-fine-dining-night'
union all
select id, '프라이빗' from products where slug = 'private-fine-dining-night'
union all
select id, '해녀' from products where slug = 'haenyeo-private-storytelling'
union all
select id, '스토리' from products where slug = 'haenyeo-private-storytelling'
union all
select id, '실내' from products where slug = 'haenyeo-private-storytelling'
union all
select id, '프라이빗' from products where slug = 'haenyeo-private-storytelling'
union all
select id, '소규모' from products where slug = 'haenyeo-private-storytelling'
union all
select id, '기업·기관' from products where slug = 'corporate-workshop-package'
union all
select id, '단체' from products where slug = 'corporate-workshop-package'
union all
select id, '워크숍' from products where slug = 'corporate-workshop-package'
union all
select id, '패키지' from products where slug = 'corporate-workshop-package'
union all
select id, '프라이빗' from products where slug = 'corporate-workshop-package'
on conflict (product_id, tag) do nothing;

insert into product_schedules
  (product_id, schedule_date, schedule_label, capacity, booked, max_teams, reserved_teams, team_capacity, reservation_type, approval_required, price)
select id, '2026-05-23'::date, '오전 10:30', 12, 7, 3, 2, 4, 'approval', 1, 68000 from products where slug = 'jeju-fermentation-table'
union all
select id, '2026-05-24'::date, '오후 14:00', 12, 11, 3, 3, 4, 'approval', 1, 68000 from products where slug = 'jeju-fermentation-table'
union all
select id, '2026-05-30'::date, '오전 10:30', 16, 4, 4, 1, 4, 'instant', 0, 72000 from products where slug = 'jeju-fermentation-table'
union all
select id, '2026-05-22'::date, '오후 15:00', 20, 8, 4, 2, 5, 'instant', 0, 54000 from products where slug = 'brewery-village-walk'
union all
select id, '2026-05-29'::date, '오후 15:00', 20, 19, 4, 4, 5, 'approval', 1, 54000 from products where slug = 'brewery-village-walk'
union all
select id, '2026-06-05'::date, '오후 16:00', 20, 2, 4, 1, 5, 'instant', 0, 56000 from products where slug = 'brewery-village-walk'
union all
select id, '2026-05-25'::date, '오전 11:00', 10, 9, 2, 2, 5, 'approval', 1, 96000 from products where slug = 'haenyeo-seafood-table'
union all
select id, '2026-06-01'::date, '오전 11:00', 10, 3, 2, 1, 5, 'approval', 1, 96000 from products where slug = 'haenyeo-seafood-table'
union all
select id, '2026-05-23'::date, '오후 13:30', 18, 17, 6, 6, 3, 'instant', 0, 42000 from products where slug = 'citrus-dessert-lab'
union all
select id, '2026-05-31'::date, '오후 13:30', 18, 12, 6, 4, 3, 'instant', 0, 42000 from products where slug = 'citrus-dessert-lab'
union all
select id, '2026-05-26'::date, '오전 10:00', 25, 11, 5, 3, 5, 'instant', 0, 38000 from products where slug = 'farm-to-market-picnic'
union all
select id, '2026-06-02'::date, '오전 10:00', 25, 8, 5, 2, 5, 'instant', 0, 38000 from products where slug = 'farm-to-market-picnic'
union all
select id, '2026-05-24'::date, '오후 18:30', 8, 5, 2, 2, 4, 'approval', 1, 142000 from products where slug = 'private-fine-dining-night'
union all
select id, '2026-05-31'::date, '오후 18:30', 8, 7, 2, 2, 4, 'approval', 1, 142000 from products where slug = 'private-fine-dining-night'
union all
select id, '2026-06-08'::date, '오전 11:00', 6, 0, 1, 0, 6, 'inquiry', 1, 0 from products where slug = 'haenyeo-private-storytelling'
union all
select id, '2026-06-15'::date, '오후 15:00', 6, 0, 1, 0, 6, 'inquiry', 1, 0 from products where slug = 'haenyeo-private-storytelling'
union all
select id, '2026-06-22'::date, '오전 11:00', 6, 0, 1, 0, 6, 'inquiry', 1, 0 from products where slug = 'haenyeo-private-storytelling'
union all
select id, '2026-06-12'::date, '패키지 견적', 50, 0, 5, 0, 10, 'inquiry', 1, 580000 from products where slug = 'corporate-workshop-package'
on conflict (product_id, schedule_date, schedule_label) do update set capacity = excluded.capacity, booked = excluded.booked, max_teams = excluded.max_teams, reserved_teams = excluded.reserved_teams, team_capacity = excluded.team_capacity, reservation_type = excluded.reservation_type, approval_required = excluded.approval_required, price = excluded.price;

insert into events
  (slug, title, status, period_label, venue, partner, summary, image_url, sort_order)
values
  ('jeju-local-table-2026', '제주 로컬테이블 2026', 'ongoing', '2026.05.01 - 2026.06.30', '제주시 원도심 일대', '제주시 문화재단', '제주 생산자, 셰프, 여행자가 만나는 시즌형 미식 행사입니다.', 'https://cdn.imweb.me/thumbnail/20230831/5089900ac1a12.jpg', 1),
  ('brewery-week', '로컬 브루어리 위크', 'ongoing', '2026.05.20 - 2026.05.28', '서귀포 로컬 브루어리', '서귀포 브루어리 협의체', '양조장 투어, 페어링 다이닝, 토크가 이어지는 일주일 프로그램입니다.', 'https://cdn.imweb.me/thumbnail/20230831/65c0d9fa53fd2.jpg', 2),
  ('market-picnic-day', '마켓 피크닉 데이', 'ended', '2025.10.03 - 2025.10.05', '한림 로컬마켓', '한림읍 상인회', '로컬 생산자 마켓과 가족 피크닉 체험을 결합한 행사 결과입니다.', 'https://cdn.imweb.me/thumbnail/20230831/dca60ec8c7676.jpg', 3)
on conflict (slug) do update set title = excluded.title, status = excluded.status, period_label = excluded.period_label, venue = excluded.venue, partner = excluded.partner, summary = excluded.summary, image_url = excluded.image_url, sort_order = excluded.sort_order;

insert into collections
  (slug, eyebrow, title, subtitle, image_url, link_url, sort_order)
values
  ('jeju-local-food', '미식 여행', '제주 한 끼를 오래 기억하는 방법', '로컬 식재료와 호스트가 있는 기획전', 'https://cdn.imweb.me/thumbnail/20230831/2ca78f5658b74.jpg', '/curations/jeju-local-food', 1),
  ('seogwipo-brewery', '서귀포', '양조장과 마을 산책', '마을과 술 이야기를 함께 걷는 코스', 'https://cdn.imweb.me/thumbnail/20230831/65c0d9fa53fd2.jpg', '/curations/seogwipo-brewery', 2),
  ('team-workshop', 'Team', '기관 워크숍 추천 코스', '단체 인원에 맞춘 제주 로컬 패키지', 'https://cdn.imweb.me/thumbnail/20230831/dca60ec8c7676.jpg', '/curations/team-workshop', 3)
on conflict (slug) do update set eyebrow = excluded.eyebrow, title = excluded.title, subtitle = excluded.subtitle, image_url = excluded.image_url, link_url = excluded.link_url, sort_order = excluded.sort_order;

insert into package_programs
  (code, title, program_type, base_price, duration)
values
  ('food-class', '제주 미식 클래스', 'experience', 68000, '150분'),
  ('brewery-tour', '양조장 투어', 'tour', 54000, '120분'),
  ('host-lecture', '로컬 브랜드 강의', 'lecture', 350000, '90분'),
  ('market-picnic', '팜투마켓 피크닉', 'experience', 38000, '90분')
on conflict (code) do update set title = excluded.title, program_type = excluded.program_type, base_price = excluded.base_price, duration = excluded.duration;

insert into package_options
  (code, title, description, price, price_type, category, sort_order)
values
  ('lodging-standard', '스탠다드 숙박', '1박 2인실 기준 숙소 추천 및 섭외', 90000, 'person', 'lodging', 1),
  ('lodging-pension', '단체 펜션 섭외', '그룹 단위로 활용 가능한 펜션 풀패키지', 70000, 'person', 'lodging', 2),
  ('meal-local', '로컬 식당 식사', '지역 로컬 식당 사전 예약·세팅', 25000, 'person', 'meal', 3),
  ('meal-catering', '케이터링 식사', '체험 현장으로 도착하는 단체 케이터링', 32000, 'person', 'meal', 4),
  ('transport-bus', '전세 버스', '전 일정 단체 이동(45인승)', 480000, 'flat', 'transport', 5),
  ('transport-van', '프라이빗 밴', '소규모 이동을 위한 12인승 밴', 300000, 'flat', 'transport', 6),
  ('extra-photo', '현장 사진 기록', '행사 운영 사진·하이라이트 영상 제공', 250000, 'flat', 'extra', 7)
on conflict (code) do update set title = excluded.title, description = excluded.description, price = excluded.price, price_type = excluded.price_type, category = excluded.category, sort_order = excluded.sort_order;

insert into discount_tiers
  (min_people, discount_rate, label, sort_order)
values
  (50, 0.15, '50명 이상 별도 문의', 1),
  (30, 0.15, '30명 이상 단체 할인', 2),
  (20, 0.1, '20명 이상 단체 할인', 3),
  (10, 0.05, '10명 이상 단체 할인', 4),
  (1, 0, '기본가', 5)
on conflict (min_people) do update set discount_rate = excluded.discount_rate, label = excluded.label, sort_order = excluded.sort_order;

insert into journals
  (slug, title, category, excerpt, image_url, published_at)
values
  ('how-to-meet-jeju-hosts', '좋은 로컬 호스트를 만나는 방법', 'Guide', '체험을 고를 때 살펴보면 좋은 호스트, 장소, 일정 기준을 소개합니다.', 'https://cdn.imweb.me/thumbnail/20230831/2ca78f5658b74.jpg', '2026-05-10 09:00:00+09'),
  ('jeju-fermentation-notes', '제주 발효장의 작은 노트', 'Food', '여행자가 클래스에서 자주 묻는 제주 장과 술 이야기를 모았습니다.', 'https://cdn.imweb.me/thumbnail/20230831/266f4e7d5ddb5.jpg', '2026-04-28 09:00:00+09'),
  ('team-workshop-checklist', '기관 워크숍 견적 전 체크리스트', 'B2B', '인원, 기간, 프로그램 조합을 빠르게 확정하기 위한 실무형 체크리스트입니다.', 'https://cdn.imweb.me/thumbnail/20230831/c0504b329b735.jpg', '2026-04-12 09:00:00+09')
on conflict (slug) do update set title = excluded.title, category = excluded.category, excerpt = excluded.excerpt, image_url = excluded.image_url, published_at = excluded.published_at;

-- 상품 상세 항목: 시드 상품의 항목을 지우고 다시 넣습니다.
delete from product_detail_items where product_id in (select id from products where slug in ('jeju-fermentation-table', 'brewery-village-walk', 'haenyeo-seafood-table', 'citrus-dessert-lab', 'farm-to-market-picnic', 'private-fine-dining-night', 'haenyeo-private-storytelling', 'corporate-workshop-package'));

insert into product_detail_items (product_id, content_type, label, body, meta, note, sort_order)
select p.id, s.content_type, s.label, s.body, s.meta, s.note, s.sort_order
  from (values
  ('jeju-fermentation-table', 'highlight', null, '제철 식재료 해설', null, null, 1),
  ('jeju-fermentation-table', 'highlight', null, '발효장 테이스팅', null, null, 2),
  ('jeju-fermentation-table', 'highlight', null, '완성 메뉴 식사', null, null, 3),
  ('jeju-fermentation-table', 'highlight', null, '레시피 카드 제공', null, null, 4),
  ('jeju-fermentation-table', 'included', null, '재료비', null, null, 1),
  ('jeju-fermentation-table', 'included', null, '시음 2종', null, null, 2),
  ('jeju-fermentation-table', 'included', null, '식사', null, null, 3),
  ('jeju-fermentation-table', 'included', null, '앞치마 대여', null, null, 4),
  ('jeju-fermentation-table', 'notice', null, '알레르기가 있다면 예약 시 남겨주세요.', null, null, 1),
  ('jeju-fermentation-table', 'notice', null, '시작 10분 전 도착을 권장합니다.', null, null, 2),
  ('jeju-fermentation-table', 'recommended', null, '제주시에서 미식 체험을 찾는 분', null, null, 1),
  ('jeju-fermentation-table', 'recommended', null, '소규모로 깊이 있는 시간을 보내고 싶은 분', null, null, 2),
  ('jeju-fermentation-table', 'recommended', null, '호스트 확인 후 확정되는 일정을 원하는 분', null, null, 3),
  ('jeju-fermentation-table', 'excluded', null, '개인 여행자 보험', null, null, 1),
  ('jeju-fermentation-table', 'excluded', null, '왕복 교통', null, null, 2),
  ('jeju-fermentation-table', 'excluded', null, '포함사항 외 추가 주문', null, null, 3),
  ('jeju-fermentation-table', 'schedule', '도착 10분 전', '체크인과 안내', null, null, 1),
  ('jeju-fermentation-table', 'schedule', '0:10', '호스트 소개와 지역 이야기', null, null, 2),
  ('jeju-fermentation-table', 'schedule', '0:30', '메인 체험 진행', null, null, 3),
  ('jeju-fermentation-table', 'schedule', '마무리', '식사 또는 시음, 질의응답', null, null, 4),
  ('jeju-fermentation-table', 'point', '제철 식재료를 호스트 해설과 함께', '그날 들어온 제주 식재료의 산지와 쓰임을 먼저 듣고 시작해요.', null, null, 1),
  ('jeju-fermentation-table', 'point', '제주 장과 술지게미 테이스팅', '발효 양념 2종을 맛보며 차이를 직접 느껴봅니다.', null, null, 2),
  ('jeju-fermentation-table', 'point', '완성한 밥상을 함께 식사', '만든 반찬과 메인 메뉴로 식사하고 레시피 카드를 받아 가요.', null, null, 3),
  ('jeju-fermentation-table', 'course', '체크인과 식재료 이야기', '앞치마를 두르고 오늘 쓸 제철 식재료와 발효 양념을 소개받아요.', '25분', '체크인 · 테이스팅', 1),
  ('jeju-fermentation-table', 'course', '반찬과 메인 메뉴 조리', '호스트와 함께 손질부터 조리까지, 팀별로 한 상을 완성합니다.', '75분', '조리 실습', 2),
  ('jeju-fermentation-table', 'course', '완성 밥상 식사', '함께 식사하며 제주 생산자 이야기와 질문을 나눕니다.', '50분', '식사 · 질의응답', 3),
  ('jeju-fermentation-table', 'faq', '요리를 못해도 괜찮나요?', '손질부터 호스트가 함께 진행해 처음이어도 어렵지 않습니다.', null, null, 1),
  ('jeju-fermentation-table', 'faq', '알레르기가 있으면 어떻게 하나요?', '예약 시 요청사항에 남겨주시면 가능한 범위에서 재료를 조정합니다.', null, null, 2),
  ('brewery-village-walk', 'highlight', null, '양조장 투어', null, null, 1),
  ('brewery-village-walk', 'highlight', null, '전통주 시음', null, null, 2),
  ('brewery-village-walk', 'highlight', null, '마을 해설', null, null, 3),
  ('brewery-village-walk', 'highlight', null, '로컬 간식', null, null, 4),
  ('brewery-village-walk', 'included', null, '전문 해설', null, null, 1),
  ('brewery-village-walk', 'included', null, '시음', null, null, 2),
  ('brewery-village-walk', 'included', null, '간식', null, null, 3),
  ('brewery-village-walk', 'notice', null, '만 19세 이상만 시음이 가능합니다.', null, null, 1),
  ('brewery-village-walk', 'notice', null, '편한 신발을 권장합니다.', null, null, 2),
  ('brewery-village-walk', 'point', '발효실을 직접 둘러보기', '술이 빚어지는 과정을 양조사의 설명으로 가까이에서 봅니다.', null, null, 1),
  ('brewery-village-walk', 'point', '마을 골목 산책', '재료가 오가는 길을 따라 걸으며 마을 이야기를 들어요.', null, null, 2),
  ('brewery-village-walk', 'point', '로컬 술 시음', '양조장에서 빚은 술을 비교해 맛봅니다.', null, null, 3),
  ('brewery-village-walk', 'course', '양조장 발효실 투어', '원료와 발효 과정을 설명과 함께 둘러봅니다.', '40분', '양조장 투어', 1),
  ('brewery-village-walk', 'course', '마을 골목 산책', '양조장 주변 골목을 천천히 걸으며 지역 이야기를 듣습니다.', '50분', '도보 이동', 2),
  ('brewery-village-walk', 'course', '시음과 마무리', '양조장으로 돌아와 술을 시음하고 질문을 나눕니다.', '30분', '시음', 3),
  ('brewery-village-walk', 'faq', '술을 마시지 못해도 참여할 수 있나요?', '시음은 선택이며, 투어와 산책만 참여하셔도 됩니다.', null, null, 1),
  ('brewery-village-walk', 'faq', '차를 가져가도 되나요?', '시음이 포함되어 있어 운전하시는 분은 시음을 삼가 주세요.', null, null, 2),
  ('haenyeo-seafood-table', 'highlight', null, '해녀 토크', null, null, 1),
  ('haenyeo-seafood-table', 'highlight', null, '계절 해산물', null, null, 2),
  ('haenyeo-seafood-table', 'highlight', null, '사진 포인트', null, null, 3),
  ('haenyeo-seafood-table', 'highlight', null, '소규모 식사', null, null, 4),
  ('haenyeo-seafood-table', 'included', null, '식사', null, null, 1),
  ('haenyeo-seafood-table', 'included', null, '웰컴 티', null, null, 2),
  ('haenyeo-seafood-table', 'included', null, '호스트 해설', null, null, 3),
  ('haenyeo-seafood-table', 'notice', null, '기상 상황에 따라 메뉴가 바뀔 수 있습니다.', null, null, 1),
  ('haenyeo-seafood-table', 'notice', null, '해산물 알레르기 확인이 필요합니다.', null, null, 2),
  ('haenyeo-seafood-table', 'point', '해녀가 직접 들려주는 이야기', '구좌 바다의 계절과 물질 이야기를 가까이에서 듣습니다.', null, null, 1),
  ('haenyeo-seafood-table', 'point', '그날 들어온 제철 해산물', '당일 식재료에 맞춰 밥상 구성이 달라져요.', null, null, 2),
  ('haenyeo-seafood-table', 'point', '소규모로 여유롭게', '한 회차 10명 이내로 운영합니다.', null, null, 3),
  ('haenyeo-seafood-table', 'course', '해녀의 바다 이야기', '작업장에서 물질 도구와 바다의 계절 이야기를 듣습니다.', '40분', '스토리텔링', 1),
  ('haenyeo-seafood-table', 'course', '식재료 손질 보기', '그날 들어온 해산물을 살펴보고 손질 과정을 함께 봅니다.', '40분', '식재료 안내', 2),
  ('haenyeo-seafood-table', 'course', '제철 바다 밥상', '차려진 밥상을 함께 나누며 이야기를 이어갑니다.', '100분', '식사', 3),
  ('haenyeo-seafood-table', 'faq', '물에 들어가나요?', '아니요. 물질 체험이 아니라 이야기와 식사 중심의 프로그램입니다.', null, null, 1),
  ('haenyeo-seafood-table', 'faq', '해산물을 못 먹는 메뉴가 있으면요?', '예약 시 남겨주시면 가능한 범위에서 구성을 조정합니다.', null, null, 2),
  ('citrus-dessert-lab', 'highlight', null, '감귤청 만들기', null, null, 1),
  ('citrus-dessert-lab', 'highlight', null, '미니 타르트', null, null, 2),
  ('citrus-dessert-lab', 'highlight', null, '포장 제공', null, null, 3),
  ('citrus-dessert-lab', 'highlight', null, '가족석 운영', null, null, 4),
  ('citrus-dessert-lab', 'included', null, '재료비', null, null, 1),
  ('citrus-dessert-lab', 'included', null, '포장 박스', null, null, 2),
  ('citrus-dessert-lab', 'included', null, '음료', null, null, 3),
  ('citrus-dessert-lab', 'notice', null, '초등 저학년은 보호자 동반이 필요합니다.', null, null, 1),
  ('citrus-dessert-lab', 'notice', null, '예약 인원 기준으로 재료가 준비됩니다.', null, null, 2),
  ('citrus-dessert-lab', 'point', '아이도 따라 할 수 있는 난도', '계량과 장식 중심이라 어린이도 쉽게 참여해요.', null, null, 1),
  ('citrus-dessert-lab', 'point', '제주 감귤 품종 이야기', '품종별 맛의 차이를 시식하며 배웁니다.', null, null, 2),
  ('citrus-dessert-lab', 'point', '만든 디저트는 포장', '완성한 디저트를 상자에 담아 가져갑니다.', null, null, 3),
  ('citrus-dessert-lab', 'course', '감귤 이야기와 시식', '품종별 감귤을 맛보고 오늘 만들 메뉴를 소개받습니다.', '20분', '시식', 1),
  ('citrus-dessert-lab', 'course', '디저트와 음료 만들기', '감귤 디저트와 음료를 단계별로 함께 만듭니다.', '60분', '베이킹 실습', 2),
  ('citrus-dessert-lab', 'course', '포장과 마무리', '완성품을 포장하고 사진을 남깁니다.', '20분', '포장', 3),
  ('citrus-dessert-lab', 'faq', '아이 혼자 참여할 수 있나요?', '미취학·초등 저학년은 보호자 동반이 필요합니다.', null, null, 1),
  ('citrus-dessert-lab', 'faq', '준비물이 있나요?', '재료와 도구, 앞치마가 모두 준비되어 있습니다.', null, null, 2),
  ('farm-to-market-picnic', 'highlight', null, '농장 산책', null, null, 1),
  ('farm-to-market-picnic', 'highlight', null, '마켓 쿠폰', null, null, 2),
  ('farm-to-market-picnic', 'highlight', null, '피크닉 매트', null, null, 3),
  ('farm-to-market-picnic', 'highlight', null, '사진 스팟', null, null, 4),
  ('farm-to-market-picnic', 'included', null, '입장', null, null, 1),
  ('farm-to-market-picnic', 'included', null, '마켓 키트', null, null, 2),
  ('farm-to-market-picnic', 'included', null, '피크닉 대여', null, null, 3),
  ('farm-to-market-picnic', 'notice', null, '우천 시 실내 마켓 투어로 전환됩니다.', null, null, 1),
  ('farm-to-market-picnic', 'notice', null, '반려동물 동반은 별도 문의가 필요합니다.', null, null, 2),
  ('farm-to-market-picnic', 'point', '생산자의 밭 산책', '농장을 걸으며 작물과 재배 이야기를 듣습니다.', null, null, 1),
  ('farm-to-market-picnic', 'point', '직접 고르는 마켓 키트', '로컬 재료로 피크닉 바구니를 채워요.', null, null, 2),
  ('farm-to-market-picnic', 'point', '야외 피크닉', '준비된 자리에서 여유롭게 즐깁니다.', null, null, 3),
  ('farm-to-market-picnic', 'course', '농장 산책', '생산자와 함께 밭을 둘러봅니다.', '30분', '도보 이동', 1),
  ('farm-to-market-picnic', 'course', '마켓 키트 고르기', '작은 마켓에서 재료를 골라 바구니를 준비합니다.', '20분', '키트 구성', 2),
  ('farm-to-market-picnic', 'course', '피크닉', '농장 한편에서 피크닉을 즐깁니다.', '40분', '자유 시간', 3),
  ('farm-to-market-picnic', 'faq', '비가 오면 어떻게 되나요?', '우천 시에는 일정 변경 또는 환불 기준에 맞춰 안내드립니다.', null, null, 1),
  ('farm-to-market-picnic', 'faq', '반려동물과 함께할 수 있나요?', '농장 운영상 반려동물 동반은 어렵습니다.', null, null, 2),
  ('private-fine-dining-night', 'highlight', null, '코스 다이닝', null, null, 1),
  ('private-fine-dining-night', 'highlight', null, '페어링', null, null, 2),
  ('private-fine-dining-night', 'highlight', null, '셰프 토크', null, null, 3),
  ('private-fine-dining-night', 'highlight', null, '프라이빗 테이블', null, null, 4),
  ('private-fine-dining-night', 'included', null, '코스 식사', null, null, 1),
  ('private-fine-dining-night', 'included', null, '페어링 3종', null, null, 2),
  ('private-fine-dining-night', 'included', null, '서비스 차지', null, null, 3),
  ('private-fine-dining-night', 'notice', null, '메뉴는 제철 재료에 따라 변경됩니다.', null, null, 1),
  ('private-fine-dining-night', 'notice', null, '노쇼 방지를 위해 사전 결제가 필요합니다.', null, null, 2),
  ('private-fine-dining-night', 'point', '셰프가 구성한 코스', '제주 식재료를 중심으로 한 코스 메뉴입니다.', null, null, 1),
  ('private-fine-dining-night', 'point', '로컬 술 페어링', '코스에 맞춘 로컬 술을 함께 곁들입니다.', null, null, 2),
  ('private-fine-dining-night', 'point', '한 회차 8명 이내', '프라이빗한 분위기로 진행합니다.', null, null, 3),
  ('private-fine-dining-night', 'course', '웰컴과 코스 소개', '셰프가 오늘의 식재료와 코스를 소개합니다.', '20분', '웰컴 드링크', 1),
  ('private-fine-dining-night', 'course', '코스 다이닝', '코스와 페어링이 순서대로 제공됩니다.', '160분', '코스 · 페어링', 2),
  ('private-fine-dining-night', 'course', '셰프와의 대화', '식사를 마친 뒤 셰프와 이야기를 나눕니다.', '30분', '마무리', 3),
  ('private-fine-dining-night', 'faq', '술 없이 코스만 가능한가요?', '논알코올 페어링으로 변경할 수 있습니다. 예약 시 남겨주세요.', null, null, 1),
  ('private-fine-dining-night', 'faq', '드레스 코드가 있나요?', '따로 없으며 편안한 차림으로 오시면 됩니다.', null, null, 2),
  ('haenyeo-private-storytelling', 'highlight', null, '해녀 호스트와의 1:1 살롱', null, null, 1),
  ('haenyeo-private-storytelling', 'highlight', null, '잠수 도구 시연', null, null, 2),
  ('haenyeo-private-storytelling', 'highlight', null, '지역 차 페어링', null, null, 3),
  ('haenyeo-private-storytelling', 'highlight', null, '기록 사진 제공', null, null, 4),
  ('haenyeo-private-storytelling', 'included', null, '입장', null, null, 1),
  ('haenyeo-private-storytelling', 'included', null, '웰컴 티', null, null, 2),
  ('haenyeo-private-storytelling', 'included', null, '촬영', null, null, 3),
  ('haenyeo-private-storytelling', 'included', null, '호스트 해설', null, null, 4),
  ('haenyeo-private-storytelling', 'notice', null, '호스트 일정에 따라 회신까지 24시간 정도 걸릴 수 있습니다.', null, null, 1),
  ('haenyeo-private-storytelling', 'notice', null, '단체·기업 진행은 별도 견적으로 안내합니다.', null, null, 2),
  ('haenyeo-private-storytelling', 'point', '비공개 소규모 살롱', '회당 6명 이내로만 진행합니다.', null, null, 1),
  ('haenyeo-private-storytelling', 'point', '해녀의 일생 이야기', '물질을 시작한 날부터 지금까지의 이야기를 듣습니다.', null, null, 2),
  ('haenyeo-private-storytelling', 'point', '문의 후 일정 조율', '호스트 일정과 인원에 맞춰 날짜를 확정합니다.', null, null, 3),
  ('haenyeo-private-storytelling', 'course', '살롱 입장과 인사', '차를 나누며 호스트와 인사를 나눕니다.', '20분', '웰컴 티', 1),
  ('haenyeo-private-storytelling', 'course', '스토리텔링', '해녀의 일생과 바다 이야기를 듣고 질문합니다.', '80분', '이야기 · 질의응답', 2),
  ('haenyeo-private-storytelling', 'course', '마무리', '사진과 기록을 남기고 마칩니다.', '20분', '마무리', 3),
  ('haenyeo-private-storytelling', 'faq', '가격은 어떻게 정해지나요?', '인원과 일정에 따라 달라지며, 문의를 남기시면 호스트가 회신합니다.', null, null, 1),
  ('haenyeo-private-storytelling', 'faq', '예약은 바로 확정되나요?', '아니요. 문의 접수 후 운영 가능 여부를 확인해 안내드립니다.', null, null, 2),
  ('corporate-workshop-package', 'highlight', null, '맞춤 프로그램 조합', null, null, 1),
  ('corporate-workshop-package', 'highlight', null, '단체 할인 자동 적용', null, null, 2),
  ('corporate-workshop-package', 'highlight', null, '운영팀 24시간 검토', null, null, 3),
  ('corporate-workshop-package', 'highlight', null, '최종 견적서 발송', null, null, 4),
  ('corporate-workshop-package', 'included', null, '프로그램 진행', null, null, 1),
  ('corporate-workshop-package', 'included', null, '운영 인력', null, null, 2),
  ('corporate-workshop-package', 'included', null, '단체 사진', null, null, 3),
  ('corporate-workshop-package', 'notice', null, '10인부터 단체 할인이 적용되고 50인 이상은 별도 안내합니다.', null, null, 1),
  ('corporate-workshop-package', 'notice', null, '공휴일·성수기 진행은 가용성에 따라 변동될 수 있습니다.', null, null, 2),
  ('corporate-workshop-package', 'point', '프로그램 조합형 패키지', '발효 클래스, 양조장 투어, 해녀 살롱을 원하는 대로 조합합니다.', null, null, 1),
  ('corporate-workshop-package', 'point', '10명부터 단체 할인', '인원 구간에 따라 할인율이 적용됩니다.', null, null, 2),
  ('corporate-workshop-package', 'point', '숙박·식사·이동까지 한 번에', '옵션을 선택하면 견적에 함께 반영됩니다.', null, null, 3),
  ('corporate-workshop-package', 'course', '도착과 오리엔테이션', '일정 안내 후 첫 프로그램 장소로 이동합니다.', '1일차 오전', '집결 · 이동', 1),
  ('corporate-workshop-package', 'course', '로컬 체험 프로그램', '선택한 체험 또는 투어를 진행합니다.', '1일차 오후', '체험 · 투어', 2),
  ('corporate-workshop-package', 'course', '강의와 마무리', '로컬 브랜드 강의 후 일정을 마칩니다.', '2일차', '강의 · 해산', 3),
  ('corporate-workshop-package', 'faq', '견적은 어떻게 받나요?', '단체 견적 요청에서 인원, 기간, 프로그램을 선택하면 예상 견적을 바로 확인할 수 있습니다.', null, null, 1),
  ('corporate-workshop-package', 'faq', '일정을 맞춤으로 바꿀 수 있나요?', '네. 접수 후 운영팀이 희망 일정에 맞춰 조정해 안내드립니다.', null, null, 2)
  ) as s(slug, content_type, label, body, meta, note, sort_order)
  join products p on p.slug = s.slug;

-- 리뷰는 고유 키가 없어 비어 있을 때만 넣습니다.

insert into product_reviews
  (product_id, rating, body, status)
select * from (
select id, 5::smallint, '일정 안내가 명확했고 호스트 설명이 좋아서 제주를 더 가까이 느낄 수 있었어요.', 'approved' from products where slug = 'jeju-fermentation-table'
union all
select id, 5::smallint, '팀 단위로 예약 가능한 회차가 보여서 인원 조율이 편했습니다.', 'approved' from products where slug = 'jeju-fermentation-table'
) seed
where not exists (select 1 from product_reviews);
