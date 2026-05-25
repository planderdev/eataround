import type { MetadataRoute } from "next";
import { getCollections, getEvents, getExperiences, getJournals } from "@/lib/content";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://eataround.co.kr";

const STATIC_PATHS: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/local-experiences", changeFrequency: "daily", priority: 0.9 },
  { path: "/curations", changeFrequency: "weekly", priority: 0.7 },
  { path: "/events", changeFrequency: "daily", priority: 0.7 },
  { path: "/events/ended", changeFrequency: "weekly", priority: 0.5 },
  { path: "/journal", changeFrequency: "weekly", priority: 0.7 },
  { path: "/b2b", changeFrequency: "weekly", priority: 0.6 },
  { path: "/b2b/packages", changeFrequency: "weekly", priority: 0.6 },
  { path: "/b2b/quote", changeFrequency: "monthly", priority: 0.5 },
  { path: "/help", changeFrequency: "monthly", priority: 0.4 },
  { path: "/policies/terms", changeFrequency: "yearly", priority: 0.2 },
  { path: "/policies/privacy", changeFrequency: "yearly", priority: 0.2 },
  { path: "/policies/refund", changeFrequency: "yearly", priority: 0.2 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [experiences, events, journals, collections] = await Promise.all([
    getExperiences().catch(() => []),
    getEvents().catch(() => []),
    getJournals().catch(() => []),
    getCollections().catch(() => []),
  ]);

  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map((item) => ({
    url: `${SITE_URL}${item.path}`,
    lastModified: now,
    changeFrequency: item.changeFrequency,
    priority: item.priority,
  }));

  for (const experience of experiences) {
    entries.push({
      url: `${SITE_URL}/local-experiences/${experience.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  for (const event of events) {
    entries.push({
      url: `${SITE_URL}/events/${event.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  for (const journal of journals) {
    entries.push({
      url: `${SITE_URL}/journal/${journal.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    });
  }

  for (const collection of collections) {
    entries.push({
      url: `${SITE_URL}/curations/${collection.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    });
  }

  return entries;
}
