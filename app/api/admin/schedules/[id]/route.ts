import { revalidateSite } from "@/lib/admin/revalidate";
import { NextResponse } from "next/server";
import { adminOk } from "@/lib/admin/api-data";
import { adminError, parseRowId, requireAdmin } from "@/lib/admin/guard";
import { buildUpdate, readPayload, type FieldSpec } from "@/lib/admin/patch";
import type { RowDataPacket } from "@/lib/db";
import { getPool, hasDatabaseConfig } from "@/lib/db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type ScheduleRow = RowDataPacket & {
  id: number;
  capacity: number;
  booked: number;
  max_teams: number;
  reserved_teams: number;
};

const SPECS: Record<string, FieldSpec> = {
  capacity: { column: "capacity", kind: "int", label: "총 좌석", min: 0 },
  maxTeams: { column: "max_teams", kind: "int", label: "최대 팀", min: 0 },
  teamCapacity: { column: "team_capacity", kind: "int", label: "팀당 인원", min: 0 },
  status: { column: "status", kind: "enum", label: "회차 상태", values: ["open", "closed"] },
};

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const payload = await readPayload(request);

  const update = buildUpdate(payload, SPECS);
  if (typeof update === "string") return adminError(update, 400);

  const message =
    payload.status === "closed"
      ? "회차를 마감 처리했습니다."
      : payload.status === "open"
        ? "회차 예약을 다시 열었습니다."
        : "좌석과 팀 단위 재고를 반영했습니다.";

  if (!hasDatabaseConfig()) {
    return NextResponse.json(adminOk(message, { id: decodeURIComponent(id), payload }));
  }

  const denied = await requireAdmin(request);
  if (denied) return denied;

  const scheduleId = parseRowId(id);
  if (!scheduleId) return adminError("회차 번호가 올바르지 않습니다.", 400);
  if (!update.sets.length) return adminError("변경할 항목이 없습니다.", 400);

  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();

    // 예약 접수와 겹쳐도 이미 받은 예약보다 재고가 작아지지 않도록 회차 행을 잠그고 비교한다.
    const [rows] = await connection.query<ScheduleRow[]>(
      "select id, capacity, booked, max_teams, reserved_teams from product_schedules where id = ? for update",
      [scheduleId],
    );
    const schedule = rows[0];

    if (!schedule) {
      await connection.rollback();
      return adminError("회차를 찾을 수 없습니다.", 404);
    }

    if (typeof payload.capacity === "number" && payload.capacity < schedule.booked) {
      await connection.rollback();
      return adminError(`이미 ${schedule.booked}명이 예약되어 총 좌석을 그보다 작게 줄일 수 없습니다.`, 409);
    }

    if (typeof payload.maxTeams === "number" && payload.maxTeams < schedule.reserved_teams) {
      await connection.rollback();
      return adminError(`이미 ${schedule.reserved_teams}팀이 예약되어 최대 팀을 그보다 작게 줄일 수 없습니다.`, 409);
    }

    await connection.execute(`update product_schedules set ${update.sets.join(", ")} where id = ?`, [
      ...update.values,
      scheduleId,
    ]);
    await connection.commit();
  } catch (error) {
    await connection.rollback().catch(() => undefined);
    throw error;
  } finally {
    connection.release();
  }

  revalidateSite();
  return NextResponse.json(adminOk(message, { id: scheduleId }));
}
