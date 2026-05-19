import Link from "next/link";
import { RiCalendarLine, RiMapPinLine } from "@remixicon/react";
import { getBadgeTone } from "@/lib/badges";
import type { EventItem } from "@/lib/data";

export function EventCard({ event }: { event: EventItem }) {
  return (
    <Link className="event-card" data-aos="fade-up" href={`/events/${event.slug}`}>
      <span className="event-image">
        <img src={event.image} alt={event.title} loading="lazy" />
        <span className="badge-row">
          <span className="last-seat-badge" data-tone={getBadgeTone(event.badge)}>{event.badge}</span>
        </span>
      </span>
      <span className="event-body">
        <strong>{event.title}</strong>
        <span>{event.summary}</span>
        <span className="card-meta">
          <span>
            <RiCalendarLine size={14} />
            {event.period}
          </span>
          <span>
            <RiMapPinLine size={14} />
            {event.venue}
          </span>
        </span>
      </span>
    </Link>
  );
}
