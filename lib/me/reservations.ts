import "server-only";
import type { RowDataPacket } from "@/lib/db";
import { getPool } from "@/lib/db";
import { formatPrefixedId, parsePrefixedId } from "@/lib/ids";
import { experiencePath } from "@/lib/routes";
import type { ApiTone, Reservation } from "@/types/api";

// 마이페이지 예약 내역. 회원 본인의 예약만 읽고, 화면에 쓰는 Reservation 형태로 바꾼다.

export type MyReservationRow = RowDataPacket & {
  id: number;
  product_slug: string | null;
  schedule_id: number | null;
  schedule_date: string | null;
  schedule_label: string | null;
  people: number;
  total_amount: number;
  reservation_type: "instant" | "approval" | "inquiry";
  status: "requested" | "confirmed" | "paid" | "canceled";
  memo: string | null;
  created_at: Date;
  title: string | null;
  slug: string | null;
  region: string | null;
  place_name: string | null;
  host_name: string | null;
  review_id: number | null;
};

const SELECT_MY_RESERVATIONS = `
  select r.id, r.product_slug, r.schedule_id, r.schedule_date, r.schedule_label, r.people, r.total_amount,
         r.reservation_type, r.status, r.memo, r.created_at,
         p.title, p.slug, p.region, p.place_name, p.host_name,
         pr.id as review_id
    from reservations r
    -- 예전 방식으로 저장돼 product_id가 빈 예약은 상품 주소(slug)로 찾는다(관리자 목록과 같은 기준).
    left join products p on p.id = r.product_id or (r.product_id is null and p.slug = r.product_slug)
    left join product_reviews pr on pr.reservation_id = r.id
   where r.user_id = ?`;

export function todayInSeoul() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
}

export function formatReservationId(id: number) {
  return formatPrefixedId("R", id);
}

/** "R-000012" 또는 "12"를 예약 번호로 바꾼다. 형식이 틀리면 null. */
export function parseReservationId(value: string) {
  return parsePrefixedId("R", value);
}

function formatSchedule(date: string | null, label: string | null) {
  if (!date) return "일정 미정";
  return `${date.replaceAll("-", ".")}${label ? ` ${label}` : ""}`;
}

/** 체험 날짜가 지난 확정·결제 예약은 이용 완료로 본다. */
export function isCompleted(row: Pick<MyReservationRow, "status" | "schedule_date">, today = todayInSeoul()) {
  return (row.status === "confirmed" || row.status === "paid") && Boolean(row.schedule_date && row.schedule_date < today);
}

/**
 * 회원이 직접 취소할 수 있는지. 결제 연동 전이므로 결제완료 예약은 환불 확인이 필요해 운영팀을 거친다.
 * 체험일 당일·지난 예약도 직접 취소하지 않는다.
 */
export function canMemberCancel(row: Pick<MyReservationRow, "status" | "schedule_date">, today = todayInSeoul()) {
  if (row.status !== "requested" && row.status !== "confirmed") return false;
  return !row.schedule_date || row.schedule_date > today;
}

function describeStatus(row: MyReservationRow, today: string): { label: string; tone: ApiTone; next: string; step: number } {
  if (row.status === "canceled") return { label: "예약 취소", tone: "cancelled", next: "취소된 예약입니다.", step: 0 };
  if (isCompleted(row, today)) {
    return {
      label: "이용 완료",
      tone: "done",
      next: row.review_id ? "후기를 남겨 주셔서 감사합니다." : "체험은 어떠셨나요? 내 리뷰에서 후기를 남길 수 있어요.",
      step: 3,
    };
  }
  if (row.status === "paid") return { label: "결제 완료", tone: "confirmed", next: "체험 당일 예약 정보를 확인해 주세요.", step: 2 };
  if (row.status === "confirmed") {
    return { label: "예약 확정", tone: "confirmed", next: "예약이 확정되었습니다. 결제는 운영팀이 따로 안내합니다.", step: 2 };
  }
  if (row.schedule_date && row.schedule_date < today) {
    return { label: "승인 대기", tone: "pending", next: "체험일이 지났지만 아직 확정되지 않았습니다. 운영팀에 문의해 주세요.", step: 1 };
  }
  if (row.reservation_type === "inquiry") {
    return { label: "문의 접수", tone: "pending", next: "운영팀이 가능 여부를 확인해 연락드립니다.", step: 1 };
  }
  return { label: "승인 대기", tone: "pending", next: "운영팀이 예약 가능 여부를 확인하고 있습니다.", step: 1 };
}

const TYPE_LABEL: Record<MyReservationRow["reservation_type"], string> = {
  instant: "즉시예약",
  approval: "승인 후 확정",
  inquiry: "문의 예약",
};

const PAYMENT_LABEL: Record<MyReservationRow["status"], string> = {
  requested: "결제 전",
  confirmed: "결제 안내 예정",
  paid: "결제 완료",
  canceled: "-",
};

export function rowToReservation(row: MyReservationRow, today = todayInSeoul()): Reservation {
  const status = describeStatus(row, today);
  const slug = row.slug ?? row.product_slug;
  return {
    id: formatReservationId(row.id),
    title: row.title ?? "삭제된 상품",
    status: status.label,
    statusTone: status.tone,
    schedule: formatSchedule(row.schedule_date, row.schedule_label),
    scheduleDate: row.schedule_date ?? undefined,
    people: `${row.people}명`,
    reservationType: TYPE_LABEL[row.reservation_type] ?? "승인 후 확정",
    amount: `${row.total_amount.toLocaleString("ko-KR")}원`,
    location: [row.region, row.place_name].filter(Boolean).join(" ") || "-",
    payment: PAYMENT_LABEL[row.status],
    host: row.host_name ?? "이더라운드",
    href: slug ? experiencePath(slug) : "/experiences",
    nextAction: status.next,
    timeline: ["예약 요청", "운영팀 확인", "예약 확정", "체험 완료"],
    timelineStep: status.step,
    canCancel: canMemberCancel(row, today),
    memo: row.memo ?? undefined,
  };
}

export async function listMyReservations(userId: number) {
  const [rows] = await getPool().query<MyReservationRow[]>(
    `${SELECT_MY_RESERVATIONS}
     order by r.created_at desc, r.id desc
     limit 200`,
    [userId],
  );
  return rows;
}

export async function findMyReservation(userId: number, reservationId: number) {
  const [rows] = await getPool().query<MyReservationRow[]>(`${SELECT_MY_RESERVATIONS} and r.id = ? limit 1`, [
    userId,
    reservationId,
  ]);
  return rows[0] ?? null;
}

type CancelResult = { ok: true } | { ok: false; status: number; message: string };

/** 회원 본인의 예약을 취소하고, 접수 때 차감한 회차 재고(좌석·팀)를 되돌린다. */
export async function cancelMyReservation(userId: number, reservationId: number): Promise<CancelResult> {
  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();
    // 관리자 처리와 동시에 일어나도 재고가 두 번 복원되지 않도록 예약 행을 잠근다.
    const [rows] = await connection.query<(RowDataPacket & Pick<MyReservationRow, "id" | "schedule_id" | "people" | "status" | "schedule_date">)[]>(
      "select id, schedule_id, people, status, schedule_date from reservations where id = ? and user_id = ? for update",
      [reservationId, userId],
    );
    const reservation = rows[0];
    if (!reservation) {
      await connection.rollback();
      return { ok: false, status: 404, message: "예약 내역을 찾을 수 없습니다." };
    }
    if (reservation.status === "canceled") {
      await connection.rollback();
      return { ok: false, status: 409, message: "이미 취소된 예약입니다." };
    }
    if (!canMemberCancel(reservation)) {
      await connection.rollback();
      const message =
        reservation.status === "paid"
          ? "결제가 끝난 예약은 환불 확인이 필요해 직접 취소할 수 없습니다. 문의로 취소를 요청해 주세요."
          : "체험일 당일과 지난 예약은 직접 취소할 수 없습니다. 문의로 요청해 주세요.";
      return { ok: false, status: 409, message };
    }

    await connection.execute(
      "update reservations set status = 'canceled', memo = left(concat_ws(' / ', memo, '회원 직접 취소'), 500) where id = ?",
      [reservationId],
    );
    if (reservation.schedule_id) {
      await connection.execute(
        `update product_schedules
            set booked = greatest(0, booked - ?),
                reserved_teams = greatest(0, reserved_teams - 1)
          where id = ?`,
        [reservation.people, reservation.schedule_id],
      );
    }
    await connection.commit();
    return { ok: true };
  } catch (error) {
    await connection.rollback().catch(() => undefined);
    throw error;
  } finally {
    connection.release();
  }
}
