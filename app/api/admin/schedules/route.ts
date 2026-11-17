import { revalidateSite } from "@/lib/admin/revalidate";
import { NextResponse } from "next/server";
import { adminApiData, adminOk, paginated } from "@/lib/admin/api-data";
import { adminError, requireAdmin, trimmed } from "@/lib/admin/guard";
import { isDateString } from "@/lib/admin/patch";
import { getPool, hasDatabaseConfig } from "@/lib/db";
import type { AdminSchedule } from "@/types/api";

function schedules(): AdminSchedule[] {
  return adminApiData.products.flatMap((product) =>
    (product.schedules ?? []).map((schedule, index) => ({
      id: `${product.slug}-${schedule.date}-${index + 1}`,
      productSlug: product.slug,
      date: schedule.date,
      label: schedule.label,
      capacity: schedule.capacity,
      booked: schedule.booked,
      maxTeams: schedule.maxTeams,
      reservedTeams: schedule.reservedTeams,
      status: schedule.capacity <= schedule.booked ? "soldout" : "open",
    })),
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productSlug = searchParams.get("productSlug");
  const date = searchParams.get("date");
  const filtered = schedules().filter((schedule) => {
    if (productSlug && schedule.productSlug !== productSlug) return false;
    if (date && schedule.date !== date) return false;
    return true;
  });

  return NextResponse.json(paginated(request, filtered));
}

type SchedulePayload = {
  productId?: number;
  date?: string;
  /** 반복 생성일 때 종료일. 있으면 date부터 endDate까지 weekdays에 해당하는 날마다 만든다. */
  endDate?: string;
  /** 0(일)~6(토) */
  weekdays?: number[];
  label?: string;
  maxTeams?: number;
  teamCapacity?: number;
  reservationType?: "instant" | "approval" | "inquiry";
  price?: number;
};

const MAX_ROWS = 200;

function isCount(value: unknown, min: number): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= min && value <= 100_000;
}

function datesBetween(start: string, end: string, weekdays: number[]) {
  const dates: string[] = [];
  const cursor = new Date(`${start}T00:00:00Z`);
  const last = new Date(`${end}T00:00:00Z`);
  while (cursor <= last && dates.length <= MAX_ROWS) {
    if (weekdays.includes(cursor.getUTCDay())) dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as SchedulePayload & Partial<AdminSchedule>;

  if (!hasDatabaseConfig()) {
    if (!payload.productSlug && !payload.productId) {
      return NextResponse.json({ ok: false, message: "상품, 날짜, 회차 시간을 입력해 주세요." }, { status: 400 });
    }
    return NextResponse.json(adminOk("회차가 추가되었습니다.", payload), { status: 201 });
  }

  const denied = await requireAdmin(request);
  if (denied) return denied;

  const label = trimmed(payload.label, 80);
  if (!isCount(payload.productId, 1)) return adminError("상품을 선택해 주세요.", 400);
  if (!isDateString(payload.date)) return adminError("날짜를 선택해 주세요.", 400);
  if (!label) return adminError("회차 시간을 입력해 주세요.", 400);
  if (!isCount(payload.maxTeams, 1)) return adminError("최대 팀은 1 이상의 정수로 입력해 주세요.", 400);
  if (!isCount(payload.teamCapacity, 1)) return adminError("팀당 인원은 1 이상의 정수로 입력해 주세요.", 400);
  if (payload.price !== undefined && !isCount(payload.price, 0)) return adminError("회차 가격은 0 이상의 정수로 입력해 주세요.", 400);

  const reservationType = payload.reservationType ?? "approval";
  if (!["instant", "approval", "inquiry"].includes(reservationType)) return adminError("지원하지 않는 승인 방식입니다.", 400);

  let dates = [payload.date];
  if (payload.endDate !== undefined) {
    if (!isDateString(payload.endDate) || payload.endDate < payload.date) return adminError("종료일은 시작일과 같거나 그 이후여야 합니다.", 400);
    const weekdays = Array.isArray(payload.weekdays) ? payload.weekdays.filter((day) => Number.isInteger(day) && day >= 0 && day <= 6) : [];
    if (!weekdays.length) return adminError("반복 요일을 하나 이상 선택해 주세요.", 400);
    dates = datesBetween(payload.date, payload.endDate, weekdays);
    if (!dates.length) return adminError("선택한 기간에 해당 요일이 없습니다.", 400);
    if (dates.length > MAX_ROWS) return adminError(`한 번에 ${MAX_ROWS}개 회차까지만 만들 수 있습니다. 기간을 줄여 주세요.`, 400);
  }

  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();

    const [products] = await connection.query<{ id: number; price: number }[]>("select id, price from products where id = ?", [
      payload.productId,
    ]);
    const product = products[0];
    if (!product) {
      await connection.rollback();
      return adminError("상품을 찾을 수 없습니다.", 404);
    }

    // 같은 상품·날짜·시간 회차가 이미 있으면 건너뛴다(unique 제약).
    let created = 0;
    for (const date of dates) {
      const [rows] = await connection.execute<{ id: number }[]>(
        `insert into product_schedules
           (product_id, schedule_date, schedule_label, capacity, max_teams, team_capacity, reservation_type, approval_required, price)
         values (?, ?, ?, ?, ?, ?, ?, ?, ?)
         on conflict (product_id, schedule_date, schedule_label) do nothing
         returning id`,
        [
          product.id,
          date,
          label,
          payload.maxTeams * payload.teamCapacity,
          payload.maxTeams,
          payload.teamCapacity,
          reservationType,
          reservationType === "instant" ? 0 : 1,
          payload.price ?? product.price,
        ],
      );
      created += rows.length;
    }

    await connection.commit();
    if (created) revalidateSite();

    const skipped = dates.length - created;
    if (!created) return adminError("같은 날짜·시간의 회차가 이미 있습니다.", 409);
    return NextResponse.json(
      adminOk(`회차 ${created}개를 등록했습니다.${skipped ? ` 이미 있던 ${skipped}개는 건너뛰었습니다.` : ""}`, { created, skipped }),
      { status: 201 },
    );
  } catch (error) {
    await connection.rollback().catch(() => undefined);
    throw error;
  } finally {
    connection.release();
  }
}
