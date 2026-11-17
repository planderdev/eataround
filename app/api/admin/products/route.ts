import { NextResponse } from "next/server";
import { adminApiData, paginated } from "@/lib/admin/api-data";
import { getExperiences } from "@/lib/content";
import { getPool, hasDatabaseConfig } from "@/lib/db";
import { isDateString } from "@/lib/admin/patch";
import { getAdminSessionUser } from "@/lib/session";

type ProductPayload = {
  slug?: string;
  title?: string;
  summary?: string;
  description?: string;
  region?: string;
  category?: string;
  price?: number;
  originalPrice?: number;
  duration?: string;
  badge?: string;
  imageUrl?: string;
  reservationType?: string;
  tags?: string[];
  schedules?: {
    date?: string;
    label?: string;
    capacity?: number;
    maxTeams?: number;
    teamCapacity?: number;
    price?: number;
    reservationType?: string;
  }[];
};

const RESERVATION_TYPES = ["instant", "approval", "inquiry"];

function normalize(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function GET(request: Request) {
  const products = await getExperiences();
  return NextResponse.json({
    ...paginated(request, adminApiData.products),
    products,
  });
}

export async function POST(request: Request) {
  const payload = (await request.json()) as ProductPayload;
  const slug = normalize(payload.slug);
  const title = normalize(payload.title);
  const region = normalize(payload.region);
  const category = normalize(payload.category);
  const price = Number(payload.price ?? 0);

  if (!slug || !title || !region || !category || price <= 0) {
    return NextResponse.json(
      { ok: false, message: "slug, title, region, category, price는 필수입니다." },
      { status: 400 },
    );
  }

  if (!hasDatabaseConfig()) {
    return NextResponse.json({
      ok: true,
      message: "상품 생성 요청을 확인했습니다.",
    });
  }

  if (!(await getAdminSessionUser(request))) {
    return NextResponse.json({ ok: false, message: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  const reservationType = RESERVATION_TYPES.includes(payload.reservationType as string) ? (payload.reservationType as string) : "approval";
  const schedules = Array.isArray(payload.schedules) ? payload.schedules.slice(0, 100) : [];
  for (const schedule of schedules) {
    if (!isDateString(schedule?.date) || !normalize(schedule?.label)) {
      return NextResponse.json({ ok: false, message: "회차의 날짜와 시간을 확인해 주세요." }, { status: 400 });
    }
    for (const value of [schedule.capacity, schedule.maxTeams, schedule.teamCapacity, schedule.price]) {
      if (value !== undefined && (!Number.isInteger(value) || value < 0 || value > 2_000_000_000)) {
        return NextResponse.json({ ok: false, message: "회차의 좌석·팀·가격은 0 이상의 정수여야 합니다." }, { status: 400 });
      }
    }
  }
  if (!Number.isInteger(price) || price > 2_000_000_000) {
    return NextResponse.json({ ok: false, message: "가격은 정수로 입력해 주세요." }, { status: 400 });
  }

  // 상품과 회차는 함께 만들어져야 하므로 한 트랜잭션으로 저장한다.
  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute<{ id: number }[]>(
      `insert into products
        (slug, title, summary, description, region, category, price, original_price, duration, badge, image_url)
       values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       returning id`,
      [
        slug,
        title,
        normalize(payload.summary),
        normalize(payload.description),
        region,
        category,
        price,
        payload.originalPrice ?? null,
        normalize(payload.duration),
        normalize(payload.badge),
        normalize(payload.imageUrl),
      ],
    );
    const productId = rows[0].id;

    for (const schedule of schedules) {
      const type = RESERVATION_TYPES.includes(schedule.reservationType as string) ? (schedule.reservationType as string) : reservationType;
      const maxTeams = Math.max(schedule.maxTeams ?? 1, 1);
      const teamCapacity = Math.max(schedule.teamCapacity ?? 1, 1);
      await connection.execute(
        `insert into product_schedules
           (product_id, schedule_date, schedule_label, capacity, max_teams, team_capacity, reservation_type, approval_required, price)
         values (?, ?, ?, ?, ?, ?, ?, ?, ?)
         on conflict (product_id, schedule_date, schedule_label) do nothing`,
        [
          productId,
          schedule.date,
          normalize(schedule.label),
          schedule.capacity || maxTeams * teamCapacity,
          maxTeams,
          teamCapacity,
          type,
          type === "instant" ? 0 : 1,
          schedule.price || price,
        ],
      );
    }

    const tags = Array.isArray(payload.tags)
      ? [...new Set(payload.tags.map((tag) => normalize(tag)?.slice(0, 60)).filter((tag): tag is string => Boolean(tag)))].slice(0, 20)
      : [];
    for (const tag of tags) {
      await connection.execute("insert into product_tags (product_id, tag) values (?, ?) on conflict do nothing", [productId, tag]);
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback().catch(() => undefined);
    if ((error as { code?: string }).code === "ER_DUP_ENTRY") {
      return NextResponse.json({ ok: false, message: "같은 주소(slug)의 상품이 이미 있습니다." }, { status: 409 });
    }
    throw error;
  } finally {
    connection.release();
  }

  return NextResponse.json({ ok: true, message: "상품이 저장되었습니다." }, { status: 201 });
}
