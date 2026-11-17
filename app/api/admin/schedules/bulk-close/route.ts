import { NextResponse } from "next/server";
import { adminOk } from "@/lib/admin/api-data";
import { adminError, requireAdmin } from "@/lib/admin/guard";
import { isDateString } from "@/lib/admin/patch";
import { getPool, hasDatabaseConfig } from "@/lib/db";

type Payload = {
  productId?: number;
  startDate?: string;
  endDate?: string;
  /** open이면 같은 기간을 다시 연다. 기본은 closed. */
  status?: "open" | "closed";
};

/** 한 상품의 기간 안 회차를 한 번에 마감하거나 다시 연다. 이미 받은 예약은 건드리지 않는다. */
export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as Payload;
  const status = payload.status ?? "closed";

  if (!hasDatabaseConfig()) {
    return NextResponse.json(adminOk("선택한 기간의 회차를 마감 처리했습니다.", payload));
  }

  const denied = await requireAdmin(request);
  if (denied) return denied;

  if (typeof payload.productId !== "number" || !Number.isInteger(payload.productId) || payload.productId < 1) {
    return adminError("상품을 선택해 주세요.", 400);
  }
  if (!isDateString(payload.startDate) || !isDateString(payload.endDate)) return adminError("시작일과 종료일을 선택해 주세요.", 400);
  if (payload.endDate < payload.startDate) return adminError("종료일은 시작일과 같거나 그 이후여야 합니다.", 400);
  if (status !== "open" && status !== "closed") return adminError("지원하지 않는 회차 상태입니다.", 400);

  const [rows] = await getPool().execute<{ id: number }[]>(
    `update product_schedules
        set status = ?
      where product_id = ? and schedule_date between ? and ? and status <> ?
      returning id`,
    [status, payload.productId, payload.startDate, payload.endDate, status],
  );

  if (!rows.length) {
    return adminError(status === "closed" ? "해당 기간에 마감할 회차가 없습니다." : "해당 기간에 다시 열 회차가 없습니다.", 404);
  }

  return NextResponse.json(
    adminOk(status === "closed" ? `회차 ${rows.length}개를 마감했습니다.` : `회차 ${rows.length}개를 다시 열었습니다.`, { count: rows.length }),
  );
}
