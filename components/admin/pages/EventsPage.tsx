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
import type { AdminData } from "@/lib/admin/data";

export function EventsPage({ closed, data }: { closed: boolean; data: AdminData }) {
  const rows = data.events.filter((event) => (closed ? event.status !== "ongoing" : event.status === "ongoing"));
  const columns: AdminTableColumn<AdminData["events"][number]>[] = [
    { key: "title", label: "행사명", render: (row) => <strong>{row.title}</strong> },
    { key: "period", label: "기간", render: (row) => row.period },
    { key: "venue", label: "장소", render: (row) => row.venue },
    { key: "partner", label: "파트너", render: (row) => row.partner },
    { key: "status", label: "상태", render: (row) => <AdminStatusBadge tone={toneFromStatus(row.badge)}>{row.badge}</AdminStatusBadge> },
  ];

  return (
    <ListFrame
      bulkOptions={closed ? ["포트폴리오 노출", "결과 숨김", "성과 리포트 발행"] : ["모집 시작", "모집 마감", "상단 배너 연결"]}
      filters={[
        { label: "검색어", name: "query", placeholder: "행사명, 장소, 파트너" },
        { label: "상태", name: "status", type: "select", options: ["DRAFT", "UPCOMING", "ONGOING", "CLOSED"] },
        { label: "행사일", name: "eventDate", type: "date" },
        { label: "배너 연결", name: "banner", type: "select", options: ["연결됨", "미연결"] },
      ]}
      resultLabel={closed ? "종료 행사 포트폴리오 관리" : "진행중 행사 모집과 노출 관리"}
      summary={
        <div className="admin-event-showcase">
          {rows.slice(0, 3).map((event) => (
            <article key={event.slug}>
              <img alt="" src={event.image} loading="lazy" decoding="async" />
              <span>{event.period}</span>
              <strong>{event.title}</strong>
              <small>{event.venue} · {event.partner}</small>
            </article>
          ))}
        </div>
      }
      total={rows.length}
    >
      <AdminDataTable
        actions={() => <RowActionButtons info={closed ? "성과 리포트" : "참가자 안내"} primary={closed ? "결과 수정" : "행사 수정"} secondary="상세 미리보기" />}
        columns={columns}
        detail={(row) => (
          <DetailPairs
            items={[
              ["요약", row.summary],
              ["파트너", row.partner],
              ["장소", row.venue],
              ["프론트 노출", closed ? "종료된 행사 포트폴리오" : "진행중 행사 리스트"],
            ]}
          />
        )}
        rowKey={(row) => row.slug}
        rows={rows}
      />
    </ListFrame>
  );
}
