import {
  AdminFilterBar,
  AdminStatusBadge,
} from "@/components/admin/AdminPrimitives";
import { DetailPairs } from "@/components/admin/AdminLayoutPrimitives";
import { ScheduleStockEditor } from "@/components/admin/ScheduleStockEditor";
import type { AdminData } from "@/lib/admin/data";

export function SchedulesPage({ data }: { data: AdminData }) {
  const schedules = data.adminSchedules;

  return (
    <section className="admin-schedule-shell">
      <AdminFilterBar
        fields={[
          { label: "상품", name: "product", placeholder: "상품명 자동완성" },
          { label: "호스트", name: "host", placeholder: "호스트명" },
          { label: "월", name: "month", type: "date", defaultValue: "2026-05-23" },
          { label: "상태", name: "status", type: "select", options: ["OPEN", "CLOSED", "HIDDEN"] },
          { label: "재고", name: "stock", type: "select", options: ["여유", "마감임박", "마감"] },
        ]}
        resultLabel="캘린더 기반 회차·팀 재고 관리"
      />
      <div className="admin-schedule-dashboard">
        <div className="admin-calendar-panel">
          <div className="admin-calendar-toolbar">
            <div>
              <span>2026년 5월</span>
              <strong>회차·팀 재고 캘린더</strong>
            </div>
            <div className="admin-chart-toggle" role="tablist" aria-label="캘린더 보기">
              <button aria-selected="true" data-active="true" role="tab" type="button">
                월
              </button>
              <button aria-selected="false" role="tab" type="button">
                주
              </button>
            </div>
          </div>
          <div className="admin-calendar-board">
            {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
              <span key={day}>{day}</span>
            ))}
            {schedules.map((schedule, index) => {
              const day = Number(schedule.date.slice(8, 10)) || index + 1;
              const remaining = schedule.capacity - schedule.booked;
              const isFull = remaining <= 0 || schedule.status === "closed";
              const isLow = !isFull && remaining <= 2;
              return (
                <details className="admin-calendar-cell" data-state={isFull ? "full" : isLow ? "low" : "open"} key={`${schedule.id ?? ""}-${schedule.product}-${schedule.date}-${schedule.label}-${index}`}>
                  <summary>
                    <b>{day}</b>
                    <span className="admin-calendar-dots">
                      <i data-state={isFull ? "full" : "open"} />
                      <i data-state={isLow ? "low" : "open"} />
                    </span>
                    <strong>{schedule.product}</strong>
                    <small>{schedule.label} · {schedule.region}</small>
                    <AdminStatusBadge tone={isFull ? "danger" : isLow ? "warning" : "success"}>
                      {schedule.status === "closed" ? "마감" : `${schedule.reservedTeams}/${schedule.maxTeams}팀`}
                    </AdminStatusBadge>
                  </summary>
                  <div className="admin-calendar-detail-panel">
                    <header>
                      <span>Schedule Detail</span>
                      <strong>{schedule.date} 회차 관리</strong>
                    </header>
                    <DetailPairs
                      items={[
                        ["상품", schedule.product],
                        ["운영일", schedule.date],
                        ["시간", schedule.label],
                        ["호스트", schedule.host],
                        ["팀 재고", `${schedule.reservedTeams ?? 0}/${schedule.maxTeams ?? 0}팀`],
                        ["인원 재고", `${schedule.booked}/${schedule.capacity}명`],
                        ["상태", schedule.status === "closed" ? "마감" : "예약 가능"],
                      ]}
                    />
                    <ScheduleStockEditor
                      capacity={schedule.capacity}
                      key={`${schedule.id}-${schedule.capacity}-${schedule.maxTeams}-${schedule.teamCapacity}-${schedule.status}`}
                      maxTeams={schedule.maxTeams}
                      scheduleId={schedule.id ? String(schedule.id) : `sample-${schedule.product}-${schedule.date}-${schedule.label}`}
                      scheduleLabel={`${schedule.date} ${schedule.label}`}
                      status={schedule.status}
                      teamCapacity={schedule.teamCapacity}
                    />
                  </div>
                </details>
              );
            })}
          </div>
        </div>
        <aside className="admin-stock-inspector">
          <span>선택 회차</span>
          <strong>{schedules[0]?.product ?? "회차 없음"}</strong>
          <DetailPairs
            items={[
              ["운영일", schedules[0]?.date ?? "-"],
              ["시간", schedules[0]?.label ?? "-"],
              ["팀 재고", `${schedules[0]?.reservedTeams ?? 0}/${schedules[0]?.maxTeams ?? 0}팀`],
              ["인원 재고", `${schedules[0]?.booked ?? 0}/${schedules[0]?.capacity ?? 0}명`],
            ]}
          />
          {schedules[0] ? (
            <ScheduleStockEditor
              capacity={schedules[0].capacity}
              key={`${schedules[0].id}-${schedules[0].capacity}-${schedules[0].maxTeams}-${schedules[0].teamCapacity}-${schedules[0].status}`}
              maxTeams={schedules[0].maxTeams}
              scheduleId={schedules[0].id ? String(schedules[0].id) : `sample-${schedules[0].product}-${schedules[0].date}-${schedules[0].label}`}
              scheduleLabel={`${schedules[0].product} ${schedules[0].label}`}
              status={schedules[0].status}
              teamCapacity={schedules[0].teamCapacity}
            />
          ) : null}
        </aside>
      </div>
    </section>
  );
}
