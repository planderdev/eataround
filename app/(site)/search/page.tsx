import type { Metadata } from "next";
import Link from "next/link";
import { EventCard } from "@/components/EventCard";
import { ExperienceCard } from "@/components/ExperienceCard";
import { ExperienceFilterModal } from "@/components/ExperienceFilterModal";
import { JournalCard } from "@/components/JournalCard";
import { ListToolbar } from "@/components/ListToolbar";
import { Pagination } from "@/components/Pagination";
import { SearchAutocomplete } from "@/components/SearchAutocomplete";
import { SearchEmptyState } from "@/components/SearchEmptyState";
import { SectionHeader } from "@/components/SectionHeader";
import { getEvents, getExperiences, getJournals } from "@/lib/content";
import type { EventItem, Experience, Journal } from "@/lib/data";
import {
  activeFilterKeys,
  applyExperienceFilters,
  countActiveFilters,
  createExperienceFilterTabs,
  getInitialFilterTabId,
  valueOf,
  type FilterSearchParams,
} from "@/lib/experience-filters";
import { userRoutes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "검색",
};

type ResultType = "all" | "experience" | "event" | "journal";

type SearchResult =
  | { type: "experience"; item: Experience; haystack: string[] }
  | { type: "event"; item: EventItem; haystack: string[] }
  | { type: "journal"; item: Journal; haystack: string[] };

const pageSize = 8;
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

function searchHref(params: FilterSearchParams, type: ResultType) {
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

function searchResetHref(params: FilterSearchParams) {
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

function renderResultCard(result: SearchResult) {
  if (result.type === "experience") return <ExperienceCard experience={result.item} />;
  if (result.type === "event") return <EventCard event={result.item} />;
  return <JournalCard item={result.item} />;
}

export default async function SearchPage({ searchParams }: { searchParams?: Promise<FilterSearchParams> }) {
  const params = searchParams ? await searchParams : {};
  const keyword = normalize(valueOf(params, "q") ?? "");
  const localFilterCount = countActiveFilters(params);
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
    if (result.type === "experience") return applyExperienceFilters(result.item, params);
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
  const filterTabs = createExperienceFilterTabs(params);
  const initialTabId = getInitialFilterTabId(params);
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

      <SearchAutocomplete
        activeType={activeType}
        defaultValue={keyword}
        suggestionPool={[
          ...experiences.map((item) => ({ label: item.title, group: "experience" as const })),
          ...events.map((item) => ({ label: item.title, group: "event" as const })),
          ...journals.map((item) => ({ label: item.title, group: "journal" as const })),
        ]}
        trendingKeywords={["발효", "막걸리", "해녀", "감귤", "팜투마켓", "단체 워크숍", "비오는날", "가족"]}
      />

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
