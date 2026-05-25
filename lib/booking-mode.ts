import type { Experience } from "@/lib/data";

export type BookingMode = "schedule" | "inquiry" | "package";

const PACKAGE_TAGS = ["기업", "기관", "단체", "워크숍", "패키지"];

export function detectBookingMode(experience: Experience): BookingMode {
  const tagHit = experience.tags.some((tag) => PACKAGE_TAGS.some((needle) => tag.includes(needle)));
  if (tagHit) return "package";
  const allInquiry = experience.schedules.length > 0 && experience.schedules.every((schedule) => schedule.reservationType === "inquiry");
  if (allInquiry) return "inquiry";
  return "schedule";
}
