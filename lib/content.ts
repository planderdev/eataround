import type { RowDataPacket } from "mysql2";
import {
  adminQuoteRequests as fallbackAdminQuoteRequests,
  adminMembers as fallbackAdminMembers,
  adminReservations as fallbackAdminReservations,
  categories as fallbackCategories,
  collections as fallbackCollections,
  discountTiers as fallbackDiscountTiers,
  events as fallbackEvents,
  experiences as fallbackExperiences,
  getEvent as getFallbackEvent,
  getExperience as getFallbackExperience,
  getJournal as getFallbackJournal,
  heroSlides as fallbackHeroSlides,
  journals as fallbackJournals,
  packageCtas as fallbackPackageCtas,
  packageOptions as fallbackPackageOptions,
  packagePrograms as fallbackPackagePrograms,
  productDetailContent as fallbackProductDetailContent,
  productReviews as fallbackProductReviews,
  type AdminMember,
  type EventItem,
  type Experience,
  type AdminQuoteRequest,
  type AdminReservation,
  type Category,
  type CollectionItem,
  type DiscountTier,
  type ExperienceReview,
  type HeroSlide,
  type Journal,
  type PackageCta,
  type PackageOption,
  type PackageProgram,
  type ScheduleStock,
} from "@/lib/data";
import { getPool, hasDatabaseConfig } from "@/lib/db";
import { curationPath, normalizeUserHref, userRoutes } from "@/lib/routes";

type ProductRow = RowDataPacket & {
  id: number;
  slug: string;
  title: string;
  summary: string | null;
  description: string | null;
  region: string;
  category: string;
  price: number;
  original_price: number | null;
  duration: string | null;
  badge: string | null;
  image_url: string | null;
  host_name: string | null;
  host_description: string | null;
  place_name: string | null;
  place_address: string | null;
};

type BannerRow = RowDataPacket & {
  placement: "home_main" | "home_event" | "package_cta";
  eyebrow: string | null;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  link_url: string | null;
  theme: PackageCta["theme"] | null;
  host_label: string | null;
  host_images: unknown;
};

type CategoryRow = RowDataPacket & {
  label: string;
  href: string;
  icon_asset: string | null;
  tone: Category["tone"] | null;
};

type CollectionRow = RowDataPacket & {
  slug: string;
  title: string;
  subtitle: string | null;
  eyebrow: string | null;
  image_url: string | null;
  link_url: string | null;
};

type ProductTagRow = RowDataPacket & {
  product_id: number;
  tag: string;
};

type ScheduleRow = RowDataPacket & {
  product_id: number;
  schedule_date: Date | string;
  schedule_label: string;
  capacity: number;
  booked: number;
  price: number;
  max_teams: number | null;
  reserved_teams: number | null;
  team_capacity: number | null;
  reservation_type: ScheduleStock["reservationType"] | null;
  approval_required: number | null;
};

type EventRow = RowDataPacket & {
  slug: string;
  title: string;
  status: EventItem["status"];
  period_label: string;
  venue: string | null;
  partner: string | null;
  summary: string | null;
  image_url: string | null;
};

type JournalRow = RowDataPacket & {
  slug: string;
  title: string;
  category: string | null;
  excerpt: string | null;
  image_url: string | null;
  published_at: Date | string | null;
};

type ProgramRow = RowDataPacket & {
  code: string;
  title: string;
  program_type: "experience" | "lecture" | "tour";
  base_price: number;
  duration: string | null;
};

type PackageOptionRow = RowDataPacket & {
  code: string;
  title: string;
  description: string | null;
  price: number;
  price_type: PackageOption["priceType"];
};

type DiscountTierRow = RowDataPacket & {
  min_people: number;
  discount_rate: string | number;
  label: string;
};

type ProductDetailRow = RowDataPacket & {
  content_type: "recommended" | "excluded" | "schedule";
  label: string | null;
  body: string;
};

type ReviewRow = RowDataPacket & {
  user_name: string | null;
  rating: number;
  body: string;
};

type ReservationRow = RowDataPacket & {
  product_title: string | null;
  product_slug: string | null;
  user_name: string | null;
  schedule_date: Date | string | null;
  schedule_label: string | null;
  people: number;
  total_amount: number | null;
  status: string;
  reservation_type: string | null;
  approval_required: number | null;
};

type QuoteRequestRow = RowDataPacket & {
  organization_name: string | null;
  contact_name: string | null;
  people: number;
  program_ids: unknown;
  budget_label: string | null;
  estimated_total: number | null;
  status: string;
  option_ids: unknown;
};

type MemberRow = RowDataPacket & {
  name: string;
  member_type: "personal" | "company";
  email: string;
  company_approved: number;
  role: string;
};

const fallbackImage = "https://cdn.imweb.me/thumbnail/20230831/5089900ac1a12.jpg";

function formatSqlDate(value: Date | string | null) {
  if (!value) return "";
  if (typeof value === "string") return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
}

async function safeQuery<T>(query: () => Promise<T>, fallback: T) {
  if (!hasDatabaseConfig()) return fallback;

  try {
    return await query();
  } catch (error) {
    console.warn("Database query failed. Falling back to bundled sample data.", error);
    return fallback;
  }
}

function placeholders(count: number) {
  return Array.from({ length: count }, () => "?").join(", ");
}

function programTypeLabel(type: ProgramRow["program_type"]): PackageProgram["type"] {
  if (type === "lecture") return "강의";
  if (type === "tour") return "투어";
  return "체험";
}

function mapProduct(row: ProductRow, tags: string[], schedules: ScheduleStock[]): Experience {
  const normalizedSchedules: ScheduleStock[] = schedules.length
    ? schedules
    : [
        {
          date: "상시 협의",
          label: "일정 문의",
          capacity: 999,
          booked: 0,
          price: row.price,
          maxTeams: 1,
          reservedTeams: 0,
          teamCapacity: 999,
          reservationType: "inquiry",
          approvalRequired: true,
        },
      ];

  return {
    slug: row.slug,
    title: row.title,
    eyebrow: row.badge ?? row.category,
    region: row.region,
    category: row.category,
    price: row.price,
    originalPrice: row.original_price ?? undefined,
    duration: row.duration ?? "상세 확인",
    rating: 4.8,
    reviewCount: 0,
    image: row.image_url ?? fallbackImage,
    badge: row.badge ?? undefined,
    tags,
    summary: row.summary ?? "이더라운드가 큐레이션한 로컬 체험입니다.",
    description: row.description ?? row.summary ?? "제주의 로컬 호스트가 안내하는 체험입니다.",
    highlights: ["로컬 호스트 진행", "예약 인원 기반 운영", "현장 안내"],
    included: ["프로그램 진행", "예약 관리", "현장 안내"],
    notices: ["상세 일정과 준비물은 예약 확정 후 안내됩니다."],
    host: {
      name: row.host_name ?? "이더라운드 호스트",
      description: row.host_description ?? "제주의 로컬 경험을 안내하는 호스트입니다.",
    },
    place: {
      name: row.place_name ?? row.region,
      address: row.place_address ?? "상세 장소는 예약 확정 후 안내됩니다.",
    },
    schedules: normalizedSchedules,
  };
}

async function readProducts(): Promise<Experience[]> {
  const pool = getPool();
  const [productRows] = await pool.query<ProductRow[]>(
    `select id, slug, title, summary, description, region, category, price, original_price, duration,
            badge, image_url, host_name, host_description, place_name, place_address
       from products
      where is_visible = 1
      order by sort_order asc, created_at desc`,
  );

  if (!productRows.length) return [];

  const ids = productRows.map((row) => row.id);
  const [tagRows] = await pool.query<ProductTagRow[]>(
    `select product_id, tag from product_tags where product_id in (${placeholders(ids.length)})`,
    ids,
  );
  const [scheduleRows] = await pool.query<ScheduleRow[]>(
    `select product_id, schedule_date, schedule_label, capacity, booked, price,
            max_teams, reserved_teams, team_capacity, reservation_type, approval_required
       from product_schedules
      where product_id in (${placeholders(ids.length)}) and status = 'open'
      order by schedule_date asc`,
    ids,
  );

  const tagsByProduct = new Map<number, string[]>();
  for (const tag of tagRows) {
    tagsByProduct.set(tag.product_id, [...(tagsByProduct.get(tag.product_id) ?? []), tag.tag]);
  }

  const schedulesByProduct = new Map<number, ScheduleStock[]>();
  for (const schedule of scheduleRows) {
    schedulesByProduct.set(schedule.product_id, [
      ...(schedulesByProduct.get(schedule.product_id) ?? []),
      {
        date: formatSqlDate(schedule.schedule_date),
        label: schedule.schedule_label,
        capacity: schedule.capacity,
        booked: schedule.booked,
        price: schedule.price,
        maxTeams: schedule.max_teams ?? undefined,
        reservedTeams: schedule.reserved_teams ?? undefined,
        teamCapacity: schedule.team_capacity ?? undefined,
        reservationType: schedule.reservation_type ?? undefined,
        approvalRequired: schedule.approval_required === null ? undefined : Boolean(schedule.approval_required),
      },
    ]);
  }

  return productRows.map((row) =>
    mapProduct(row, tagsByProduct.get(row.id) ?? [], schedulesByProduct.get(row.id) ?? []),
  );
}

export async function getExperiences() {
  return safeQuery(readProducts, fallbackExperiences);
}

export async function getExperience(slug: string) {
  return safeQuery(async () => {
    const experiences = await readProducts();
    return experiences.find((experience) => experience.slug === slug);
  }, getFallbackExperience(slug));
}

export async function getEvents() {
  return safeQuery(async () => {
    const pool = getPool();
    const [rows] = await pool.query<EventRow[]>(
      `select slug, title, status, period_label, venue, partner, summary, image_url
         from events
        order by sort_order asc, created_at desc`,
    );

    return rows.map<EventItem>((row) => ({
      slug: row.slug,
      title: row.title,
      status: row.status,
      period: row.period_label,
      venue: row.venue ?? "장소 미정",
      image: row.image_url ?? fallbackImage,
      badge: row.status === "ongoing" ? "진행중" : "포트폴리오",
      summary: row.summary ?? "이더라운드가 함께 준비하는 로컬 행사입니다.",
      partner: row.partner ?? "이더라운드",
    }));
  }, fallbackEvents);
}

export async function getEvent(slug: string) {
  return safeQuery(async () => {
    const events = await getEvents();
    return events.find((event) => event.slug === slug);
  }, getFallbackEvent(slug));
}

export async function getJournals() {
  return safeQuery(async () => {
    const pool = getPool();
    const [rows] = await pool.query<JournalRow[]>(
      `select slug, title, category, excerpt, image_url, published_at
         from journals
        where is_visible = 1
        order by coalesce(published_at, created_at) desc`,
    );

    return rows.map<Journal>((row) => ({
      slug: row.slug,
      title: row.title,
      category: row.category ?? "Journal",
      image: row.image_url ?? fallbackImage,
      excerpt: row.excerpt ?? "이더라운드 저널 콘텐츠입니다.",
      date: formatSqlDate(row.published_at).replaceAll("-", "."),
    }));
  }, fallbackJournals);
}

export async function getJournal(slug: string) {
  return safeQuery(async () => {
    const journals = await getJournals();
    return journals.find((journal) => journal.slug === slug);
  }, getFallbackJournal(slug));
}

export async function getPackagePrograms() {
  return safeQuery(async () => {
    const pool = getPool();
    const [rows] = await pool.query<ProgramRow[]>(
      `select code, title, program_type, base_price, duration
         from package_programs
        where is_visible = 1
        order by id asc`,
    );

    return rows.map<PackageProgram>((row) => ({
      id: row.code,
      title: row.title,
      basePrice: row.base_price,
      duration: row.duration ?? "상세 협의",
      type: programTypeLabel(row.program_type),
    }));
  }, fallbackPackagePrograms);
}

export async function getPackageOptions() {
  return safeQuery(async () => {
    const pool = getPool();
    const [rows] = await pool.query<PackageOptionRow[]>(
      `select code, title, description, price, price_type
         from package_options
        where is_visible = 1
        order by sort_order asc, id asc`,
    );

    return rows.map<PackageOption>((row) => ({
      id: row.code,
      title: row.title,
      description: row.description ?? "",
      price: row.price,
      priceType: row.price_type,
    }));
  }, fallbackPackageOptions);
}

export async function getDiscountTiers() {
  return safeQuery(async () => {
    const pool = getPool();
    const [rows] = await pool.query<DiscountTierRow[]>(
      `select min_people, discount_rate, label
         from discount_tiers
        where is_active = 1
        order by min_people desc`,
    );

    return rows.map<DiscountTier>((row) => ({
      min: row.min_people,
      rate: Number(row.discount_rate),
      label: row.label,
    }));
  }, fallbackDiscountTiers);
}

function parseJsonList(value: unknown) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String);
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export async function getHeroSlides() {
  return safeQuery(async () => {
    const pool = getPool();
    const [rows] = await pool.query<BannerRow[]>(
      `select placement, eyebrow, title, subtitle, image_url, link_url, theme, host_label, host_images
         from banners
        where placement = 'home_main' and is_visible = 1
          and (starts_at is null or starts_at <= now())
          and (ends_at is null or ends_at >= now())
        order by sort_order asc, created_at desc`,
    );

    return rows.map<HeroSlide>((row) => ({
      eyebrow: row.eyebrow ?? "EAT.AROUND",
      title: row.title,
      description: row.subtitle ?? "",
      href: normalizeUserHref(row.link_url ?? userRoutes.experiences),
      image: row.image_url ?? fallbackImage,
    }));
  }, fallbackHeroSlides);
}

export async function getCategories() {
  return safeQuery(async () => {
    const pool = getPool();
    const [rows] = await pool.query<CategoryRow[]>(
      `select label, href, icon_asset, tone
         from categories
        where is_visible = 1
        order by sort_order asc, id asc`,
    );

    return rows.map<Category>((row) => ({
      label: row.label,
      href: normalizeUserHref(row.href),
      iconAsset: row.icon_asset ?? "/assets/images/plat-icon-cook.png",
      tone: row.tone ?? "green",
    }));
  }, fallbackCategories);
}

export async function getCollections() {
  return safeQuery(async () => {
    const pool = getPool();
    const [rows] = await pool.query<CollectionRow[]>(
      `select slug, title, subtitle, eyebrow, image_url, link_url
         from collections
        where is_visible = 1
        order by sort_order asc, created_at desc`,
    );

    return rows.map<CollectionItem>((row) => ({
      slug: row.slug,
      href: curationPath(row.slug),
      image: row.image_url ?? fallbackImage,
      eyebrow: row.eyebrow ?? "기획전",
      title: row.title,
      description: row.subtitle ?? "",
    }));
  }, fallbackCollections);
}

export async function getCollection(slug: string) {
  const collections = await getCollections();
  return collections.find((collection) => collection.slug === slug);
}

export async function getPackageCtas() {
  return safeQuery(async () => {
    const pool = getPool();
    const [rows] = await pool.query<BannerRow[]>(
      `select placement, eyebrow, title, subtitle, image_url, link_url, theme, host_label, host_images
         from banners
        where placement = 'package_cta' and is_visible = 1
          and (starts_at is null or starts_at <= now())
          and (ends_at is null or ends_at >= now())
        order by sort_order asc, created_at desc`,
    );

    return rows.map<PackageCta>((row) => ({
      title: row.title,
      subtitle: row.subtitle ?? "",
      href: normalizeUserHref(row.link_url ?? userRoutes.b2bQuote),
      theme: row.theme ?? "red",
      hostLabel: row.host_label ?? "SELECTED HOST",
      hostImages: parseJsonList(row.host_images),
    }));
  }, fallbackPackageCtas);
}

export async function getAdminReservations() {
  return safeQuery(async () => {
    const pool = getPool();
    const [rows] = await pool.query<ReservationRow[]>(
      `select coalesce(p.title, r.product_slug) as product_title,
              r.product_slug,
              u.name as user_name,
              r.schedule_date,
              r.schedule_label,
              r.people,
              r.total_amount,
              r.status,
              r.reservation_type,
              r.approval_required
         from reservations r
         left join users u on u.id = r.user_id
         left join products p on p.id = r.product_id or p.slug = r.product_slug
        order by r.created_at desc
        limit 20`,
    );

    return rows.map<AdminReservation>((row) => ({
      product: row.product_title ?? row.product_slug ?? "상품 미지정",
      user: row.user_name ?? "비회원",
      date: `${formatSqlDate(row.schedule_date)} ${row.schedule_label ?? ""}`.trim(),
      people: row.people,
      status: row.status,
      amount: row.total_amount ?? undefined,
      reservationType: row.reservation_type === "instant" ? "즉시예약" : row.reservation_type === "inquiry" ? "문의예약" : "승인예약",
      approvalRequired: row.approval_required === null ? undefined : Boolean(row.approval_required),
    }));
  }, fallbackAdminReservations);
}

export async function getAdminQuoteRequests() {
  return safeQuery(async () => {
    const pool = getPool();
    const [rows] = await pool.query<QuoteRequestRow[]>(
      `select organization_name, contact_name, people, program_ids, budget_label, estimated_total, status, option_ids
         from quote_requests
        order by created_at desc
        limit 20`,
    );

    return rows.map<AdminQuoteRequest>((row) => ({
      org: row.organization_name ?? "기관명 미입력",
      contact: row.contact_name ?? undefined,
      people: row.people,
      program: parseJsonList(row.program_ids).join(", ") || "프로그램 미선택",
      budget: row.budget_label ?? "예산 미입력",
      status: row.status,
      estimatedTotal: row.estimated_total ?? undefined,
      options: parseJsonList(row.option_ids).join(", ") || undefined,
    }));
  }, fallbackAdminQuoteRequests);
}

export async function getProductDetailContent(slug: string) {
  return safeQuery(async () => {
    const pool = getPool();
    const [rows] = await pool.query<ProductDetailRow[]>(
      `select pdi.content_type, pdi.label, pdi.body
         from product_detail_items pdi
         join products p on p.id = pdi.product_id
        where p.slug = ?
        order by pdi.sort_order asc, pdi.id asc`,
      [slug],
    );

    return {
      recommendedFor: rows.filter((row) => row.content_type === "recommended").map((row) => row.body),
      excluded: rows.filter((row) => row.content_type === "excluded").map((row) => row.body),
      scheduleSteps: rows
        .filter((row) => row.content_type === "schedule")
        .map((row) => ({ time: row.label ?? "", title: row.body })),
    };
  }, fallbackProductDetailContent[slug] ?? {});
}

export async function getProductReviews(slug: string) {
  return safeQuery(async () => {
    const pool = getPool();
    const [rows] = await pool.query<ReviewRow[]>(
      `select u.name as user_name, pr.rating, pr.body
         from product_reviews pr
         join products p on p.id = pr.product_id
         left join users u on u.id = pr.user_id
        where p.slug = ? and pr.status = 'approved'
        order by pr.created_at desc
        limit 10`,
      [slug],
    );

    return rows.map<ExperienceReview>((row) => ({
      name: row.user_name ?? "이더라운드 회원",
      rating: row.rating,
      text: row.body,
    }));
  }, fallbackProductReviews[slug] ?? []);
}

export async function getAdminMembers() {
  return safeQuery(async () => {
    const pool = getPool();
    const [rows] = await pool.query<MemberRow[]>(
      `select name, member_type, email, company_approved, role
         from users
        order by created_at desc
        limit 30`,
    );

    return rows.map<AdminMember>((row) => ({
      name: row.name,
      type: row.member_type === "company" ? "기업·기관" : row.role === "admin" ? "관리자" : "일반회원",
      email: row.email,
      status: row.member_type === "company" ? (row.company_approved ? "승인완료" : "승인대기") : "정상",
    }));
  }, fallbackAdminMembers);
}
