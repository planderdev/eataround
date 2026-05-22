import { NextResponse } from "next/server";
import type { AdminNotification } from "@/types/api";

const notifications: AdminNotification[] = [
  { id: "n1", category: "예약", title: "승인 대기 예약 3건", href: "/admin/reservations", unread: true },
  { id: "n2", category: "견적", title: "미검토 견적 2건", href: "/admin/quotes", unread: true },
  { id: "n3", category: "시스템", title: "상품 이미지 최적화 완료", href: "/admin/products", unread: false },
];

export async function GET() {
  return NextResponse.json(notifications);
}

export async function PATCH() {
  return NextResponse.json({
    ok: true,
    message: "알림을 모두 읽음 처리했습니다.",
    data: notifications.map((notification) => ({ ...notification, unread: false })),
  });
}
