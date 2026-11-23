import { revalidateSite } from "@/lib/admin/revalidate";
import { NextResponse } from "next/server";
import type { RowDataPacket } from "@/lib/db";
import { getPool, hasDatabaseConfig } from "@/lib/db";

type ScheduleReservationRow = RowDataPacket & {
  id: number;
  product_id: number;
  capacity: number;
  booked: number;
  max_teams: number;
  reserved_teams: number;
  reservation_type: "instant" | "approval" | "inquiry";
  approval_required: number;
  status: "open" | "closed";
};

export async function POST(request: Request) {
  const payload = (await request.json()) as {
    productSlug?: string;
    date?: string;
    timeLabel?: string;
    people?: number;
    totalAmount?: number;
    reservationType?: "instant" | "approval" | "inquiry";
    approvalRequired?: boolean;
  };

  // 지난 날짜 회차로는 예약을 받지 않는다(서울 기준 오늘부터). "상시 협의" 같은 문의 일정은 그대로 둔다.
  const todayInSeoul = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
  if (payload.date && /^\d{4}-\d{2}-\d{2}$/.test(payload.date) && payload.date < todayInSeoul) {
    return NextResponse.json({ ok: false, message: "지난 날짜의 회차는 예약할 수 없습니다. 다른 일정을 선택해 주세요." }, { status: 409 });
  }

  if (hasDatabaseConfig()) {
    const pool = getPool();
    const people = Math.max(Number(payload.people ?? 1), 1);
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [scheduleRows] = await connection.query<ScheduleReservationRow[]>(
        `select ps.id, ps.product_id, ps.capacity, ps.booked, ps.max_teams, ps.reserved_teams,
                ps.reservation_type, ps.approval_required, ps.status
           from product_schedules ps
           join products p on p.id = ps.product_id
          where p.slug = ?
            and ps.schedule_date = ?
            and ps.schedule_label = ?
          order by (ps.status = 'open') desc, ps.id asc
          limit 1
          for update of ps`,
        [payload.productSlug ?? null, payload.date ?? null, payload.timeLabel ?? null],
      );

      const schedule = scheduleRows[0];
      // 관리자가 마감한 회차는 일정 없는 문의 예약으로 흘려보내지 않고 거절한다.
      if (schedule && schedule.status === "closed") {
        await connection.rollback();
        return NextResponse.json({ ok: false, message: "마감된 회차입니다. 다른 일정을 선택해 주세요." }, { status: 409 });
      }
      if (schedule && schedule.capacity - schedule.booked < people) {
        await connection.rollback();
        return NextResponse.json({ ok: false, message: "선택한 회차의 남은 좌석이 부족합니다." }, { status: 409 });
      }

      if (schedule && schedule.max_teams - schedule.reserved_teams < 1) {
        await connection.rollback();
        return NextResponse.json({ ok: false, message: "선택한 회차의 팀 재고가 마감되었습니다." }, { status: 409 });
      }

      await connection.execute(
        `insert into reservations
          (product_id, product_slug, schedule_id, schedule_date, schedule_label, people, total_amount, reservation_type, approval_required, status)
         values (?, ?, ?, ?, ?, ?, ?, ?, ?, 'requested')`,
        [
          schedule?.product_id ?? null,
          payload.productSlug ?? null,
          schedule?.id ?? null,
          payload.date ?? null,
          payload.timeLabel ?? null,
          people,
          payload.totalAmount ?? 0,
          schedule?.reservation_type ?? payload.reservationType ?? "approval",
          schedule ? schedule.approval_required : (payload.approvalRequired ?? true) ? 1 : 0,
        ],
      );

      if (schedule) {
        await connection.execute(
          `update product_schedules
              set booked = booked + ?,
                  reserved_teams = least(max_teams, reserved_teams + 1)
            where id = ?`,
          [people, schedule.id],
        );
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();

      if ((error as { code?: string }).code !== "ER_BAD_FIELD_ERROR") throw error;
      await pool.execute(
        `insert into reservations (product_slug, schedule_date, schedule_label, people, total_amount, status)
         values (?, ?, ?, ?, ?, 'requested')`,
        [payload.productSlug ?? null, payload.date ?? null, payload.timeLabel ?? null, people, payload.totalAmount ?? 0],
      );
    } finally {
      connection.release();
    }
  }

  // 예약이 들어오면 회차의 잔여 좌석이 바뀌므로 정적으로 만들어 둔 상세 화면을 다시 만들게 한다.
  if (hasDatabaseConfig()) revalidateSite();

  return NextResponse.json({
    ok: true,
    message: "예약 요청이 접수되었습니다.",
  });
}
