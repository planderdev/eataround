// 행사 기간 표기("2026.05.01 - 2026.06.30")로 실제 진행 상태를 판정한다.
// 저장된 status가 ongoing이어도 기간이 끝났으면 사이트에서는 종료 행사로 보여 준다.

export type DerivedEventStatus = "upcoming" | "ongoing" | "ended";

const DAY_MS = 86_400_000;

export function periodTimestamp(period: string, segment: 0 | 1) {
  const dateText = period.split("-")[segment]?.trim().replace(/\./g, "-");
  const timestamp = dateText ? Date.parse(dateText) : Number.NaN;
  return Number.isFinite(timestamp) ? timestamp : 0;
}

export function deriveEventStatus(event: { period: string; status: string }, now = new Date()): DerivedEventStatus {
  if (event.status === "ended") return "ended";
  const start = periodTimestamp(event.period, 0);
  const end = periodTimestamp(event.period, 1);

  if (!start || !end) return "ongoing";
  if (now.getTime() < start) return "upcoming";
  if (now.getTime() > end + DAY_MS - 1) return "ended";
  return "ongoing";
}

/** 기간이 끝난 진행중 행사인지(관리자 화면 안내용). */
export function isEventPeriodOver(event: { period: string; status: string }, now = new Date()) {
  return event.status === "ongoing" && deriveEventStatus({ period: event.period, status: "ongoing" }, now) === "ended";
}
