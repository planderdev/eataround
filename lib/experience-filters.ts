import type { Experience } from "@/lib/data";
import type { FilterOption, FilterTab } from "@/components/ExperienceFilterModal";

export type FilterSearchParams = Record<string, string | string[] | undefined>;

export const regionGroups: { label: string; value: string; areas: string[] }[] = [
  { label: "제주시", value: "제주시", areas: ["제주시"] },
  { label: "서귀포시", value: "서귀포시", areas: ["서귀포", "중문"] },
  { label: "동부", value: "동부", areas: ["구좌"] },
  { label: "서부", value: "서부", areas: ["애월", "한림"] },
];

export const experienceCategories: { value: string; label: string }[] = [
  { value: "", label: "전체 카테고리" },
  { value: "cooking", label: "쿠킹·베이킹" },
  { value: "tradition", label: "지역·전통" },
  { value: "wellness", label: "웰니스" },
  { value: "family", label: "아이와함께" },
  { value: "activity", label: "캠핑·액티비티" },
];

export const experienceTagOptions = ["쿠킹", "막걸리", "가족", "시음", "농장", "프라이빗"];

export const activeFilterKeys = [
  "region",
  "category",
  "tag",
  "badge",
  "seat",
  "price",
  "duration",
  "date",
  "dateFrom",
  "dateTo",
  "people",
  "reservation",
  "target",
  "weather",
];

export type ReservationTypeOption = {
  value: "instant" | "approval" | "inquiry" | "group";
  label: string;
};

export const reservationTypeOptions: ReservationTypeOption[] = [
  { value: "instant", label: "즉시예약" },
  { value: "approval", label: "승인예약" },
  { value: "inquiry", label: "문의예약" },
  { value: "group", label: "단체가능" },
];

export type PricePresetOption = {
  value: "under-30000" | "30000-50000" | "50000-100000" | "over-100000";
  label: string;
};

export const pricePresetOptions: PricePresetOption[] = [
  { value: "under-30000", label: "3만원 이하" },
  { value: "30000-50000", label: "3만원-5만원" },
  { value: "50000-100000", label: "5만원-10만원" },
  { value: "over-100000", label: "10만원 이상" },
];

export type DurationPresetOption = {
  value: "under-60" | "around-120" | "half-day" | "overnight";
  label: string;
};

export const durationPresetOptions: DurationPresetOption[] = [
  { value: "under-60", label: "1시간 이하" },
  { value: "around-120", label: "2시간" },
  { value: "half-day", label: "반나절" },
  { value: "overnight", label: "1박 2일" },
];

export function valueOf(params: FilterSearchParams, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export function filterOption(
  params: FilterSearchParams,
  key: string,
  value: string,
  label: string,
  note?: string,
): FilterOption {
  const current = valueOf(params, key);

  return {
    label,
    note,
    filterKey: key,
    value,
    active: value ? current === value : !current,
  };
}

export function parseMinutes(duration: string) {
  const hourMatch = duration.match(/(\d+)\s*시간/);
  const minuteMatch = duration.match(/(\d+)\s*분/);
  const dayMatch = duration.match(/(\d+)\s*박/);
  const hours = hourMatch ? Number(hourMatch[1]) : 0;
  const minutes = minuteMatch ? Number(minuteMatch[1]) : 0;
  const overnightDays = dayMatch ? Number(dayMatch[1]) : 0;
  const total = hours * 60 + minutes + overnightDays * 24 * 60;
  return total || (duration.match(/\d+/) ? Number(duration.match(/\d+/)![0]) : 0);
}

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function getWeekendRange() {
  const today = startOfToday();
  const day = today.getDay();
  const saturdayOffset = day === 6 ? 0 : (6 - day + 7) % 7;
  const saturday = new Date(today);
  saturday.setDate(today.getDate() + saturdayOffset);
  const sunday = new Date(saturday);
  sunday.setDate(saturday.getDate() + 1);
  sunday.setHours(23, 59, 59, 999);
  return { start: saturday, end: sunday };
}

export function hasScheduleType(schedules: { date: string }[], type?: string) {
  if (!type) return true;
  if (type === "today") {
    const today = startOfToday();
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);
    return schedules.some((schedule) => {
      const scheduleDate = new Date(`${schedule.date}T12:00:00`);
      return scheduleDate >= today && scheduleDate <= todayEnd;
    });
  }
  if (type === "this-weekend") {
    const { start, end } = getWeekendRange();
    return schedules.some((schedule) => {
      const scheduleDate = new Date(`${schedule.date}T12:00:00`);
      return scheduleDate >= start && scheduleDate <= end;
    });
  }

  return schedules.some((schedule) => {
    const day = new Date(schedule.date).getDay();
    if (type === "weekend") return day === 0 || day === 6;
    if (type === "weekday") return day >= 1 && day <= 5;
    return true;
  });
}

export function hasScheduleInRange(schedules: { date: string }[], dateFrom?: string, dateTo?: string) {
  if (!dateFrom && !dateTo) return true;
  const start = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null;
  const end = dateTo ? new Date(`${dateTo}T23:59:59`) : null;

  return schedules.some((schedule) => {
    const scheduleDate = new Date(`${schedule.date}T12:00:00`);
    if (Number.isNaN(scheduleDate.getTime())) return false;
    if (start && scheduleDate < start) return false;
    if (end && scheduleDate > end) return false;
    return true;
  });
}

export function hasRemainingSeats(experience: Experience, minimum: number) {
  return experience.schedules.some((schedule) => schedule.capacity - schedule.booked >= minimum);
}

export function matchesRegion(experience: Experience, value?: string) {
  if (!value) return true;
  const group = regionGroups.find((item) => item.value === value);
  if (!group) return experience.region === value;
  return group.areas.includes(experience.region);
}

export function matchesCategoryGroup(experience: Experience, value?: string) {
  if (!value) return true;
  const haystack = [experience.category, ...experience.tags];

  if (value === "cooking") return haystack.some((item) => ["미식", "베이킹", "쿠킹", "감귤", "식사"].includes(item));
  if (value === "tradition") return haystack.some((item) => ["양조", "마을", "막걸리", "해녀", "스토리"].includes(item));
  if (value === "wellness") return haystack.includes("웰니스");
  if (value === "family") return haystack.some((item) => ["가족", "베이킹", "농장"].includes(item));
  if (value === "activity") return haystack.some((item) => ["피크닉", "팜투어", "수확", "농장", "마켓"].includes(item));
  return experience.category === value;
}

export function matchesPeople(experience: Experience, value?: string) {
  if (!value) return true;
  if (value === "solo") return experience.tags.includes("소규모") || hasRemainingSeats(experience, 1);
  if (value === "small")
    return experience.schedules.some(
      (schedule) => (schedule.teamCapacity ?? schedule.capacity) >= 2 && schedule.capacity - schedule.booked >= 2,
    );
  if (value === "medium") return hasRemainingSeats(experience, 5);
  if (value === "group") return hasRemainingSeats(experience, 10) || experience.tags.includes("프라이빗");
  return true;
}

export function matchesReservationType(experience: Experience, value?: string) {
  if (!value) return true;
  if (value === "group")
    return experience.schedules.some(
      (schedule) => (schedule.teamCapacity ?? 0) >= 4 || (schedule.maxTeams ?? 0) >= 2,
    );
  return experience.schedules.some((schedule) => schedule.reservationType === value);
}

export function matchesTarget(experience: Experience, value?: string) {
  if (!value) return true;
  if (value === "family") return experience.tags.includes("가족");
  if (value === "couple") return experience.tags.some((tag) => ["와인", "파인다이닝", "프라이빗", "시음"].includes(tag));
  if (value === "solo") return experience.tags.includes("소규모");
  if (value === "company") return experience.tags.includes("프라이빗") || experience.category === "미식";
  return true;
}

export function matchesWeather(experience: Experience, value?: string) {
  if (!value) return true;
  if (value === "indoor") return experience.tags.includes("실내") || experience.category === "베이킹" || experience.category === "미식";
  if (value === "outdoor") return experience.tags.some((tag) => ["피크닉", "농장", "마을"].includes(tag));
  if (value === "rain") return experience.tags.includes("실내") || experience.notices.some((notice) => notice.includes("우천"));
  return true;
}

export function matchesPricePreset(experience: Experience, value?: string) {
  if (!value) return true;
  if (value === "under-30000") return experience.price < 30000;
  if (value === "30000-50000") return experience.price >= 30000 && experience.price <= 50000;
  if (value === "50000-100000") return experience.price >= 50000 && experience.price <= 100000;
  if (value === "over-100000") return experience.price > 100000;
  return true;
}

export function matchesDurationPreset(experience: Experience, value?: string) {
  if (!value) return true;
  const minutes = parseMinutes(experience.duration);
  if (value === "under-60") return minutes <= 60;
  if (value === "around-120") return minutes > 60 && minutes <= 180;
  if (value === "half-day") return minutes > 180 && minutes <= 360;
  if (value === "overnight") return minutes > 360;
  return true;
}

export function applyExperienceFilters(experience: Experience, params: FilterSearchParams) {
  const region = valueOf(params, "region");
  const category = valueOf(params, "category");
  const tag = valueOf(params, "tag");
  const badge = valueOf(params, "badge");
  const seat = valueOf(params, "seat");
  const price = valueOf(params, "price");
  const duration = valueOf(params, "duration");
  const date = valueOf(params, "date");
  const dateFrom = valueOf(params, "dateFrom");
  const dateTo = valueOf(params, "dateTo");
  const people = valueOf(params, "people");
  const reservation = valueOf(params, "reservation");
  const target = valueOf(params, "target");
  const weather = valueOf(params, "weather");

  if (region && !matchesRegion(experience, region)) return false;
  if (!matchesCategoryGroup(experience, category)) return false;
  if (tag && !experience.tags.includes(tag)) return false;
  if (badge && experience.badge !== badge) return false;
  if (seat === "last" && !experience.schedules.some((schedule) => schedule.capacity - schedule.booked === 1)) return false;
  if (!matchesPricePreset(experience, price)) return false;
  if (!matchesDurationPreset(experience, duration)) return false;
  if (date && !hasScheduleType(experience.schedules, date)) return false;
  if (!hasScheduleInRange(experience.schedules, dateFrom, dateTo)) return false;
  if (!matchesPeople(experience, people)) return false;
  if (!matchesReservationType(experience, reservation)) return false;
  if (!matchesTarget(experience, target)) return false;
  if (!matchesWeather(experience, weather)) return false;
  return true;
}

export function createExperienceFilterTabs(params: FilterSearchParams): FilterTab[] {
  return [
    {
      id: "recommended",
      label: "추천",
      options: [
        filterOption(params, "badge", "특가", "특가", "할인 진행 중"),
        filterOption(params, "badge", "마감임박", "마감임박", "예약 가능 좌석이 적은 체험"),
        filterOption(params, "seat", "last", "1자리 남음", "원데이클래스 빠른 예약"),
        filterOption(params, "tag", "가족", "아이와함께"),
        filterOption(params, "tag", "실내", "비오는날"),
        filterOption(params, "tag", "프라이빗", "프라이빗"),
      ],
    },
    {
      id: "region",
      label: "지역",
      options: [
        filterOption(params, "region", "", "전체 지역"),
        ...regionGroups.map((group) => filterOption(params, "region", group.value, group.label, group.areas.join(" · "))),
      ],
    },
    {
      id: "category",
      label: "카테고리",
      options: experienceCategories.map((item) => filterOption(params, "category", item.value, item.label)),
    },
    {
      id: "tag",
      label: "태그",
      options: [filterOption(params, "tag", "", "전체 태그"), ...experienceTagOptions.map((item) => filterOption(params, "tag", item, item))],
    },
    {
      id: "price",
      label: "가격",
      options: [filterOption(params, "price", "", "전체 가격"), ...pricePresetOptions.map((item) => filterOption(params, "price", item.value, item.label))],
    },
    {
      id: "duration",
      label: "소요",
      options: [filterOption(params, "duration", "", "전체 소요"), ...durationPresetOptions.map((item) => filterOption(params, "duration", item.value, item.label))],
    },
    {
      id: "date",
      label: "일정",
      options: [
        filterOption(params, "date", "", "전체 일정"),
        filterOption(params, "date", "today", "오늘"),
        filterOption(params, "date", "this-weekend", "이번 주말"),
        filterOption(params, "date", "weekday", "평일 가능"),
        filterOption(params, "date", "weekend", "주말 가능"),
      ],
    },
    {
      id: "people",
      label: "인원",
      options: [
        filterOption(params, "people", "", "전체 인원"),
        filterOption(params, "people", "solo", "1인 가능"),
        filterOption(params, "people", "small", "2~4인"),
        filterOption(params, "people", "medium", "5~9인"),
        filterOption(params, "people", "group", "10인 이상"),
      ],
    },
    {
      id: "reservation",
      label: "예약유형",
      options: [
        filterOption(params, "reservation", "", "전체 예약유형"),
        ...reservationTypeOptions.map((item) => filterOption(params, "reservation", item.value, item.label)),
      ],
    },
    {
      id: "target",
      label: "대상",
      options: [
        filterOption(params, "target", "", "전체 대상"),
        filterOption(params, "target", "family", "가족"),
        filterOption(params, "target", "couple", "커플"),
        filterOption(params, "target", "solo", "혼자"),
        filterOption(params, "target", "company", "기업·기관"),
      ],
    },
    {
      id: "weather",
      label: "날씨",
      options: [
        filterOption(params, "weather", "", "전체 날씨"),
        filterOption(params, "weather", "indoor", "실내"),
        filterOption(params, "weather", "outdoor", "야외"),
        filterOption(params, "weather", "rain", "비 오는 날 가능"),
      ],
    },
  ];
}

export function getInitialFilterTabId(params: FilterSearchParams) {
  if (valueOf(params, "badge") || valueOf(params, "seat")) return "recommended";
  if (valueOf(params, "region")) return "region";
  if (valueOf(params, "category")) return "category";
  if (valueOf(params, "tag")) return "tag";
  if (valueOf(params, "price")) return "price";
  if (valueOf(params, "duration")) return "duration";
  if (valueOf(params, "date") || valueOf(params, "dateFrom") || valueOf(params, "dateTo")) return "date";
  if (valueOf(params, "people")) return "people";
  if (valueOf(params, "reservation")) return "reservation";
  if (valueOf(params, "target")) return "target";
  if (valueOf(params, "weather")) return "weather";
  return "recommended";
}

export function countActiveFilters(params: FilterSearchParams) {
  return activeFilterKeys.filter((key) => valueOf(params, key)).length;
}
