import Link from "next/link";
import {
  AdminDataTable,
  AdminStatusBadge,
  type AdminTableColumn,
} from "@/components/admin/AdminPrimitives";
import {
  DetailPairs,
  ListFrame,
  toneFromStatus,
} from "@/components/admin/AdminLayoutPrimitives";
import { QuoteStatusEditor } from "@/components/admin/QuoteStatusEditor";
import type { AdminData } from "@/lib/admin/data";
import { formatWon } from "@/lib/format";

export function QuotesPage({ data }: { data: AdminData }) {
  const columns: AdminTableColumn<AdminData["quoteRequests"][number]>[] = [
    { key: "org", label: "기관명", render: (row) => <strong>{row.org}</strong> },
    { key: "contact", label: "담당자", render: (row) => row.contact ?? "-" },
    { key: "period", label: "희망기간", render: (row) => row.period ?? "-" },
    { key: "people", label: "인원", align: "center", render: (row) => `${row.people}명` },
    { key: "program", label: "선택 프로그램", render: (row) => row.program },
    { key: "amount", label: "예상금액", align: "right", render: (row) => (row.estimatedTotal ? formatWon(row.estimatedTotal) : row.budget) },
    { key: "status", label: "상태", render: (row) => <AdminStatusBadge tone={toneFromStatus(row.status)}>{row.status}</AdminStatusBadge> },
  ];

  return (
    <ListFrame
      bulk={[
        { label: "검토중으로 변경", endpoint: "/api/admin/quotes", payload: { status: "reviewing" } },
        { label: "발송완료로 변경", endpoint: "/api/admin/quotes", payload: { status: "sent" } },
        { label: "수락완료로 변경", endpoint: "/api/admin/quotes", payload: { status: "accepted" } },
        { label: "종료로 변경", endpoint: "/api/admin/quotes", payload: { status: "closed" } },
        { label: "견적서 발송", unlinked: "메일·알림 발송 수단이 없습니다." },
        { label: "예약 전환", unlinked: "견적을 예약으로 만드는 규칙이 아직 정해지지 않았습니다." },
        { label: "담당자 배정", unlinked: "담당자를 저장할 항목(컬럼)이 아직 없습니다." },
      ]}
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
          {[
            { step: "요청 접수", code: "requested", note: "새 요청 확인" },
            { step: "검토중", code: "reviewing", note: "담당자 검토" },
            { step: "견적 발송", code: "sent", note: "고객 회신 대기" },
            { step: "수락 완료", code: "accepted", note: "예약 진행" },
          ].map(({ step, code, note }) => (
            <article key={step}>
              <span>{step}</span>
              <strong>{data.quoteRequests.filter((quote) => quote.statusCode === code).length}</strong>
              <small>{note}</small>
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
            <small>견적서 메일 발송과 예약 전환은 아직 연결되지 않았습니다. 금액·상태·메모는 위에서 저장합니다.</small>
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
              <QuoteStatusEditor
                adminMemo={row.adminMemo}
                estimatedTotal={row.estimatedTotal}
                key={`${row.id}-${row.statusCode}-${row.adminMemo}-${row.estimatedTotal}`}
                quoteId={row.id ? String(row.id) : `sample-${row.org}`}
                statusCode={row.statusCode}
              />
              <Link className="admin-action-button info" href={`/admin/quotes/${encodeURIComponent(row.org)}/preview`}>
                견적서 HTML 미리보기
              </Link>
            </div>
          </div>
        )}
        rowId={(row) => row.id}
        rowKey={(row) => `${row.id ?? ""}-${row.org}-${row.contact ?? ""}`}
        rows={data.quoteRequests}
      />
    </ListFrame>
  );
}
