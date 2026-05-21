import Link from "next/link";
import { RiArrowRightLine } from "@remixicon/react";
import type { CollectionItem } from "@/lib/data";

type CurationCardProps = {
  item: Pick<CollectionItem, "description" | "eyebrow" | "href" | "image" | "slug" | "title">;
};

export function CurationCard({ item }: CurationCardProps) {
  return (
    <Link className="curation-card" href={item.href}>
      <img src={item.image} alt={item.title} loading="lazy" />
      <span>
        <small>{item.eyebrow}</small>
        <strong>{item.title}</strong>
        <p>{item.description}</p>
        <b>
          자세히 보기
          <RiArrowRightLine size={16} />
        </b>
      </span>
    </Link>
  );
}
