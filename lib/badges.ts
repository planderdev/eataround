export type BadgeTone = "sale" | "urgent" | "stock" | "ongoing" | "booking" | "neutral";

export function getBadgeTone(label?: string | null): BadgeTone {
  if (!label) return "neutral";
  if (label.includes("특가")) return "sale";
  if (label.includes("마감")) return "urgent";
  if (label.includes("1자리")) return "stock";
  if (label.includes("진행")) return "ongoing";
  if (label.includes("예약")) return "booking";
  return "neutral";
}
