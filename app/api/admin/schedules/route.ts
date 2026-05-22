import { NextResponse } from "next/server";
import { adminApiData, adminOk, paginated } from "@/lib/admin/api-data";
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

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as Partial<AdminSchedule>;

  if (!payload.productSlug || !payload.date || !payload.label) {
    return NextResponse.json({ ok: false, message: "상품, 날짜, 회차 시간을 입력해 주세요." }, { status: 400 });
  }

  return NextResponse.json(adminOk("회차가 추가되었습니다.", payload), { status: 201 });
}
