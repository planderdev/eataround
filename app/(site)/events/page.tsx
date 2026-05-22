import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";
import { EventCard } from "@/components/EventCard";
import { ListToolbar } from "@/components/ListToolbar";
import { Pagination } from "@/components/Pagination";
import { SectionHeader } from "@/components/SectionHeader";
import { SortSelect } from "@/components/SortSelect";
import { getEvents } from "@/lib/content";

export const metadata: Metadata = {
  title: "진행중인 행사",
};

type SearchParams = Record<string, string | string[] | undefined>;
type EventList = Awaited<ReturnType<typeof getEvents>>;

const pageSize = 6;

const sortOptions = [
  { label: "추천순", value: "recommended" },
  { label: "최신 시작순", value: "latest" },
  { label: "마감 임박순", value: "ending-soon" },
  { label: "이름순", value: "title" },
];

function valueOf(params: SearchParams, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function parsePage(value?: string) {
  const parsed = Number(value ?? 1);
  return Number.isFinite(parsed) ? Math.max(1, Math.floor(parsed)) : 1;
}

function normalizeSort(value?: string): string {
  if (value && sortOptions.some((option) => option.value === value)) return value;
  return "recommended";
}

function periodTimestamp(period: string, segment: 0 | 1) {
  const dateText = period.split("-")[segment]?.trim().replace(/\./g, "-");
  const timestamp = dateText ? Date.parse(dateText) : Number.NaN;
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function deriveEventStatus(event: EventList[number]): "upcoming" | "ongoing" | "ended" {
  const now = new Date();
  const start = periodTimestamp(event.period, 0);
  const end = periodTimestamp(event.period, 1);

  if (!start || !end) return event.status === "ended" ? "ended" : "ongoing";
  if (now.getTime() < start) return "upcoming";
  if (now.getTime() > end + 86_399_999) return "ended";
  return "ongoing";
}

function sortEvents(events: EventList, sort: string) {
  const sorted = [...events];

  if (sort === "latest") {
    return sorted.sort((a, b) => periodTimestamp(b.period, 0) - periodTimestamp(a.period, 0));
  }

  if (sort === "ending-soon") {
    return sorted.sort((a, b) => periodTimestamp(a.period, 1) - periodTimestamp(b.period, 1));
  }

  if (sort === "title") {
    return sorted.sort((a, b) => a.title.localeCompare(b.title, "ko"));
  }

  return sorted;
}

export default async function EventsPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const params = searchParams ? await searchParams : {};
  const events = await getEvents();
  const status = valueOf(params, "status") === "upcoming" ? "upcoming" : "ongoing";
  const sort = normalizeSort(valueOf(params, "sort"));
  const filteredEvents = events.filter((event) => deriveEventStatus(event) === status);
  const sortedEvents = sortEvents(filteredEvents, sort);
  const requestedPage = parsePage(valueOf(params, "page"));
  const totalPages = Math.max(1, Math.ceil(sortedEvents.length / pageSize));
  const currentPage = Math.min(requestedPage, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const paginatedEvents = sortedEvents.slice(pageStart, pageStart + pageSize);

  return (
    <section className="page-section">
      <SectionHeader
        eyebrow="Portfolio"
        title={status === "upcoming" ? "예정 행사" : "진행중인 행사"}
        description={status === "upcoming" ? "곧 모집을 시작할 로컬 행사입니다." : "이더라운드가 함께 만든 로컬 행사와 프로젝트를 확인하세요."}
        level="h1"
      />
      <div className="tabs">
        <Link className="tab" data-active={status === "ongoing"} href="/events">
          진행중인 행사
        </Link>
        <Link className="tab" data-active={status === "upcoming"} href="/events?status=upcoming">
          예정 행사
        </Link>
        <Link className="tab" href="/events/ended">
          종료된 행사
        </Link>
      </div>

      <ListToolbar summary={<strong>{sortedEvents.length}개 행사</strong>}>
        <SortSelect label="행사 정렬" options={sortOptions} value={sort} />
      </ListToolbar>

      {paginatedEvents.length ? (
        <div className="event-grid">
          {paginatedEvents.map((event) => (
            <EventCard event={event} key={event.slug} />
          ))}
        </div>
      ) : (
        <EmptyState title="예정된 행사를 준비하고 있습니다." description="모집이 시작되면 이곳에서 바로 확인할 수 있습니다." />
      )}
      <Pagination alwaysShow={sortedEvents.length > 0} basePath="/events" currentPage={currentPage} pageSize={pageSize} searchParams={params} totalItems={sortedEvents.length} />
    </section>
  );
}
