import { revalidateSite } from "@/lib/admin/revalidate";
import {
  bookingPeople,
  calculateBookingTotal,
  describeBooking,
  normalizeBookingCounts,
  normalizeRecommendedOptions,
} from "@/lib/booking-price";
import { NextResponse } from "next/server";
import type { RowDataPacket } from "@/lib/db";
import { getPool, hasDatabaseConfig } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

type ScheduleReservationRow = RowDataPacket & {
  id: number;
  product_id: number;
  capacity: number;
  booked: number;
  max_teams: number;
  reserved_teams: number;
  reservation_type: "instant" | "approval" | "inquiry";
  approval_required: number;
  price: number;
  status: "open" | "closed";
};

function fail(message: string, status: number) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as {
    productSlug?: string;
    date?: string;
    timeLabel?: string;
    people?: number;
    options?: unknown;
    recommendedOptions?: unknown;
  } | null;

  if (!payload) return fail("예약 정보를 다시 확인해 주세요.", 400);

  // 지난 날짜 회차로는 예약을 받지 않는다(서울 기준 오늘부터).
  const todayInSeoul = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
  if (payload.date && /^\d{4}-\d{2}-\d{2}$/.test(payload.date) && payload.date < todayInSeoul) {
    return fail("지난 날짜의 회차는 예약할 수 없습니다. 다른 일정을 선택해 주세요.", 409);
  }

  const counts = normalizeBookingCounts(payload.options, payload.people);
  const people = counts ? bookingPeople(counts) : 0;
  if (!counts || people < 1) return fail("예약 인원을 다시 확인해 주세요.", 400);
  const recommended = normalizeRecommendedOptions(payload.recommendedOptions);

  // DB가 없는 샘플 모드에서는 저장할 곳이 없으므로 접수 안내만 돌려준다.
  if (!hasDatabaseConfig()) {
    return NextResponse.json({ ok: true, message: "예약 요청이 접수되었습니다." });
  }

  // 누가 예약했는지 남기기 위해 로그인한 회원만 예약할 수 있다.
  const user = await getSessionUser(request);
  if (!user) return fail("로그인 후 예약할 수 있습니다.", 401);

  if (!payload.productSlug || !payload.date || !payload.timeLabel) {
    return fail("예약할 회차를 선택해 주세요.", 400);
  }
  // 형식만 맞고 없는 날짜(2026-13-45 등)는 DB 오류(500)가 되기 전에 막는다.
  const parsedDate = new Date(`${payload.date}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(payload.date) || Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== payload.date) {
    return fail("예약 날짜를 다시 확인해 주세요.", 400);
  }

  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [scheduleRows] = await connection.query<ScheduleReservationRow[]>(
      `select ps.id, ps.product_id, ps.capacity, ps.booked, ps.max_teams, ps.reserved_teams,
              ps.reservation_type, ps.approval_required, ps.price, ps.status
         from product_schedules ps
         join products p on p.id = ps.product_id
        where p.slug = ?
          and p.is_visible = 1
          and ps.schedule_date = ?
          and ps.schedule_label = ?
        order by (ps.status = 'open') desc, ps.id asc
        limit 1
        for update of ps`,
      [payload.productSlug, payload.date, payload.timeLabel],
    );

    const schedule = scheduleRows[0];
    // 회차가 없으면 재고를 확인할 수 없으므로 받지 않는다. 일정이 없는 상품은 문의 양식으로 접수한다.
    // 문의형 회차는 회차 정보와 함께 reservation_type='inquiry' 예약으로 저장한다.
    if (!schedule) {
      await connection.rollback();
      return fail("선택한 회차를 찾을 수 없습니다. 일정을 다시 선택해 주세요.", 409);
    }
    // 관리자가 마감한 회차는 거절한다.
    if (schedule.status === "closed") {
      await connection.rollback();
      return fail("마감된 회차입니다. 다른 일정을 선택해 주세요.", 409);
    }
    if (schedule.capacity - schedule.booked < people) {
      await connection.rollback();
      return fail("선택한 회차의 남은 좌석이 부족합니다.", 409);
    }
    if (schedule.max_teams - schedule.reserved_teams < 1) {
      await connection.rollback();
      return fail("선택한 회차의 팀 재고가 마감되었습니다.", 409);
    }

    // 금액은 DB의 회차 가격으로 서버에서 다시 계산한다.
    const totalAmount = calculateBookingTotal(schedule.price, counts, recommended);

    await connection.execute(
      `insert into reservations
        (user_id, product_id, product_slug, schedule_id, schedule_date, schedule_label, people, total_amount,
         reservation_type, approval_required, status, memo)
       values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'requested', ?)`,
      [
        user.id,
        schedule.product_id,
        payload.productSlug,
        schedule.id,
        payload.date,
        payload.timeLabel,
        people,
        totalAmount,
        schedule.reservation_type,
        schedule.approval_required,
        describeBooking(counts, recommended),
      ],
    );

    await connection.execute(
      `update product_schedules
          set booked = booked + ?,
              reserved_teams = least(max_teams, reserved_teams + 1)
        where id = ?`,
      [people, schedule.id],
    );

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  // 예약이 들어오면 회차의 잔여 좌석이 바뀌므로 정적으로 만들어 둔 상세 화면을 다시 만들게 한다.
  revalidateSite();

  return NextResponse.json({
    ok: true,
    message: "예약 요청이 접수되었습니다.",
  });
}
