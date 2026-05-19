import type { Metadata } from "next";
import Link from "next/link";
import { EventCard } from "@/components/EventCard";
import { Pagination } from "@/components/Pagination";
import { SectionHeader } from "@/components/SectionHeader";
import { getEvents } from "@/lib/content";

export const metadata: Metadata = {
  title: "진행중인 행사",
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

export default async function EventsPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const params = searchParams ? await searchParams : {};
  const events = await getEvents();
  const status = valueOf(params, "status") === "upcoming" ? "upcoming" : "ongoing";
  const ongoingEvents = status === "upcoming" ? [] : events.filter((event) => event.status === "ongoing");
  const requestedPage = parsePage(valueOf(params, "page"));
  const totalPages = Math.max(1, Math.ceil(ongoingEvents.length / pageSize));
  const currentPage = Math.min(requestedPage, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const paginatedEvents = ongoingEvents.slice(pageStart, pageStart + pageSize);

  return (
    <section className="page-section">
      <SectionHeader
        eyebrow="Portfolio"
        title={status === "upcoming" ? "예정 행사" : "진행중인 행사"}
        description={status === "upcoming" ? "곧 모집이 시작될 로컬 행사입니다." : "이더라운드가 함께 만드는 로컬 행사와 프로젝트를 확인하세요."}
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
      {paginatedEvents.length ? (
        <div className="event-grid">
          {paginatedEvents.map((event) => (
            <EventCard event={event} key={event.slug} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <strong>예정된 행사를 준비하고 있습니다.</strong>
          <p>모집이 시작되면 이곳에서 바로 확인할 수 있습니다.</p>
        </div>
      )}
      <Pagination basePath="/events" currentPage={currentPage} pageSize={pageSize} searchParams={params} totalItems={ongoingEvents.length} />
    </section>
  );
}
