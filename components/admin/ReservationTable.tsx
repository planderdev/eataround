import {
  AdminDataTable,
  AdminStatusBadge,
  type AdminTableColumn,
} from "@/components/admin/AdminPrimitives";
import { DetailPairs, toneFromStatus } from "@/components/admin/AdminLayoutPrimitives";
import { ReservationActionInline } from "@/components/admin/ReservationActionInline";
import type { AdminData } from "@/lib/admin/data";
import { formatWon } from "@/lib/format";

export function ReservationTable({ compact, rows }: { compact?: boolean; rows: AdminData["reservations"] }) {
  const columns: AdminTableColumn<AdminData["reservations"][number]>[] = [
    { key: "product", label: "상품명", render: (row) => <strong>{row.product}</strong> },
    { key: "user", label: "예약자", render: (row) => row.user },
    { key: "date", label: "이용일정", render: (row) => row.date },
    { key: "people", label: "인원", align: "center", render: (row) => `${row.people}명` },
    { key: "payment", label: "결제금액", align: "right", render: (row) => (row.amount ? formatWon(row.amount) : "UNPAID") },
    { key: "status", label: "예약상태", render: (row) => <AdminStatusBadge tone={toneFromStatus(row.status)}>{row.status}</AdminStatusBadge> },
  ];

  return (
    <AdminDataTable
      actions={(row) => (
        <ReservationActionInline
          approvalRequired={row.approvalRequired}
          productLabel={row.product}
          reservationId={row.id ? String(row.id) : `sample-${row.product}-${row.user}-${row.date}`}
          statusCode={row.statusCode}
        />
      )}
      columns={compact ? columns.slice(0, 5) : columns}
      detail={(row) => (
        <DetailPairs
          items={[
            ["예약 유형", row.reservationType ?? "승인예약"],
            ["승인 필요", row.approvalRequired ? "필요" : "불필요"],
            ["고객 안내", "예약 확정 후 이용 장소와 준비물을 자동 안내합니다."],
            ["운영 메모", row.memo ?? "회차별 팀 재고와 결제 상태를 함께 확인하세요."],
          ]}
        />
      )}
      rowId={(row) => row.id}
      rowKey={(row) => `${row.id ?? ""}-${row.product}-${row.user}-${row.date}`}
      rows={rows}
    />
  );
}
