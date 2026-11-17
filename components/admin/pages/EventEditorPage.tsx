import { AdminCreateForm } from "@/components/admin/AdminCreateForm";
import { AdminRowEditor } from "@/components/admin/AdminRowEditor";
import type { AdminData } from "@/lib/admin/data";

export function EventEditorPage({ data, closed }: { data: AdminData; closed: boolean }) {
  const endedEvents = data.adminEvents.filter((event) => event.status === "ended");
  const preview = closed ? endedEvents[0] : data.adminEvents[0];

  return (
    <section className="admin-creation-layout" data-variant="event">
      <article className="admin-creation-main">
        <div className="admin-creation-head">
          <span>{closed ? "Event result" : "Event campaign"}</span>
          <h2>{closed ? "종료된 행사를 포트폴리오로 정리합니다." : "새 행사를 등록합니다."}</h2>
          <p>
            {closed
              ? "종료된 행사의 결과 요약과 대표 이미지를 고쳐 저장합니다. 참여 후기·성과 지표는 저장할 곳이 없어 아직 지원하지 않습니다."
              : "행사명, 기간, 장소, 소개를 저장하면 행사 목록에 바로 나타납니다. 이미지는 파일을 올리거나 주소(URL)를 직접 입력합니다."}
          </p>
        </div>
        {closed ? (
          endedEvents.length ? (
            endedEvents.map((event) => (
              <div key={event.id ?? event.slug}>
                <strong>{event.title}</strong>
                <AdminRowEditor
                  endpoint={`/api/admin/events/${event.id ?? `sample-${event.slug}`}`}
                  fields={[
                    { name: "period", label: "진행 기간", type: "text", value: event.period, maxLength: 120 },
                    { name: "venue", label: "장소", type: "text", value: event.venue, maxLength: 190 },
                    { name: "summary", label: "결과 요약", type: "textarea", value: event.summary, maxLength: 500 },
                    { name: "imageUrl", label: "대표 이미지 (파일을 올리거나 주소 입력)", type: "text", value: event.imageUrl, maxLength: 500, upload: "events" },
                  ]}
                  key={`${event.id}-${event.period}-${event.venue}-${event.summary}-${event.imageUrl}`}
                  saveLabel="결과 저장"
                />
              </div>
            ))
          ) : (
            <p>종료된 행사가 없습니다. 진행중 행사 목록에서 상태를 "종료"로 바꾸면 여기에 나타납니다.</p>
          )
        ) : (
          <AdminCreateForm
            backHref="/admin/events/ongoing"
            endpoint="/api/admin/events"
            fields={[
              { name: "title", label: "행사명", type: "text", maxLength: 190, required: true, wide: true },
              { name: "period", label: "기간", type: "text", maxLength: 120, required: true, placeholder: "예: 2026.06.01 - 2026.06.13" },
              {
                name: "status",
                label: "상태",
                type: "select",
                defaultValue: "ongoing",
                options: [
                  { value: "ongoing", label: "진행중" },
                  { value: "ended", label: "종료" },
                ],
              },
              { name: "venue", label: "장소", type: "text", maxLength: 190 },
              { name: "partner", label: "파트너", type: "text", maxLength: 190 },
              { name: "summary", label: "행사 소개", type: "textarea", maxLength: 500 },
              { name: "imageUrl", label: "대표 이미지 (파일을 올리거나 주소 입력)", type: "text", maxLength: 500, placeholder: "https://...", upload: "events" },
            ]}
            submitLabel="행사 저장"
          />
        )}
      </article>
      <aside className="admin-creation-side">
        <article className="admin-preview-stack">
          <span>{closed ? "포트폴리오 미리보기" : "최근 행사"}</span>
          {preview ? <img alt="" src={preview.image} loading="lazy" decoding="async" /> : null}
          <strong>{preview?.title ?? "등록된 행사가 없습니다."}</strong>
          <small>{closed ? "종료된 행사 리스트와 상세 결과에 노출됩니다." : "진행중 행사 리스트와 홈 섹션에 노출됩니다."}</small>
        </article>
      </aside>
    </section>
  );
}
