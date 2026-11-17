import { NextResponse } from "next/server";
import { adminOk } from "@/lib/admin/api-data";
import { adminError, parseRowId, requireAdmin, trimmed } from "@/lib/admin/guard";
import type { RowDataPacket } from "@/lib/db";
import { getPool, hasDatabaseConfig } from "@/lib/db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type RequestedStatus = "confirmed" | "cancelled" | "canceled" | "rejected" | "requested" | "paid";

type Payload = {
  status?: RequestedStatus;
  action?: "notify";
  rejectReason?: string;
  reason?: string;
  memo?: string;
};

type ReservationRow = RowDataPacket & {
  id: number;
  schedule_id: number | null;
  people: number;
  status: "requested" | "confirmed" | "paid" | "canceled";
};

const STATUS_MESSAGE: Record<RequestedStatus, string> = {
  confirmed: "예약을 확정 처리했습니다.",
  cancelled: "예약을 취소 처리했습니다.",
  canceled: "예약을 취소 처리했습니다.",
  rejected: "예약을 거절 처리했습니다.",
  requested: "예약을 다시 검토 상태로 되돌렸습니다.",
  paid: "결제 확인을 반영했습니다.",
};

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const payload = (await request.json().catch(() => ({}))) as Payload;
  const status = payload.status;

  if (status !== undefined && !(status in STATUS_MESSAGE)) {
    return adminError("지원하지 않는 예약 상태입니다.", 400);
  }

  if (status === "rejected" && !payload.rejectReason?.trim()) {
    return adminError("예약 거절 사유를 입력해 주세요.", 400);
  }

  if (!hasDatabaseConfig()) {
    const message = status ? STATUS_MESSAGE[status] : "예약 정보를 업데이트했습니다.";
    return NextResponse.json(adminOk(message, { id: decodeURIComponent(id), payload }));
  }

  const denied = await requireAdmin(request);
  if (denied) return denied;

  const reservationId = parseRowId(id);
  if (!reservationId) return adminError("예약 번호가 올바르지 않습니다.", 400);

  if (!status) {
    if (payload.action === "notify") return adminError("안내 발송 기능은 아직 연결되지 않았습니다.", 501);
    return adminError("변경할 예약 상태를 지정해 주세요.", 400);
  }

  const cancelling = status === "cancelled" || status === "canceled" || status === "rejected";
  const nextStatus = cancelling ? "canceled" : status;
  const reason = status === "rejected" ? trimmed(payload.rejectReason, 480) : trimmed(payload.reason ?? payload.memo, 480);
  const memo = cancelling && reason ? `${status === "rejected" ? "거절 사유" : "취소 사유"}: ${reason}` : null;

  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();

    // 같은 예약을 동시에 처리해도 재고가 두 번 복원되지 않도록 예약 행을 잠근다.
    const [rows] = await connection.query<ReservationRow[]>(
      "select id, schedule_id, people, status from reservations where id = ? for update",
      [reservationId],
    );
    const reservation = rows[0];

    if (!reservation) {
      await connection.rollback();
      return adminError("예약을 찾을 수 없습니다.", 404);
    }

    if (reservation.status === "canceled") {
      await connection.rollback();
      if (cancelling) return NextResponse.json(adminOk("이미 취소된 예약입니다.", { id: reservationId, status: "canceled" }));
      return adminError("취소된 예약은 다시 되돌릴 수 없습니다. 새 예약으로 접수해 주세요.", 409);
    }

    await connection.execute(
      "update reservations set status = ?, memo = coalesce(?, memo) where id = ?",
      [nextStatus, memo, reservationId],
    );

    // 취소·거절이면 예약 접수 때 차감한 회차 재고(좌석, 팀)를 되돌린다.
    if (cancelling && reservation.schedule_id) {
      await connection.execute(
        `update product_schedules
            set booked = greatest(0, booked - ?),
                reserved_teams = greatest(0, reserved_teams - 1)
          where id = ?`,
        [reservation.people, reservation.schedule_id],
      );
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback().catch(() => undefined);
    throw error;
  } finally {
    connection.release();
  }

  return NextResponse.json(adminOk(STATUS_MESSAGE[status], { id: reservationId, status: nextStatus }));
}
