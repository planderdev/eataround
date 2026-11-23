import {
  AdminDataTable,
  AdminStatusBadge,
  type AdminTableColumn,
} from "@/components/admin/AdminPrimitives";
import { DetailPairs, ListFrame, toneFromStatus } from "@/components/admin/AdminLayoutPrimitives";
import { InquiryAnswerEditor } from "@/components/admin/InquiryAnswerEditor";
import type { AdminInquiry } from "@/lib/admin/inquiries";

export function InquiriesPage({ inquiries }: { inquiries: AdminInquiry[] }) {
  const columns: AdminTableColumn<AdminInquiry>[] = [
    { key: "code", label: "번호", render: (row) => row.code },
    { key: "title", label: "제목", render: (row) => <strong>{row.title}</strong> },
    { key: "type", label: "구분", render: (row) => row.typeLabel },
    { key: "member", label: "작성자", render: (row) => row.memberName },
    { key: "createdAt", label: "접수", render: (row) => row.createdAt },
    { key: "status", label: "상태", render: (row) => <AdminStatusBadge tone={toneFromStatus(row.status)}>{row.status}</AdminStatusBadge> },
  ];

  return (
    <ListFrame
      bulk={[
        { label: "상담 종료로 변경", endpoint: "/api/admin/inquiries", payload: { status: "closed" } },
        { label: "답변 대기로 변경", endpoint: "/api/admin/inquiries", payload: { status: "open" } },
        { label: "답변 메일 발송", unlinked: "메일·알림 발송 수단이 없습니다. 답변은 고객 마이페이지 문의 내역에 보입니다." },
      ]}
      filters={[
        { label: "검색어", name: "query", placeholder: "제목, 작성자" },
        { label: "상태", name: "status", type: "select", options: ["답변 대기", "답변 완료", "상담 종료"] },
      ]}
      resultLabel="문의 접수 → 답변 → 상담 종료"
      summary={
        <div className="admin-pipeline-board">
          {(["open", "answered", "closed"] as const).map((code) => (
            <article key={code}>
              <span>{code === "open" ? "답변 대기" : code === "answered" ? "답변 완료" : "상담 종료"}</span>
              <strong>{inquiries.filter((row) => row.statusCode === code).length}</strong>
              <small>{code === "open" ? "먼저 처리할 문의" : code === "answered" ? "고객 확인 대기" : "처리 끝"}</small>
            </article>
          ))}
        </div>
      }
      total={inquiries.length}
    >
      <AdminDataTable
        columns={columns}
        detail={(row) => (
          <div className="admin-quote-detail-panel">
            <DetailPairs
              items={[
                ["작성자", row.memberName],
                ["이메일", row.memberEmail],
                ["접수", row.createdAt],
                ["답변", row.answeredAt || "-"],
              ]}
            />
            <p className="admin-inquiry-body">{row.body}</p>
            <div className="admin-quote-adjustment-panel">
              <InquiryAnswerEditor
                answer={row.answer}
                inquiryId={row.id ? String(row.id) : `sample-${row.code}`}
                key={`${row.id}-${row.statusCode}-${row.answer}`}
                statusCode={row.statusCode}
              />
            </div>
          </div>
        )}
        rowId={(row) => row.id}
        rowKey={(row) => row.code}
        rows={inquiries}
      />
    </ListFrame>
  );
}
