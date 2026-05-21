import Link from "next/link";
import type { Journal } from "@/lib/data";

type JournalCardProps = {
  animated?: boolean;
  item: Pick<Journal, "category" | "date" | "excerpt" | "image" | "slug" | "title">;
};

export function JournalCard({ animated = false, item }: JournalCardProps) {
  return (
    <Link className="journal-card" data-aos={animated ? "fade-up" : undefined} href={`/journal/${item.slug}`}>
      <img src={item.image} alt={item.title} loading="lazy" />
      <span>
        <small>
          {item.category} · {item.date}
        </small>
        <strong>{item.title}</strong>
        <p>{item.excerpt}</p>
      </span>
    </Link>
  );
}
