import type { Metadata } from "next";
import { RiArrowDownSLine } from "@remixicon/react";
import { ExperienceCard } from "@/components/ExperienceCard";
import { ExperienceFilterModal, type FilterOption, type FilterTab } from "@/components/ExperienceFilterModal";
import { Pagination } from "@/components/Pagination";
import { SectionHeader } from "@/components/SectionHeader";
import { getExperiences } from "@/lib/content";
import type { Experience } from "@/lib/data";
import { userRoutes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "로컬체험",
};

type SearchParams = Record<string, string | string[] | undefined>;

const regions = ["전체", "제주시", "서귀포", "구좌", "애월", "한림", "중문"];
const categories = [
  { value: "", label: "전체 카테고리" },
  { value: "cooking", label: "쿠킹·베이킹" },
  { value: "tradition", label: "지역·전통" },
  { value: "wellness", label: "웰니스" },
  { value: "family", label: "아이와함께" },
  { value: "activity", label: "캠핑·액티비티" },
];
const tags = ["쿠킹", "막걸리", "가족", "시음", "농장", "프라이빗"];
const activeFilterKeys = ["region", "category", "tag", "badge", "seat", "price", "duration", "date", "people", "reservation", "target", "weather"];
const pageSize = 4;

function valueOf(params: SearchParams, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function filterHref(params: SearchParams, key: string, value: string) {
  const query = new URLSearchParams();

  for (const [paramKey, paramValue] of Object.entries(params)) {
    if (paramKey === "page") continue;
    const normalized = Array.isArray(paramValue) ? paramValue[0] : paramValue;
    if (normalized) query.set(paramKey, normalized);
  }

  if (value) query.set(key, value);
  else query.delete(key);

  const search = query.toString();
  return search ? `${userRoutes.experiences}?${search}` : userRoutes.experiences;
}

function filterOption(params: SearchParams, key: string, value: string, label: string, note?: string): FilterOption {
  const current = valueOf(params, key);

  return {
    label,
    note,
    href: filterHref(params, key, value),
    active: value ? current === value : !current,
  };
}

function parseMinutes(duration: string) {
  const match = duration.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function hasScheduleType(schedules: { date: string }[], type?: string) {
  if (!type) return true;

  return schedules.some((schedule) => {
    const day = new Date(schedule.date).getDay();
    if (type === "weekend") return day === 0 || day === 6;
    if (type === "weekday") return day >= 1 && day <= 5;
    return true;
  });
}

function hasRemainingSeats(experience: Experience, minimum: number) {
  return experience.schedules.some((schedule) => schedule.capacity - schedule.booked >= minimum);
}

function matchesCategoryGroup(experience: Experience, value?: string) {
  if (!value) return true;
  const haystack = [experience.category, ...experience.tags];

  if (value === "cooking") return haystack.some((item) => ["미식", "베이킹", "쿠킹", "감귤", "식사"].includes(item));
  if (value === "tradition") return haystack.some((item) => ["양조", "마을", "막걸리", "해녀", "스토리"].includes(item));
  if (value === "wellness") return haystack.includes("웰니스");
  if (value === "family") return haystack.some((item) => ["가족", "베이킹", "농장"].includes(item));
  if (value === "activity") return haystack.some((item) => ["피크닉", "팜투어", "농장", "마켓"].includes(item));
  return experience.category === value;
}

function matchesPeople(experience: Experience, value?: string) {
  if (!value) return true;
  if (value === "solo") return experience.tags.includes("소규모") || hasRemainingSeats(experience, 1);
  if (value === "small") return experience.schedules.some((schedule) => (schedule.teamCapacity ?? schedule.capacity) >= 2 && schedule.capacity - schedule.booked >= 2);
  if (value === "medium") return hasRemainingSeats(experience, 5);
  if (value === "group") return hasRemainingSeats(experience, 10) || experience.tags.includes("프라이빗");
  return true;
}

function matchesReservationType(experience: Experience, value?: string) {
  if (!value) return true;
  if (value === "group") return experience.schedules.some((schedule) => (schedule.teamCapacity ?? 0) >= 4 || (schedule.maxTeams ?? 0) >= 2);
  return experience.schedules.some((schedule) => schedule.reservationType === value);
}

function matchesTarget(experience: Experience, value?: string) {
  if (!value) return true;
  if (value === "family") return experience.tags.includes("가족");
  if (value === "couple") return experience.tags.some((tag) => ["와인", "파인다이닝", "프라이빗"].includes(tag));
  if (value === "solo") return experience.tags.includes("소규모");
  if (value === "company") return experience.tags.includes("프라이빗") || experience.category === "미식";
  return true;
}

function matchesWeather(experience: Experience, value?: string) {
  if (!value) return true;
  if (value === "indoor") return experience.tags.includes("실내") || experience.category === "베이킹" || experience.category === "미식";
  if (value === "outdoor") return experience.tags.some((tag) => ["피크닉", "농장", "마을"].includes(tag));
  if (value === "rain") return experience.tags.includes("실내") || experience.notices.some((notice) => notice.includes("우천"));
  return true;
}

function parsePage(value?: string) {
  const parsed = Number(value ?? 1);
  return Number.isFinite(parsed) ? Math.max(1, Math.floor(parsed)) : 1;
}

export default async function ExperiencesPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const params = searchParams ? await searchParams : {};
  const experiences = await getExperiences();
  const region = valueOf(params, "region");
  const category = valueOf(params, "category");
  const tag = valueOf(params, "tag");
  const badge = valueOf(params, "badge");
  const seat = valueOf(params, "seat");
  const price = valueOf(params, "price");
  const duration = valueOf(params, "duration");
  const date = valueOf(params, "date");
  const people = valueOf(params, "people");
  const reservation = valueOf(params, "reservation");
  const target = valueOf(params, "target");
  const weather = valueOf(params, "weather");
  const requestedPage = parsePage(valueOf(params, "page"));

  const filtered = experiences.filter((experience) => {
    if (region && experience.region !== region) return false;
    if (!matchesCategoryGroup(experience, category)) return false;
    if (tag && !experience.tags.includes(tag)) return false;
    if (badge && experience.badge !== badge) return false;
    if (seat === "last" && !experience.schedules.some((schedule) => schedule.capacity - schedule.booked === 1)) {
      return false;
    }
    if (price === "under-50000" && experience.price >= 50000) return false;
    if (price === "50000-80000" && (experience.price < 50000 || experience.price > 80000)) return false;
    if (price === "over-80000" && experience.price <= 80000) return false;
    if (duration === "under-120" && parseMinutes(experience.duration) > 120) return false;
    if (duration === "over-150" && parseMinutes(experience.duration) < 150) return false;
    if (date && !hasScheduleType(experience.schedules, date)) return false;
    if (!matchesPeople(experience, people)) return false;
    if (!matchesReservationType(experience, reservation)) return false;
    if (!matchesTarget(experience, target)) return false;
    if (!matchesWeather(experience, weather)) return false;
    return true;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(requestedPage, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const paginated = filtered.slice(pageStart, pageStart + pageSize);
  const activeCount = activeFilterKeys.filter((key) => valueOf(params, key)).length;
  const initialTabId = badge || seat ? "recommended" : region ? "region" : category ? "category" : tag ? "tag" : price ? "price" : duration ? "duration" : date ? "date" : people ? "people" : reservation ? "reservation" : target ? "target" : weather ? "weather" : "recommended";
  const filterTabs: FilterTab[] = [
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
      options: regions.map((item) => filterOption(params, "region", item === "전체" ? "" : item, item === "전체" ? "전체 지역" : item)),
    },
    {
      id: "category",
      label: "카테고리",
      options: categories.map((item) => filterOption(params, "category", item.value, item.label)),
    },
    {
      id: "tag",
      label: "태그",
      options: [filterOption(params, "tag", "", "전체 태그"), ...tags.map((item) => filterOption(params, "tag", item, item))],
    },
    {
      id: "price",
      label: "가격",
      options: [
        filterOption(params, "price", "", "전체 가격"),
        filterOption(params, "price", "under-50000", "5만원 미만"),
        filterOption(params, "price", "50000-80000", "5만원-8만원"),
        filterOption(params, "price", "over-80000", "8만원 초과"),
      ],
    },
    {
      id: "duration",
      label: "소요",
      options: [
        filterOption(params, "duration", "", "전체 소요"),
        filterOption(params, "duration", "under-120", "2시간 이내"),
        filterOption(params, "duration", "over-150", "2시간 30분 이상"),
      ],
    },
    {
      id: "date",
      label: "일정",
      options: [
        filterOption(params, "date", "", "전체 일정"),
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
        filterOption(params, "reservation", "instant", "즉시예약"),
        filterOption(params, "reservation", "approval", "승인예약"),
        filterOption(params, "reservation", "inquiry", "문의예약"),
        filterOption(params, "reservation", "group", "단체가능"),
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

  return (
    <section className="page-section">
      <SectionHeader
        eyebrow="Local Experiences"
        title="로컬체험"
        description="제주의 식문화와 마을, 로컬 호스트를 가까이 만나는 여행을 찾아보세요."
        level="h1"
      />

      <div className="listing-layout">
        <div>
          <div className="list-toolbar">
            <div className="list-toolbar-main">
              <strong>{filtered.length}개 체험</strong>
              <ExperienceFilterModal
                activeCount={activeCount}
                initialTabId={initialTabId}
                resultCount={filtered.length}
                tabs={filterTabs}
              />
            </div>
            <label className="select-control">
              <span className="sr-only">정렬</span>
              <select aria-label="정렬" defaultValue="recommended">
                <option value="recommended">추천순</option>
                <option value="popular">예약 많은순</option>
                <option value="price-low">낮은 가격순</option>
                <option value="review-high">리뷰 높은순</option>
              </select>
              <RiArrowDownSLine size={18} />
            </label>
          </div>

          {filtered.length ? (
            <div className="card-grid">
              {paginated.map((experience) => (
                <ExperienceCard experience={experience} key={experience.slug} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <strong>조건에 맞는 체험이 없습니다.</strong>
              <p>필터를 다시 선택해 주세요.</p>
            </div>
          )}
          <Pagination basePath={userRoutes.experiences} currentPage={currentPage} pageSize={pageSize} searchParams={params} totalItems={filtered.length} />
        </div>
      </div>
    </section>
  );
}
