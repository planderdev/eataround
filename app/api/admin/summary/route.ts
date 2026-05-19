import { NextResponse } from "next/server";
import { getEvents, getExperiences, getJournals } from "@/lib/content";

export async function GET() {
  const [experiences, events, journals] = await Promise.all([getExperiences(), getEvents(), getJournals()]);

  return NextResponse.json({
    products: experiences.length,
    ongoingEvents: events.filter((event) => event.status === "ongoing").length,
    endedEvents: events.filter((event) => event.status === "ended").length,
    journals: journals.length,
  });
}
