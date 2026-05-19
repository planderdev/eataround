create database if not exists eataround
  default character set utf8mb4
  collate utf8mb4_unicode_ci;

use eataround;

create table users (
  id bigint unsigned not null auto_increment primary key,
  member_type enum('personal', 'company') not null default 'personal',
  email varchar(190) not null unique,
  password_hash varchar(255) not null,
  name varchar(80) not null,
  phone varchar(40) null,
  organization_name varchar(160) null,
  business_number varchar(40) null,
  company_approved tinyint(1) not null default 0,
  role enum('user', 'admin') not null default 'user',
  created_at datetime not null default current_timestamp,
  updated_at datetime not null default current_timestamp on update current_timestamp
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table products (
  id bigint unsigned not null auto_increment primary key,
  slug varchar(120) not null unique,
  title varchar(190) not null,
  summary varchar(500) null,
  description text null,
  region varchar(80) not null,
  category varchar(80) not null,
  price int unsigned not null default 0,
  original_price int unsigned null,
  duration varchar(80) null,
  badge varchar(40) null,
  image_url varchar(500) null,
  host_name varchar(160) null,
  host_description varchar(500) null,
  place_name varchar(160) null,
  place_address varchar(300) null,
  is_featured tinyint(1) not null default 0,
  is_visible tinyint(1) not null default 1,
  sort_order int not null default 0,
  created_at datetime not null default current_timestamp,
  updated_at datetime not null default current_timestamp on update current_timestamp
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table product_tags (
  product_id bigint unsigned not null,
  tag varchar(60) not null,
  primary key (product_id, tag),
  constraint fk_product_tags_product foreign key (product_id) references products(id) on delete cascade
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table categories (
  id bigint unsigned not null auto_increment primary key,
  label varchar(80) not null,
  href varchar(300) not null,
  icon_asset varchar(300) null,
  tone enum('green', 'coral', 'blue', 'yellow', 'red', 'ink') not null default 'green',
  is_visible tinyint(1) not null default 1,
  sort_order int not null default 0,
  created_at datetime not null default current_timestamp,
  unique key uniq_category_label (label)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table product_schedules (
  id bigint unsigned not null auto_increment primary key,
  product_id bigint unsigned not null,
  schedule_date date not null,
  schedule_label varchar(80) not null,
  capacity int unsigned not null,
  booked int unsigned not null default 0,
  max_teams int unsigned not null default 1,
  reserved_teams int unsigned not null default 0,
  team_capacity int unsigned not null default 1,
  reservation_type enum('instant', 'approval', 'inquiry') not null default 'approval',
  approval_required tinyint(1) not null default 1,
  price int unsigned not null,
  status enum('open', 'closed') not null default 'open',
  created_at datetime not null default current_timestamp,
  constraint fk_product_schedules_product foreign key (product_id) references products(id) on delete cascade,
  index idx_product_schedule (product_id, schedule_date),
  unique key uniq_product_schedule (product_id, schedule_date, schedule_label)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table reservations (
  id bigint unsigned not null auto_increment primary key,
  user_id bigint unsigned null,
  product_id bigint unsigned null,
  product_slug varchar(120) null,
  schedule_id bigint unsigned null,
  schedule_date date null,
  schedule_label varchar(80) null,
  people int unsigned not null default 1,
  total_amount int unsigned not null default 0,
  reservation_type enum('instant', 'approval', 'inquiry') not null default 'approval',
  approval_required tinyint(1) not null default 1,
  status enum('requested', 'confirmed', 'paid', 'canceled') not null default 'requested',
  memo varchar(500) null,
  created_at datetime not null default current_timestamp,
  updated_at datetime not null default current_timestamp on update current_timestamp,
  constraint fk_reservations_user foreign key (user_id) references users(id) on delete set null,
  constraint fk_reservations_product foreign key (product_id) references products(id) on delete set null,
  constraint fk_reservations_schedule foreign key (schedule_id) references product_schedules(id) on delete set null
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table events (
  id bigint unsigned not null auto_increment primary key,
  slug varchar(120) not null unique,
  title varchar(190) not null,
  status enum('ongoing', 'ended') not null default 'ongoing',
  period_label varchar(120) not null,
  venue varchar(190) null,
  partner varchar(190) null,
  summary varchar(500) null,
  image_url varchar(500) null,
  content longtext null,
  sort_order int not null default 0,
  created_at datetime not null default current_timestamp,
  updated_at datetime not null default current_timestamp on update current_timestamp
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table banners (
  id bigint unsigned not null auto_increment primary key,
  placement enum('home_main', 'home_event', 'package_cta') not null,
  eyebrow varchar(80) null,
  title varchar(190) not null,
  subtitle varchar(300) null,
  image_url varchar(500) null,
  link_url varchar(300) null,
  theme enum('red', 'green', 'blue') null,
  host_label varchar(120) null,
  host_images json null,
  is_visible tinyint(1) not null default 1,
  sort_order int not null default 0,
  starts_at datetime null,
  ends_at datetime null,
  created_at datetime not null default current_timestamp,
  unique key uniq_banner_placement_title (placement, title)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table collections (
  id bigint unsigned not null auto_increment primary key,
  slug varchar(120) not null unique,
  eyebrow varchar(80) null,
  title varchar(190) not null,
  subtitle varchar(300) null,
  image_url varchar(500) null,
  link_url varchar(300) null,
  is_visible tinyint(1) not null default 1,
  sort_order int not null default 0,
  created_at datetime not null default current_timestamp
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table package_programs (
  id bigint unsigned not null auto_increment primary key,
  code varchar(80) not null unique,
  title varchar(190) not null,
  program_type enum('experience', 'lecture', 'tour') not null,
  base_price int unsigned not null,
  duration varchar(80) null,
  is_visible tinyint(1) not null default 1,
  created_at datetime not null default current_timestamp
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table package_options (
  id bigint unsigned not null auto_increment primary key,
  code varchar(80) not null unique,
  title varchar(190) not null,
  description varchar(300) null,
  price int unsigned not null default 0,
  price_type enum('person', 'flat') not null default 'person',
  is_visible tinyint(1) not null default 1,
  sort_order int not null default 0,
  created_at datetime not null default current_timestamp
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table discount_tiers (
  id bigint unsigned not null auto_increment primary key,
  min_people int unsigned not null,
  discount_rate decimal(5, 4) not null default 0,
  label varchar(120) not null,
  is_active tinyint(1) not null default 1,
  sort_order int not null default 0,
  created_at datetime not null default current_timestamp,
  unique key uniq_discount_tier_people (min_people)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table quote_requests (
  id bigint unsigned not null auto_increment primary key,
  user_id bigint unsigned null,
  organization_name varchar(190) null,
  contact_name varchar(120) null,
  contact_phone varchar(60) null,
  budget_label varchar(120) null,
  people int unsigned not null,
  start_date date null,
  end_date date null,
  program_ids json null,
  option_ids json null,
  estimated_total int unsigned not null default 0,
  request_memo text null,
  status enum('requested', 'reviewing', 'sent', 'accepted', 'closed') not null default 'requested',
  admin_memo varchar(500) null,
  created_at datetime not null default current_timestamp,
  updated_at datetime not null default current_timestamp on update current_timestamp,
  constraint fk_quote_requests_user foreign key (user_id) references users(id) on delete set null
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table journals (
  id bigint unsigned not null auto_increment primary key,
  slug varchar(120) not null unique,
  title varchar(190) not null,
  category varchar(80) null,
  excerpt varchar(500) null,
  content longtext null,
  image_url varchar(500) null,
  is_visible tinyint(1) not null default 1,
  published_at datetime null,
  created_at datetime not null default current_timestamp,
  updated_at datetime not null default current_timestamp on update current_timestamp
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table inquiries (
  id bigint unsigned not null auto_increment primary key,
  user_id bigint unsigned null,
  inquiry_type enum('product', 'event', 'package', 'general') not null default 'general',
  title varchar(190) not null,
  body text not null,
  status enum('open', 'answered', 'closed') not null default 'open',
  created_at datetime not null default current_timestamp,
  constraint fk_inquiries_user foreign key (user_id) references users(id) on delete set null
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table product_detail_items (
  id bigint unsigned not null auto_increment primary key,
  product_id bigint unsigned not null,
  content_type enum('recommended', 'excluded', 'schedule') not null,
  label varchar(120) null,
  body varchar(500) not null,
  sort_order int not null default 0,
  created_at datetime not null default current_timestamp,
  constraint fk_product_detail_items_product foreign key (product_id) references products(id) on delete cascade,
  index idx_product_detail_items (product_id, content_type, sort_order)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table product_reviews (
  id bigint unsigned not null auto_increment primary key,
  product_id bigint unsigned null,
  user_id bigint unsigned null,
  rating tinyint unsigned not null default 5,
  body text not null,
  status enum('pending', 'approved', 'hidden') not null default 'pending',
  created_at datetime not null default current_timestamp,
  updated_at datetime not null default current_timestamp on update current_timestamp,
  constraint fk_product_reviews_product foreign key (product_id) references products(id) on delete set null,
  constraint fk_product_reviews_user foreign key (user_id) references users(id) on delete set null
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table coupons (
  id bigint unsigned not null auto_increment primary key,
  code varchar(80) not null unique,
  title varchar(190) not null,
  discount_type enum('percent', 'amount') not null default 'percent',
  discount_value int unsigned not null,
  starts_at datetime null,
  ends_at datetime null,
  is_active tinyint(1) not null default 1,
  created_at datetime not null default current_timestamp
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table host_settlements (
  id bigint unsigned not null auto_increment primary key,
  host_name varchar(160) not null,
  sales_amount int unsigned not null default 0,
  commission_amount int unsigned not null default 0,
  payout_amount int unsigned not null default 0,
  status enum('draft', 'confirmed', 'paid') not null default 'draft',
  settled_at datetime null,
  created_at datetime not null default current_timestamp
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;
