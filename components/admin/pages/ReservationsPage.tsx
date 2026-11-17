import {
  ListFrame,
  StatCard,
  toneFromStatus,
} from "@/components/admin/AdminLayoutPrimitives";
import { ReservationTable } from "@/components/admin/ReservationTable";
import type { AdminData } from "@/lib/admin/data";

export function ReservationsPage({ data }: { data: AdminData }) {
  const pending = data.reservations.filter((reservation) => toneFromStatus(reservation.status) === "warning");
  const paid = data.reservations.filter((reservation) => toneFromStatus(reservation.status) === "success");
  const canceled = data.reservations.filter((reservation) => toneFromStatus(reservation.status) === "danger");

  return (
    <ListFrame
      bulk={[
        { label: "예약 확정", endpoint: "/api/admin/reservations", payload: { status: "confirmed" } },
        { label: "결제 확인", endpoint: "/api/admin/reservations", payload: { status: "paid" } },
        { label: "안내 메일 발송", unlinked: "메일·알림 발송 수단이 없습니다." },
        { label: "환불 요청 검토", unlinked: "결제·환불 연동이 없습니다." },
        { label: "노쇼 처리", unlinked: "노쇼 상태를 저장할 항목이 아직 없습니다." },
      ]}
      filters={[
        { label: "검색어", name: "query", placeholder: "예약번호, 예약자, 연락처" },
        { label: "예약상태", name: "status", type: "select", options: ["PENDING", "CONFIRMED", "COMPLETED", "CANCELED_BY_USER", "NO_SHOW"] },
        { label: "결제상태", name: "payment", type: "select", options: ["UNPAID", "PAID", "REFUND_REQUESTED", "REFUNDED"] },
        { label: "예약유형", name: "reservationType", type: "select", options: ["즉시예약", "승인예약", "문의예약"] },
        { label: "이용일", name: "useDate", type: "date" },
        { label: "회원구분", name: "memberType", type: "select", options: ["일반", "기업"] },
      ]}
      resultLabel="승인 대기 예약을 우선 처리"
      summary={
        <div className="admin-lane-summary">
          <StatCard detail="호스트 확인 필요" label="승인 대기" value={pending.length} />
          <StatCard detail="이용 안내 발송 대상" label="확정/결제" value={paid.length} />
          <StatCard detail="환불 또는 노쇼 검토" label="취소·이슈" value={canceled.length} />
        </div>
      }
      total={data.reservations.length}
    >
      <ReservationTable rows={data.reservations} />
    </ListFrame>
  );
}
