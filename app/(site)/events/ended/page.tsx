import type { Metadata } from "next";
import Link from "next/link";
import { EventCard } from "@/components/EventCard";
import { Pagination } from "@/components/Pagination";
import { SectionHeader } from "@/components/SectionHeader";
import { getEvents } from "@/lib/content";

export const metadata: Metadata = {
  title: "종료된 행사",
};

type SearchParams = Record<string, string | string[] | undefined>;

const pageSize = 6;

function valueOf(params: SearchParams, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function parsePage(value?: string) {
  const parsed = Number(value ?? 1);
  return Number.isFinite(parsed) ? Math.max(1, Math.floor(parsed)) : 1;
}

export default async function EndedEventsPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const params = searchParams ? await searchParams : {};
  const events = await getEvents();
  const endedEvents = events.filter((event) => event.status === "ended");
  const requestedPage = parsePage(valueOf(params, "page"));
  const totalPages = Math.max(1, Math.ceil(endedEvents.length / pageSize));
  const currentPage = Math.min(requestedPage, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const paginatedEvents = endedEvents.slice(pageStart, pageStart + pageSize);

  return (
    <section className="page-section">
      <SectionHeader
        eyebrow="Archive"
        title="종료된 행사"
        description="기관·브랜드와 함께한 로컬 프로젝트의 운영 기록을 모았습니다."
        level="h1"
      />
      <div className="tabs">
        <Link className="tab" href="/events">
          진행중인 행사
        </Link>
        <Link className="tab" href="/events?status=upcoming">
          예정 행사
        </Link>
        <Link className="tab" data-active="true" href="/events/ended">
          종료된 행사
        </Link>
      </div>
      <div className="event-grid">
        {paginatedEvents.map((event) => (
          <EventCard event={event} key={event.slug} />
        ))}
      </div>
      <Pagination basePath="/events/ended" currentPage={currentPage} pageSize={pageSize} searchParams={params} totalItems={endedEvents.length} />
    </section>
  );
}
