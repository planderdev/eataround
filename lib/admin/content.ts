import "server-only";
import { collections, events, experiences, heroSlides, packageCtas, productReviews } from "@/lib/data";
import type { RowDataPacket } from "@/lib/db";
import { getPool, hasDatabaseConfig } from "@/lib/db";

// 관리자 목록 전용 조회. 프론트용 조회(lib/content.ts)와 달리 비노출·마감·검수 대기 행도 포함하고
// 수정 API에 넘길 DB 행 id를 함께 돌려준다. 샘플 데이터에는 id가 없다.

const fallbackImage = "https://cdn.imweb.me/thumbnail/20230831/5089900ac1a12.jpg";

export type AdminProductRow = {
  id?: number;
  slug: string;
  title: string;
  category: string;
  region: string;
  price: number;
  originalPrice?: number;
  badge?: string;
  summary: string;
  image: string;
  host: string;
  isVisible: boolean;
  scheduleCount: number;
  booked: number;
  capacity: number;
};

export type AdminScheduleRow = {
  id?: number;
  product: string;
  host: string;
  region: string;
  date: string;
  label: string;
  capacity: number;
  booked: number;
  maxTeams: number;
  reservedTeams: number;
  teamCapacity: number;
  status: "open" | "closed";
};

export type AdminBannerRow = {
  id?: number;
  slot: string;
  title: string;
  subtitle: string;
  href: string;
  image: string;
  isVisible: boolean;
  sortOrder: number;
};

export type AdminCollectionRow = {
  id?: number;
  slug: string;
  title: string;
  description: string;
  href: string;
  image: string;
  isVisible: boolean;
  sortOrder: number;
};

export type AdminEventRow = {
  id?: number;
  slug: string;
  title: string;
  status: "ongoing" | "ended";
  period: string;
  venue: string;
  partner: string;
  summary: string;
  image: string;
};

export type AdminReviewRow = {
  id?: number;
  product: string;
  name: string;
  rating: number;
  text: string;
  status: "pending" | "approved" | "hidden";
};

async function safeQuery<T>(query: () => Promise<T>, fallback: () => T) {
  if (!hasDatabaseConfig()) return fallback();
  try {
    return await query();
  } catch (error) {
    console.warn("Admin query failed. Falling back to bundled sample data.", error);
    return fallback();
  }
}

const BANNER_SLOT: Record<string, string> = {
  home_main: "MAIN_HERO",
  home_event: "MAIN_EVENT",
  package_cta: "MAIN_B2B_CTA",
};

export function getAdminProducts() {
  return safeQuery(
    async () => {
      const [rows] = await getPool().query<
        (RowDataPacket & {
          id: number;
          slug: string;
          title: string;
          category: string;
          region: string;
          price: number;
          original_price: number | null;
          badge: string | null;
          summary: string | null;
          image_url: string | null;
          host_name: string | null;
          is_visible: number;
          schedule_count: number;
          booked: number;
          capacity: number;
        })[]
      >(
        `select p.id, p.slug, p.title, p.category, p.region, p.price, p.original_price, p.badge, p.summary,
                p.image_url, p.host_name, p.is_visible,
                count(ps.id) as schedule_count,
                coalesce(sum(ps.booked), 0) as booked,
                coalesce(sum(ps.capacity), 0) as capacity
           from products p
           left join product_schedules ps on ps.product_id = p.id and ps.status = 'open'
          group by p.id
          order by p.sort_order asc, p.created_at desc`,
      );

      return rows.map<AdminProductRow>((row) => ({
        id: row.id,
        slug: row.slug,
        title: row.title,
        category: row.category,
        region: row.region,
        price: row.price,
        originalPrice: row.original_price ?? undefined,
        badge: row.badge ?? undefined,
        summary: row.summary ?? "",
        image: row.image_url ?? fallbackImage,
        host: row.host_name ?? "이더라운드 호스트",
        isVisible: row.is_visible === 1,
        scheduleCount: Number(row.schedule_count),
        booked: Number(row.booked),
        capacity: Number(row.capacity),
      }));
    },
    () =>
      experiences.map<AdminProductRow>((experience) => ({
        slug: experience.slug,
        title: experience.title,
        category: experience.category,
        region: experience.region,
        price: experience.price,
        originalPrice: experience.originalPrice,
        badge: experience.badge,
        summary: experience.summary,
        image: experience.image,
        host: experience.host.name,
        isVisible: true,
        scheduleCount: experience.schedules.length,
        booked: experience.schedules.reduce((sum, item) => sum + item.booked, 0),
        capacity: experience.schedules.reduce((sum, item) => sum + item.capacity, 0),
      })),
  );
}

export function getAdminSchedules() {
  return safeQuery(
    async () => {
      const [rows] = await getPool().query<
        (RowDataPacket & {
          id: number;
          product_title: string;
          host_name: string | null;
          region: string;
          schedule_date: string;
          schedule_label: string;
          capacity: number;
          booked: number;
          max_teams: number;
          reserved_teams: number;
          team_capacity: number;
          status: "open" | "closed";
        })[]
      >(
        `select ps.id, p.title as product_title, p.host_name, p.region, ps.schedule_date, ps.schedule_label,
                ps.capacity, ps.booked, ps.max_teams, ps.reserved_teams, ps.team_capacity, ps.status
           from product_schedules ps
           join products p on p.id = ps.product_id
          order by ps.schedule_date asc, ps.id asc
          limit 200`,
      );

      return rows.map<AdminScheduleRow>((row) => ({
        id: row.id,
        product: row.product_title,
        host: row.host_name ?? "이더라운드 호스트",
        region: row.region,
        date: String(row.schedule_date).slice(0, 10),
        label: row.schedule_label,
        capacity: row.capacity,
        booked: row.booked,
        maxTeams: row.max_teams,
        reservedTeams: row.reserved_teams,
        teamCapacity: row.team_capacity,
        status: row.status,
      }));
    },
    () =>
      experiences.flatMap((experience) =>
        experience.schedules.map<AdminScheduleRow>((schedule) => ({
          product: experience.title,
          host: experience.host.name,
          region: experience.region,
          date: schedule.date,
          label: schedule.label,
          capacity: schedule.capacity,
          booked: schedule.booked,
          maxTeams: schedule.maxTeams ?? 1,
          reservedTeams: schedule.reservedTeams ?? 0,
          teamCapacity: schedule.teamCapacity ?? schedule.capacity,
          status: "open",
        })),
      ),
  );
}

export function getAdminBanners() {
  return safeQuery(
    async () => {
      const [rows] = await getPool().query<
        (RowDataPacket & {
          id: number;
          placement: string;
          title: string;
          subtitle: string | null;
          image_url: string | null;
          link_url: string | null;
          host_images: unknown;
          is_visible: number;
          sort_order: number;
        })[]
      >(
        `select id, placement, title, subtitle, image_url, link_url, host_images, is_visible, sort_order
           from banners
          order by placement asc, sort_order asc, created_at desc`,
      );

      return rows.map<AdminBannerRow>((row) => ({
        id: row.id,
        slot: BANNER_SLOT[row.placement] ?? row.placement,
        title: row.title,
        subtitle: row.subtitle ?? "",
        href: row.link_url ?? "",
        image: row.image_url ?? (Array.isArray(row.host_images) ? String(row.host_images[0] ?? "") : "") ?? "",
        isVisible: row.is_visible === 1,
        sortOrder: row.sort_order,
      }));
    },
    () => [
      ...heroSlides.map<AdminBannerRow>((banner, index) => ({
        slot: "MAIN_HERO",
        title: banner.title,
        subtitle: banner.description,
        href: banner.href,
        image: banner.image,
        isVisible: true,
        sortOrder: index,
      })),
      ...packageCtas.map<AdminBannerRow>((banner, index) => ({
        slot: "MAIN_B2B_CTA",
        title: banner.title,
        subtitle: banner.subtitle,
        href: banner.href,
        image: banner.hostImages[0],
        isVisible: true,
        sortOrder: index,
      })),
    ],
  );
}

export function getAdminCollections() {
  return safeQuery(
    async () => {
      const [rows] = await getPool().query<
        (RowDataPacket & {
          id: number;
          slug: string;
          title: string;
          subtitle: string | null;
          image_url: string | null;
          link_url: string | null;
          is_visible: number;
          sort_order: number;
        })[]
      >(
        `select id, slug, title, subtitle, image_url, link_url, is_visible, sort_order
           from collections
          order by sort_order asc, created_at desc`,
      );

      return rows.map<AdminCollectionRow>((row) => ({
        id: row.id,
        slug: row.slug,
        title: row.title,
        description: row.subtitle ?? "",
        href: row.link_url ?? "",
        image: row.image_url ?? "",
        isVisible: row.is_visible === 1,
        sortOrder: row.sort_order,
      }));
    },
    () =>
      collections.map<AdminCollectionRow>((collection, index) => ({
        slug: collection.slug,
        title: collection.title,
        description: collection.description,
        href: collection.href,
        image: collection.image,
        isVisible: true,
        sortOrder: index,
      })),
  );
}

export function getAdminEvents() {
  return safeQuery(
    async () => {
      const [rows] = await getPool().query<
        (RowDataPacket & {
          id: number;
          slug: string;
          title: string;
          status: "ongoing" | "ended";
          period_label: string;
          venue: string | null;
          partner: string | null;
          summary: string | null;
          image_url: string | null;
        })[]
      >(
        `select id, slug, title, status, period_label, venue, partner, summary, image_url
           from events
          order by sort_order asc, created_at desc`,
      );

      return rows.map<AdminEventRow>((row) => ({
        id: row.id,
        slug: row.slug,
        title: row.title,
        status: row.status,
        period: row.period_label,
        venue: row.venue ?? "",
        partner: row.partner ?? "",
        summary: row.summary ?? "",
        image: row.image_url ?? fallbackImage,
      }));
    },
    () =>
      events.map<AdminEventRow>((event) => ({
        slug: event.slug,
        title: event.title,
        status: event.status,
        period: event.period,
        venue: event.venue,
        partner: event.partner,
        summary: event.summary,
        image: event.image,
      })),
  );
}

export function getAdminReviews() {
  return safeQuery(
    async () => {
      const [rows] = await getPool().query<
        (RowDataPacket & {
          id: number;
          product_title: string | null;
          user_name: string | null;
          rating: number;
          body: string;
          status: "pending" | "approved" | "hidden";
        })[]
      >(
        `select pr.id, p.title as product_title, u.name as user_name, pr.rating, pr.body, pr.status
           from product_reviews pr
           left join products p on p.id = pr.product_id
           left join users u on u.id = pr.user_id
          order by pr.created_at desc
          limit 100`,
      );

      return rows.map<AdminReviewRow>((row) => ({
        id: row.id,
        product: row.product_title ?? "상품 미지정",
        name: row.user_name ?? "익명",
        rating: row.rating,
        text: row.body,
        status: row.status,
      }));
    },
    () =>
      Object.entries(productReviews).flatMap(([slug, reviews]) =>
        reviews.map<AdminReviewRow>((review) => ({
          product: experiences.find((experience) => experience.slug === slug)?.title ?? slug,
          name: review.name,
          rating: review.rating,
          text: review.text,
          status: "approved",
        })),
      ),
  );
}
