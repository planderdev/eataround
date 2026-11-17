import Link from "next/link";
import {
  AdminDataTable,
  AdminStatusBadge,
  type AdminTableColumn,
} from "@/components/admin/AdminPrimitives";
import {
  DetailPairs,
  ListFrame,
  RowActionButtons,
  toneFromStatus,
} from "@/components/admin/AdminLayoutPrimitives";
import { QuoteStatusEditor } from "@/components/admin/QuoteStatusEditor";
import type { AdminData } from "@/lib/admin/data";
import { formatWon } from "@/lib/format";

export function QuotesPage({ data }: { data: AdminData }) {
  const columns: AdminTableColumn<AdminData["quoteRequests"][number]>[] = [
    { key: "org", label: "기관명", render: (row) => <strong>{row.org}</strong> },
    { key: "contact", label: "담당자", render: (row) => row.contact ?? "-" },
    { key: "period", label: "희망기간", render: () => "2026-06-12 - 2026-06-13" },
    { key: "people", label: "인원", align: "center", render: (row) => `${row.people}명` },
    { key: "program", label: "선택 프로그램", render: (row) => row.program },
    { key: "amount", label: "예상금액", align: "right", render: (row) => (row.estimatedTotal ? formatWon(row.estimatedTotal) : row.budget) },
    { key: "status", label: "상태", render: (row) => <AdminStatusBadge tone={toneFromStatus(row.status)}>{row.status}</AdminStatusBadge> },
  ];

  return (
    <ListFrame
      bulkOptions={["견적 검토", "견적서 발송", "예약 전환", "담당자 배정"]}
      filters={[
        { label: "검색어", name: "query", placeholder: "기관명, 견적번호, 담당자" },
        { label: "상태", name: "status", type: "select", options: ["REQUESTED", "IN_REVIEW", "QUOTED", "WON", "LOST", "CANCELED"] },
        { label: "인원", name: "people", type: "select", options: ["10명 이하", "20명", "30명", "40명 이상"] },
        { label: "예산", name: "budget", type: "select", options: ["500만원 이하", "1,000만원 이하", "2,000만원 이하", "협의"] },
        { label: "요청일", name: "requestedAt", type: "date" },
        { label: "담당자", name: "owner", type: "select", options: ["김선재", "운영팀"] },
      ]}
      resultLabel="요청 접수 → 검토 → 견적 발송 → 예약 전환"
      summary={
        <div className="admin-pipeline-board">
          {["요청 접수", "검토중", "견적 발송", "예약 전환"].map((step, index) => (
            <article key={step}>
              <span>{step}</span>
              <strong>{index === 0 ? data.quoteRequests.length : index}</strong>
              <small>{index === 0 ? "새 요청 확인" : "담당자 처리 필요"}</small>
            </article>
          ))}
        </div>
      }
      total={data.quoteRequests.length}
    >
      <AdminDataTable
        actions={(row) => (
          <>
            <Link className="admin-action-button ghost" href={`/admin/quotes/${encodeURIComponent(row.org)}/preview`}>
              PDF 미리보기
            </Link>
            <RowActionButtons info="견적서 발송" primary="예약 전환" secondary="금액 조정" />
          </>
        )}
        columns={columns}
        detail={(row) => (
          <div className="admin-quote-detail-panel">
            <DetailPairs
              items={[
                ["기관", row.org],
                ["담당자", row.contact ?? "-"],
                ["프로그램", row.program],
                ["옵션", row.options ?? "-"],
                ["예산", row.budget],
              ]}
            />
            <div className="admin-quote-adjustment-panel">
              <label>
                <span>관리자 조정 금액</span>
                <input defaultValue={row.estimatedTotal ? String(row.estimatedTotal) : ""} inputMode="numeric" placeholder="최종 견적 금액" />
              </label>
              <QuoteStatusEditor
                adminMemo={row.adminMemo}
                quoteId={row.id ? String(row.id) : `sample-${row.org}`}
                statusCode={row.statusCode}
              />
              <Link className="admin-action-button info" href={`/admin/quotes/${encodeURIComponent(row.org)}/preview`}>
                견적서 HTML 미리보기
              </Link>
            </div>
          </div>
        )}
        rowKey={(row) => `${row.id ?? ""}-${row.org}-${row.contact ?? ""}`}
        rows={data.quoteRequests}
      />
    </ListFrame>
  );
}
