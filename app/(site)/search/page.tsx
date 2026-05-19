import type { Metadata } from "next";
import Link from "next/link";
import {
  RiArrowRightLine,
  RiBookOpenLine,
  RiCalendarEventLine,
  RiMapPinLine,
  RiSearchLine,
  RiSparkling2Line,
  RiTimeLine,
} from "@remixicon/react";
import { Pagination } from "@/components/Pagination";
import { SectionHeader } from "@/components/SectionHeader";
import { getBadgeTone } from "@/lib/badges";
import { getEvents, getExperiences, getJournals } from "@/lib/content";
import { formatWon } from "@/lib/format";
import { experiencePath, userRoutes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "검색",
};

type SearchParams = Record<string, string | string[] | undefined>;

type ResultType = "all" | "experience" | "event" | "journal";

type SearchResult = {
  type: Exclude<ResultType, "all">;
  typeLabel: string;
  title: string;
  href: string;
  image: string;
  summary: string;
  meta: string[];
  badge?: string;
  price?: number;
  haystack: string[];
};

const pageSize = 8;
const resultTypes: { label: string; value: ResultType }[] = [
  { label: "전체", value: "all" },
  { label: "로컬체험", value: "experience" },
  { label: "행사", value: "event" },
  { label: "저널", value: "journal" },
];

function valueOf(params: SearchParams, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
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

function searchHref(keyword: string, type: ResultType) {
  const params = new URLSearchParams();
  if (keyword) params.set("q", keyword);
  if (type !== "all") params.set("type", type);

  const query = params.toString();
  return query ? `/search?${query}` : "/search";
}

function matchesKeyword(result: SearchResult, keyword: string) {
  if (!keyword) return true;
  const query = normalize(keyword);
  return result.haystack.some((item) => normalize(item).includes(query));
}

function typeIcon(type: SearchResult["type"]) {
  if (type === "experience") return RiSparkling2Line;
  if (type === "event") return RiCalendarEventLine;
  return RiBookOpenLine;
}

export default async function SearchPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const params = searchParams ? await searchParams : {};
  const keyword = normalize(valueOf(params, "q") ?? "");
  const activeType = normalizedType(valueOf(params, "type"));
  const requestedPage = parsePage(valueOf(params, "page"));
  const [experiences, events, journals] = await Promise.all([getExperiences(), getEvents(), getJournals()]);

  const results: SearchResult[] = [
    ...experiences.map<SearchResult>((experience) => ({
      type: "experience",
      typeLabel: "로컬체험",
      title: experience.title,
      href: experiencePath(experience.slug),
      image: experience.image,
      summary: experience.summary,
      meta: [experience.region, experience.duration],
      badge: experience.badge ?? experience.eyebrow,
      price: experience.price,
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
        ...experience.tags,
        ...experience.highlights,
      ],
    })),
    ...events.map<SearchResult>((event) => ({
      type: "event",
      typeLabel: event.status === "ongoing" ? "진행중인 행사" : "종료된 행사",
      title: event.title,
      href: `/events/${event.slug}`,
      image: event.image,
      summary: event.summary,
      meta: [event.period, event.venue],
      badge: event.badge,
      haystack: [event.title, event.summary, event.period, event.venue, event.partner, event.badge, event.status],
    })),
    ...journals.map<SearchResult>((journal) => ({
      type: "journal",
      typeLabel: "저널",
      title: journal.title,
      href: `/journal/${journal.slug}`,
      image: journal.image,
      summary: journal.excerpt,
      meta: [journal.category, journal.date],
      badge: journal.category,
      haystack: [journal.title, journal.excerpt, journal.category, journal.date],
    })),
  ];

  const filteredResults = results.filter((result) => {
    if (activeType !== "all" && result.type !== activeType) return false;
    return matchesKeyword(result, keyword);
  });
  const totalPages = Math.max(1, Math.ceil(filteredResults.length / pageSize));
  const currentPage = Math.min(requestedPage, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const paginatedResults = filteredResults.slice(pageStart, pageStart + pageSize);

  return (
    <section className="page-section search-page">
      <SectionHeader
        eyebrow="Search"
        title="검색"
        description="체험명, 지역, 키워드, 행사, 저널 콘텐츠를 한 번에 찾아보세요."
        level="h1"
      />

      <form action="/search" className="search-panel">
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
            href={searchHref(keyword, type.value)}
            key={type.value}
          >
            {type.label}
          </Link>
        ))}
      </div>

      <div className="search-result-summary">
        <strong>{keyword ? `"${keyword}" 검색 결과` : "전체 콘텐츠"}</strong>
        <span>{filteredResults.length.toLocaleString("ko-KR")}개</span>
      </div>

      {paginatedResults.length ? (
        <div className="search-result-list">
          {paginatedResults.map((result) => {
            const Icon = typeIcon(result.type);

            return (
              <Link className="search-result-card" href={result.href} key={`${result.type}-${result.href}`}>
                <span className="search-result-image">
                  <img src={result.image} alt={result.title} loading="lazy" />
                  {result.badge ? (
                    <span className="badge-row">
                      <span className="last-seat-badge" data-tone={getBadgeTone(result.badge)}>{result.badge}</span>
                    </span>
                  ) : null}
                </span>
                <span className="search-result-body">
                  <span className="search-result-type">
                    <Icon size={16} />
                    {result.typeLabel}
                  </span>
                  <strong>{result.title}</strong>
                  <span className="search-result-description">{result.summary}</span>
                  <span className="search-result-meta">
                    {result.meta.map((item, index) => (
                      <span key={`${result.href}-${item}`}>
                        {index === 0 ? <RiMapPinLine size={14} /> : <RiTimeLine size={14} />}
                        {item}
                      </span>
                    ))}
                  </span>
                  <span className="search-result-bottom">
                    {result.price ? <b>{formatWon(result.price)}</b> : <span>자세히 보기</span>}
                    <span className="link-button">
                      보기
                      <RiArrowRightLine size={16} />
                    </span>
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="empty-state search-empty-state">
          <strong>검색 결과가 없습니다.</strong>
          <p>지역명, 체험명, 키워드를 조금 더 넓게 입력해보세요.</p>
          <Link className="primary-button" href={userRoutes.experiences}>
            전체 체험 보기
          </Link>
        </div>
      )}

      <Pagination basePath="/search" currentPage={currentPage} pageSize={pageSize} searchParams={params} totalItems={filteredResults.length} />
    </section>
  );
}
