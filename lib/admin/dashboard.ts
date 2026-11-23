import "server-only";
import type { RowDataPacket } from "@/lib/db";
import { getPool, hasDatabaseConfig } from "@/lib/db";

// 대시보드 숫자는 목록 일부(최근 N건)가 아니라 DB 전체를 집계한다.

export type DashboardDay = { date: string; label: string; count: number; sales: number };
export type DashboardCategory = { label: string; count: number };

export type DashboardStats = {
  totalReservations: number;
  pendingReservations: number;
  /** 취소를 뺀 예약 금액 합계(결제 연동 전이므로 예약 기준 추정). */
  sales: number;
  pendingQuotes: number;
  members: number;
  corporateMembers: number;
  days: DashboardDay[];
  categories: DashboardCategory[];
};

const DAY_COUNT = 10;

function seoulDate(date: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(date);
}

function recentDays(now = new Date()): DashboardDay[] {
  return Array.from({ length: DAY_COUNT }, (_, index) => {
    const date = seoulDate(new Date(now.getTime() - (DAY_COUNT - 1 - index) * 86_400_000));
    const [, month, day] = date.split("-");
    return { date, label: `${Number(month)}/${Number(day)}`, count: 0, sales: 0 };
  });
}

type SampleInput = {
  reservations: { status: string; amount?: number; category?: string }[];
  quoteRequests: { status: string }[];
  members: { type: string }[];
};

/** DB가 없는 샘플 모드: 불러온 예시 목록으로 같은 형태를 만든다. 날짜별 값은 만들지 않는다. */
function sampleStats(sample: SampleInput): DashboardStats {
  const customers = sample.members.filter((member) => member.type !== "관리자");
  return {
    totalReservations: sample.reservations.length,
    pendingReservations: sample.reservations.filter((row) => /대기|요청/.test(row.status)).length,
    sales: sample.reservations.filter((row) => !/취소/.test(row.status)).reduce((sum, row) => sum + (row.amount ?? 0), 0),
    pendingQuotes: sample.quoteRequests.filter((row) => /요청|검토/.test(row.status)).length,
    members: customers.length,
    corporateMembers: customers.filter((member) => /기업|기관/.test(member.type)).length,
    days: recentDays(),
    categories: [],
  };
}

export async function getDashboardStats(sample: SampleInput): Promise<DashboardStats> {
  if (!hasDatabaseConfig()) return sampleStats(sample);

  const pool = getPool();
  const days = recentDays();

  const [[totals], [quotes], [members], [daily], [categories]] = await Promise.all([
    pool.query<(RowDataPacket & { total: number; pending: number; sales: number })[]>(
      `select count(*)::int as total,
              count(*) filter (where status = 'requested')::int as pending,
              coalesce(sum(total_amount) filter (where status <> 'canceled'), 0)::bigint as sales
         from reservations`,
    ),
    pool.query<(RowDataPacket & { pending: number })[]>(
      `select count(*) filter (where status in ('requested', 'reviewing'))::int as pending from quote_requests`,
    ),
    pool.query<(RowDataPacket & { total: number; corporate: number })[]>(
      `select count(*)::int as total, count(*) filter (where member_type = 'company')::int as corporate
         from users where role <> 'admin'`,
    ),
    pool.query<(RowDataPacket & { day: string; count: number; sales: number })[]>(
      `select to_char((created_at at time zone 'Asia/Seoul')::date, 'YYYY-MM-DD') as day,
              count(*)::int as count,
              coalesce(sum(total_amount) filter (where status <> 'canceled'), 0)::bigint as sales
         from reservations
        where (created_at at time zone 'Asia/Seoul')::date >= ?::date
        group by 1`,
      [days[0].date],
    ),
    pool.query<(RowDataPacket & { label: string; count: number })[]>(
      `select coalesce(nullif(p.category, ''), '미분류') as label, count(*)::int as count
         from reservations r
         -- 예전 방식으로 저장돼 product_id가 빈 예약은 상품 주소(slug)로 찾는다(예약 목록과 같은 기준).
         left join products p on p.id = r.product_id or (r.product_id is null and p.slug = r.product_slug)
        where r.status <> 'canceled'
        group by 1
        order by 2 desc, 1 asc`,
    ),
  ]);

  const byDay = new Map(daily.map((row) => [row.day, row]));
  const filledDays = days.map((day) => {
    const row = byDay.get(day.date);
    return row ? { ...day, count: Number(row.count), sales: Number(row.sales) } : day;
  });

  // 상위 3개 카테고리 + 나머지는 기타로 묶는다.
  const top = categories.slice(0, 3).map((row) => ({ label: row.label, count: Number(row.count) }));
  const rest = categories.slice(3).reduce((sum, row) => sum + Number(row.count), 0);
  const categoryRows = rest ? [...top, { label: "기타", count: rest }] : top;

  const total = totals[0];
  return {
    totalReservations: Number(total?.total ?? 0),
    pendingReservations: Number(total?.pending ?? 0),
    sales: Number(total?.sales ?? 0),
    pendingQuotes: Number(quotes[0]?.pending ?? 0),
    members: Number(members[0]?.total ?? 0),
    corporateMembers: Number(members[0]?.corporate ?? 0),
    days: filledDays,
    categories: categoryRows,
  };
}
