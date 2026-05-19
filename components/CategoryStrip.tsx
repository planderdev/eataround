import Link from "next/link";
import type { Category } from "@/lib/data";
import { withBasePath } from "@/lib/paths";

export function CategoryStrip({ items }: { items: Category[] }) {
  return (
    <div className="category-strip" aria-label="카테고리 바로가기" data-aos="fade-up" data-aos-delay="120">
      {items.map((category, index) => (
        <Link
          className="category-item"
          data-aos="zoom-in"
          data-aos-delay={String(80 + index * 35)}
          data-tone={category.tone}
          href={category.href}
          key={category.label}
        >
          <span>
            <img src={withBasePath(category.iconAsset)} alt={category.label} loading="eager" />
          </span>
          <strong>{category.label}</strong>
        </Link>
      ))}
    </div>
  );
}
