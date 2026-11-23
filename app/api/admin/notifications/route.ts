import { requireAdminWhenConnected } from "@/lib/admin/guard";
import { NextResponse } from "next/server";
import { getPool, hasDatabaseConfig } from "@/lib/db";
import type { AdminNotification } from "@/types/api";

const sampleNotifications: AdminNotification[] = [
  { id: "n1", category: "예약", title: "승인 대기 예약 3건", href: "/admin/reservations", unread: true },
  { id: "n2", category: "견적", title: "미검토 견적 2건", href: "/admin/quotes", unread: true },
  { id: "n3", category: "시스템", title: "상품 이미지 최적화 완료", href: "/admin/products", unread: false },
];

/** DB가 있으면 실제 처리 대기 건수로 알림을 만든다. 읽음 여부는 화면에서만 관리한다. */
async function loadNotifications(): Promise<AdminNotification[]> {
  if (!hasDatabaseConfig()) return sampleNotifications;

  const [rows] = await getPool().query<{ reservations: number; quotes: number; members: number; reviews: number }[]>(
    `select (select count(*) from reservations where status = 'requested') as reservations,
            (select count(*) from quote_requests where status = 'requested') as quotes,
            (select count(*) from users where member_type = 'company' and company_approved = 0 and company_rejected_reason is null) as members,
            (select count(*) from product_reviews where status = 'pending') as reviews`,
  );
  const counts = rows[0];
  const items: AdminNotification[] = [];
  if (counts.reservations) items.push({ id: "reservations", category: "예약", title: `처리 대기 예약 ${counts.reservations}건`, href: "/admin/reservations", unread: true });
  if (counts.quotes) items.push({ id: "quotes", category: "견적", title: `새 견적 요청 ${counts.quotes}건`, href: "/admin/quotes", unread: true });
  if (counts.members) items.push({ id: "members", category: "회원", title: `승인 대기 기업회원 ${counts.members}건`, href: "/admin/members/corporate", unread: true });
  if (counts.reviews) items.push({ id: "reviews", category: "리뷰", title: `검수 대기 리뷰 ${counts.reviews}건`, href: "/admin/reviews", unread: true });
  return items;
}

export async function GET(request: Request) {
  const denied = await requireAdminWhenConnected(request);
  if (denied) return denied;
  return NextResponse.json(await loadNotifications());
}

export async function PATCH(request: Request) {
  const denied = await requireAdminWhenConnected(request);
  if (denied) return denied;
  const notifications = await loadNotifications();
  return NextResponse.json({
    ok: true,
    message: "알림을 모두 읽음 처리했습니다.",
    data: notifications.map((notification) => ({ ...notification, unread: false })),
  });
}
