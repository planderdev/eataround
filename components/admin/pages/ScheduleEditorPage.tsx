import {
  AdminSelect,
} from "@/components/admin/AdminPrimitives";
import {
  AdminEditorActions,
  AdminField,
} from "@/components/admin/AdminLayoutPrimitives";
import { DatePicker } from "@/components/DatePicker";
import type { AdminData } from "@/lib/admin/data";

export function ScheduleEditorPage({ data, mode }: { data: AdminData; mode: "single" | "recurring" | "close" }) {
  const isClose = mode === "close";
  const isRecurring = mode === "recurring";

  return (
    <section className="admin-creation-layout" data-variant="schedule">
      <article className="admin-creation-main">
        <div className="admin-creation-head">
          <span>{isClose ? "Close schedule" : isRecurring ? "Recurring schedule" : "Schedule setup"}</span>
          <h2>{isClose ? "회차를 기간 단위로 마감합니다." : isRecurring ? "반복 회차를 미리 생성합니다." : "날짜별 팀 단위 재고를 등록합니다."}</h2>
          <p>프론트 예약 모달의 달력, 팀 단위 잔여석, 승인 필요 여부와 연결되는 운영 기준입니다.</p>
        </div>
        <div className="admin-editor-field-grid">
          <AdminField label="상품" wide>
            <AdminSelect defaultValue={data.experiences[0]?.slug}>
              {data.experiences.map((experience) => (
                <option key={experience.slug} value={experience.slug}>
                  {experience.title}
                </option>
              ))}
            </AdminSelect>
          </AdminField>
          <AdminField label={isClose ? "마감 시작일" : "행사일"}>
            <DatePicker className="admin-date-picker" defaultValue="2026-05-22" label={isClose ? "마감 시작일" : "행사일"} />
          </AdminField>
          <AdminField label={isRecurring || isClose ? "종료일" : "회차 시간"}>
            {isRecurring || isClose ? (
              <DatePicker className="admin-date-picker" defaultValue="2026-06-30" label="종료일" />
            ) : (
              <input defaultValue="10:30" />
            )}
          </AdminField>
          {isRecurring ? (
            <AdminField label="반복 요일" wide>
              <div className="admin-chip-options">
                {["월", "화", "수", "목", "금", "토", "일"].map((day) => (
                  <label key={day}>
                    <input defaultChecked={["금", "토", "일"].includes(day)} type="checkbox" />
                    {day}
                  </label>
                ))}
              </div>
            </AdminField>
          ) : null}
          {!isClose ? (
            <>
              <AdminField label="최대 팀">
                <input defaultValue="4" inputMode="numeric" />
              </AdminField>
              <AdminField label="팀당 인원">
                <input defaultValue="6" inputMode="numeric" />
              </AdminField>
              <AdminField label="승인 방식" wide>
                <div className="admin-radio-grid">
                  {["즉시예약", "승인 후 확정", "문의예약"].map((item) => (
                    <label key={item}>
                      <input defaultChecked={item === "승인 후 확정"} name="scheduleConfirm" type="radio" />
                      {item}
                    </label>
                  ))}
                </div>
              </AdminField>
            </>
          ) : (
            <AdminField label="마감 사유" wide>
              <textarea defaultValue="호스트 일정 조정으로 신규 예약을 일괄 마감합니다." />
            </AdminField>
          )}
        </div>
        <AdminEditorActions backHref="/admin/reservations/schedules" primaryLabel={isClose ? "일괄 마감 실행" : isRecurring ? "반복 회차 생성" : "회차 저장"} />
      </article>
      <aside className="admin-creation-side">
        <article className="admin-preview-stack">
          <span>재고 미리보기</span>
          <div className="admin-stock-preview-grid">
            {data.experiences[0]?.schedules.slice(0, 4).map((schedule) => (
              <div key={`${schedule.date}-${schedule.label}`}>
                <b>{schedule.date}</b>
                <strong>{schedule.label}</strong>
                <small>
                  {schedule.reservedTeams ?? 0}/{schedule.maxTeams ?? 4}팀 예약
                </small>
              </div>
            ))}
          </div>
        </article>
      </aside>
    </section>
  );
}
