import type { Metadata } from "next";
import Link from "next/link";
import { RiArrowRightLine } from "@remixicon/react";
import { SectionHeader } from "@/components/SectionHeader";
import { getCollections } from "@/lib/content";

export const metadata: Metadata = {
  title: "기획전",
  description: "제주 로컬체험을 취향과 일정별로 묶어 소개합니다.",
};

export default async function CurationsPage() {
  const collections = await getCollections();

  return (
    <section className="page-section">
      <SectionHeader
        eyebrow="Curations"
        title="기획전"
        description="시즌, 지역, 목적에 맞춰 고른 로컬 체험 컬렉션입니다."
        level="h1"
      />

      <div className="curation-grid">
        {collections.map((collection) => (
          <Link className="curation-card" href={collection.href} key={collection.slug}>
            <img src={collection.image} alt={collection.title} loading="lazy" />
            <span>
              <small>{collection.eyebrow}</small>
              <strong>{collection.title}</strong>
              <p>{collection.description}</p>
              <b>
                자세히 보기
                <RiArrowRightLine size={16} />
              </b>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
