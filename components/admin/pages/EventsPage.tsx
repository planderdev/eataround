import {
  AdminDataTable,
  AdminStatusBadge,
  type AdminTableColumn,
} from "@/components/admin/AdminPrimitives";
import {
  DetailPairs,
  ListFrame,
} from "@/components/admin/AdminLayoutPrimitives";
import { AdminRowEditor } from "@/components/admin/AdminRowEditor";
import type { AdminData } from "@/lib/admin/data";
import { isEventPeriodOver } from "@/lib/event-status";

export function EventsPage({ closed, data }: { closed: boolean; data: AdminData }) {
  const rows = data.adminEvents.filter((event) => (closed ? event.status !== "ongoing" : event.status === "ongoing"));
  const columns: AdminTableColumn<AdminData["adminEvents"][number]>[] = [
    { key: "title", label: "행사명", render: (row) => <strong>{row.title}</strong> },
    { key: "period", label: "기간", render: (row) => row.period },
    { key: "venue", label: "장소", render: (row) => row.venue },
    { key: "partner", label: "파트너", render: (row) => row.partner },
    {
      key: "status",
      label: "상태",
      render: (row) =>
        isEventPeriodOver(row) ? (
          // 기간이 끝났는데 종료 처리하지 않은 행사. 사이트에서는 이미 종료 행사로 보인다.
          <AdminStatusBadge tone="warning">진행중 · 기간 지남</AdminStatusBadge>
        ) : (
          <AdminStatusBadge tone={row.status === "ongoing" ? "success" : "neutral"}>{row.status === "ongoing" ? "진행중" : "종료"}</AdminStatusBadge>
        ),
    },
  ];

  return (
    <ListFrame
      bulk={
        closed
          ? [
              { label: "진행중으로 되돌리기", endpoint: "/api/admin/events", payload: { status: "ongoing" } },
              { label: "결과 숨김", unlinked: "행사 노출 여부를 저장할 항목(컬럼)이 아직 없습니다." },
              { label: "성과 리포트 발행", unlinked: "리포트 생성 기능이 없습니다." },
            ]
          : [
              { label: "종료 처리", endpoint: "/api/admin/events", payload: { status: "ended" } },
              { label: "상단 배너 연결", unlinked: "배너 관리에서 연결 URL을 행사 주소로 지정해 주세요." },
            ]
      }
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
        columns={columns}
        detail={(row) => (
          <>
            <DetailPairs
              items={[
                ["요약", row.summary || "-"],
                ["프론트 노출", row.status === "ongoing" ? "진행중 행사 리스트" : "종료된 행사 포트폴리오"],
                ["상세 URL", `/events/${row.slug}`],
              ]}
            />
            <AdminRowEditor
              endpoint={`/api/admin/events/${row.id ?? `sample-${row.slug}`}`}
              fields={[
                { name: "title", label: "행사명", type: "text", value: row.title, maxLength: 190, wide: true },
                { name: "period", label: "기간", type: "text", value: row.period, maxLength: 120 },
                {
                  name: "status",
                  label: "상태",
                  type: "select",
                  value: row.status,
                  options: [
                    { value: "ongoing", label: "진행중" },
                    { value: "ended", label: "종료" },
                  ],
                },
                { name: "venue", label: "장소", type: "text", value: row.venue, maxLength: 190 },
                { name: "partner", label: "파트너", type: "text", value: row.partner, maxLength: 190 },
                { name: "summary", label: "요약", type: "textarea", value: row.summary, maxLength: 500 },
                { name: "imageUrl", label: "대표 이미지 (파일을 올리거나 주소 입력)", type: "text", value: row.imageUrl, maxLength: 500, upload: "events" },
              ]}
              key={`${row.id}-${row.title}-${row.period}-${row.status}-${row.venue}-${row.partner}-${row.summary}-${row.imageUrl}`}
              saveLabel="행사 저장"
            />
          </>
        )}
        rowId={(row) => row.id}
        rowKey={(row) => row.slug}
        rows={rows}
      />
    </ListFrame>
  );
}
