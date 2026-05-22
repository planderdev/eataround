import type { Metadata } from "next";
import Link from "next/link";
import { RiSearchLine } from "@remixicon/react";
import { EventCard } from "@/components/EventCard";
import { ExperienceCard } from "@/components/ExperienceCard";
import { ExperienceFilterModal, type FilterOption, type FilterTab } from "@/components/ExperienceFilterModal";
import { JournalCard } from "@/components/JournalCard";
import { ListToolbar } from "@/components/ListToolbar";
import { Pagination } from "@/components/Pagination";
import { SearchEmptyState } from "@/components/SearchEmptyState";
import { SectionHeader } from "@/components/SectionHeader";
import { getEvents, getExperiences, getJournals } from "@/lib/content";
import type { EventItem, Experience, Journal } from "@/lib/data";
import { userRoutes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "검색",
};

type SearchParams = Record<string, string | string[] | undefined>;
type ResultType = "all" | "experience" | "event" | "journal";

type SearchResult =
  | { type: "experience"; item: Experience; haystack: string[] }
  | { type: "event"; item: EventItem; haystack: string[] }
  | { type: "journal"; item: Journal; haystack: string[] };

const pageSize = 8;
const activeFilterKeys = ["region", "category", "tag", "badge", "seat", "price", "duration", "date", "people", "reservation", "target", "weather"];
const regions = ["전체", "제주시", "서귀포", "구좌", "애월", "한림", "중문"];
const tags = ["쿠킹", "막걸리", "가족", "시음", "농장", "프라이빗"];
const resultTypes: { label: string; value: ResultType }[] = [
  { label: "전체", value: "all" },
  { label: "로컬체험", value: "experience" },
  { label: "행사", value: "event" },
  { label: "저널", value: "journal" },
];

const resultSectionMeta: Record<SearchResult["type"], { title: string; description: string }> = {
  experience: {
    title: "로컬체험",
    description: "지역, 일정, 테마에 맞춰 예약할 수 있는 체험 상품입니다.",
  },
  event: {
    title: "행사",
    description: "현재 모집 중이거나 종료된 이더라운드 행사와 포트폴리오입니다.",
  },
  journal: {
    title: "저널",
    description: "제주 로컬 호스트, 장소, 미식과 여행에 관한 콘텐츠입니다.",
  },
};

const categories = [
  { value: "", label: "전체 카테고리" },
  { value: "cooking", label: "쿠킹·베이킹" },
  { value: "tradition", label: "지역·전통" },
  { value: "wellness", label: "웰니스·치유" },
  { value: "family", label: "아이와 함께" },
  { value: "activity", label: "캠핑·액티비티" },
];

function valueOf(params: SearchParams, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function filterOption(params: SearchParams, key: string, value: string, label: string, note?: string): FilterOption {
  const current = valueOf(params, key);

  return {
    label,
    note,
    filterKey: key,
    value,
    active: value ? current === value : !current,
  };
}

function parsePage(value?: string) {
  const parsed = Number(value ?? 1);
  return Number.isFinite(parsed) ? Math.max(1, Math.floor(parsed)) : 1;
}

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function normalizedType(value?: string): ResultType {
  return value === "experience" || value === "event" || value === "journal" ? value : "all";
}

function searchHref(params: SearchParams, type: ResultType) {
  const search = new URLSearchParams();
  const keyword = normalize(valueOf(params, "q") ?? "");

  if (keyword) search.set("q", keyword);
  if (type !== "all") search.set("type", type);

  if (type === "experience") {
    for (const key of activeFilterKeys) {
      const value = valueOf(params, key);
      if (value) search.set(key, value);
    }
  }

  const query = search.toString();
  return query ? `${userRoutes.search}?${query}` : userRoutes.search;
}

function searchResetHref(params: SearchParams) {
  const search = new URLSearchParams();
  const keyword = normalize(valueOf(params, "q") ?? "");
  const type = normalizedType(valueOf(params, "type"));

  if (keyword) search.set("q", keyword);
  if (type !== "all") search.set("type", type);

  const query = search.toString();
  return query ? `${userRoutes.search}?${query}` : userRoutes.search;
}

function matchesKeyword(result: SearchResult, keyword: string) {
  if (!keyword) return true;
  const query = normalize(keyword);
  return result.haystack.some((item) => normalize(item).includes(query));
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
  if (value === "activity") return haystack.some((item) => ["피크닉", "수확", "농장", "마켓"].includes(item));
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
  if (value === "couple") return experience.tags.some((tag) => ["미식", "프라이빗", "시음"].includes(tag));
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

function matchesExperienceFilters(experience: Experience, params: SearchParams) {
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

  if (region && experience.region !== region) return false;
  if (!matchesCategoryGroup(experience, category)) return false;
  if (tag && !experience.tags.includes(tag)) return false;
  if (badge && experience.badge !== badge) return false;
  if (seat === "last" && !experience.schedules.some((schedule) => schedule.capacity - schedule.booked === 1)) return false;
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
}

function createFilterTabs(params: SearchParams): FilterTab[] {
  return [
    {
      id: "recommended",
      label: "추천",
      options: [
        filterOption(params, "badge", "특가", "특가", "할인 진행 중"),
        filterOption(params, "badge", "마감임박", "마감임박", "예약 가능 좌석이 적은 체험"),
        filterOption(params, "seat", "last", "1자리 남음", "원데이클래스 빠른 예약"),
        filterOption(params, "tag", "가족", "아이와 함께"),
        filterOption(params, "tag", "실내", "비오는 날"),
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
        filterOption(params, "reservation", "group", "단체 가능"),
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
        filterOption(params, "weather", "outdoor", "실외"),
        filterOption(params, "weather", "rain", "비 오는 날 가능"),
      ],
    },
  ];
}

function getInitialTabId(params: SearchParams) {
  if (valueOf(params, "badge") || valueOf(params, "seat")) return "recommended";
  if (valueOf(params, "region")) return "region";
  if (valueOf(params, "category")) return "category";
  if (valueOf(params, "tag")) return "tag";
  if (valueOf(params, "price")) return "price";
  if (valueOf(params, "duration")) return "duration";
  if (valueOf(params, "date")) return "date";
  if (valueOf(params, "people")) return "people";
  if (valueOf(params, "reservation")) return "reservation";
  if (valueOf(params, "target")) return "target";
  if (valueOf(params, "weather")) return "weather";
  return "recommended";
}

function renderResultCard(result: SearchResult) {
  if (result.type === "experience") return <ExperienceCard experience={result.item} />;
  if (result.type === "event") return <EventCard event={result.item} />;
  return <JournalCard item={result.item} />;
}

export default async function SearchPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const params = searchParams ? await searchParams : {};
  const keyword = normalize(valueOf(params, "q") ?? "");
  const localFilterCount = activeFilterKeys.filter((key) => valueOf(params, key)).length;
  const requestedType = normalizedType(valueOf(params, "type"));
  const activeType = localFilterCount > 0 && requestedType === "all" ? "experience" : requestedType;
  const requestedPage = parsePage(valueOf(params, "page"));
  const [experiences, events, journals] = await Promise.all([getExperiences(), getEvents(), getJournals()]);

  const results: SearchResult[] = [
    ...experiences.map<SearchResult>((experience) => ({
      type: "experience",
      item: experience,
      haystack: [
        experience.title,
        experience.summary,
        experience.description,
        experience.region,
        experience.category,
        experience.duration,
        experience.host.name,
        experience.host.description,
        experience.place.name,
        experience.place.address,
        experience.badge ?? "",
        experience.eyebrow,
        ...experience.tags,
        ...experience.highlights,
      ],
    })),
    ...events.map<SearchResult>((event) => ({
      type: "event",
      item: event,
      haystack: [event.title, event.summary, event.period, event.venue, event.partner, event.badge, event.status],
    })),
    ...journals.map<SearchResult>((journal) => ({
      type: "journal",
      item: journal,
      haystack: [journal.title, journal.excerpt, journal.category, journal.date],
    })),
  ];

  const filteredResults = results.filter((result) => {
    if (activeType !== "all" && result.type !== activeType) return false;
    if (!matchesKeyword(result, keyword)) return false;
    if (result.type === "experience") return matchesExperienceFilters(result.item, params);
    if (localFilterCount > 0) return false;
    return true;
  });
  const shouldPaginate = activeType !== "all";
  const totalPages = shouldPaginate ? Math.max(1, Math.ceil(filteredResults.length / pageSize)) : 1;
  const currentPage = shouldPaginate ? Math.min(requestedPage, totalPages) : 1;
  const pageStart = (currentPage - 1) * pageSize;
  const paginatedResults = shouldPaginate ? filteredResults.slice(pageStart, pageStart + pageSize) : filteredResults;
  const sectionTypes: Array<SearchResult["type"]> = activeType === "all" ? ["experience", "event", "journal"] : [activeType];
  const resultSections = sectionTypes
    .map((type) => ({
      type,
      ...resultSectionMeta[type],
      items: paginatedResults.filter((result) => result.type === type),
      total: filteredResults.filter((result) => result.type === type).length,
    }))
    .filter((section) => section.items.length > 0);
  const filterTabs = createFilterTabs(params);
  const initialTabId = getInitialTabId(params);
  const resultLabel = keyword ? `"${keyword}" 검색 결과` : "전체 콘텐츠";
  const showExperienceFilter = activeType === "all" || activeType === "experience";

  return (
    <section className="page-section search-page">
      <SectionHeader
        eyebrow="Search"
        title="검색"
        description="체험명, 지역, 키워드로 이더라운드의 로컬체험과 행사, 저널을 찾아보세요."
        level="h1"
      />

      <form action={userRoutes.search} className="search-panel">
        <label className="search-input-wrap">
          <RiSearchLine size={22} />
          <span className="sr-only">검색어</span>
          <input
            autoComplete="off"
            defaultValue={keyword}
            name="q"
            placeholder="어떤 로컬 경험을 찾고 있나요?"
            type="search"
          />
        </label>
        {activeType !== "all" ? <input name="type" type="hidden" value={activeType} /> : null}
        <button className="primary-button search-submit" type="submit">
          검색
        </button>
      </form>

      <div className="search-type-tabs" aria-label="검색 결과 유형">
        {resultTypes.map((type) => (
          <Link
            aria-current={activeType === type.value ? "page" : undefined}
            className="search-type-tab"
            data-active={activeType === type.value}
            href={searchHref(params, type.value)}
            key={type.value}
          >
            {type.label}
          </Link>
        ))}
      </div>

      <ListToolbar
        summary={
          <>
            <strong>{resultLabel}</strong>
            <span>{filteredResults.length.toLocaleString("ko-KR")}개</span>
            {showExperienceFilter ? (
              <ExperienceFilterModal
                activeCount={localFilterCount}
                basePath={userRoutes.search}
                initialTabId={initialTabId}
                resultCount={filteredResults.length}
                submitLabel={`${filteredResults.length.toLocaleString("ko-KR")}개 결과보기`}
                tabs={filterTabs}
              />
            ) : null}
          </>
        }
      />

      {resultSections.length ? (
        <div className="search-result-sections">
          {resultSections.map((section) => (
            <section className="search-result-section" aria-labelledby={`search-section-${section.type}`} key={section.type}>
              <header className="search-result-section-header">
                <div>
                  <span>{section.total.toLocaleString("ko-KR")}개</span>
                  <h2 id={`search-section-${section.type}`}>{section.title}</h2>
                  <p>{section.description}</p>
                </div>
                {activeType === "all" ? (
                  <Link className="link-button" href={searchHref(params, section.type)}>
                    더보기
                  </Link>
                ) : null}
              </header>
              <div className="search-result-grid">
                {section.items.map((result) => (
                  <div className="search-result-item" data-result-type={result.type} key={`${result.type}-${result.item.slug}`}>
                    {renderResultCard(result)}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <SearchEmptyState
          keyword={keyword}
          resetHref={localFilterCount > 0 ? searchResetHref(params) : undefined}
          description="지역명, 체험명, 키워드를 조금 더 넓게 입력하거나 필터를 초기화해 보세요."
        />
      )}

      {shouldPaginate && filteredResults.length > pageSize ? (
        <Pagination basePath={userRoutes.search} currentPage={currentPage} pageSize={pageSize} searchParams={params} totalItems={filteredResults.length} />
      ) : null}
    </section>
  );
}
