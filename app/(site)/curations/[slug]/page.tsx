import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RiArrowLeftLine, RiArrowRightLine } from "@remixicon/react";
import { ExperienceCard } from "@/components/ExperienceCard";
import { getCollection, getCollections, getExperiences } from "@/lib/content";
import { userRoutes } from "@/lib/routes";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const collections = await getCollections();
  return collections.map((collection) => ({ slug: collection.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollection(slug);
  if (!collection) return {};

  return {
    title: collection.title,
    description: collection.description,
  };
}

export default async function CurationDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [collection, collections, experiences] = await Promise.all([
    getCollection(slug),
    getCollections(),
    getExperiences(),
  ]);

  if (!collection) notFound();

  const relatedExperiences = pickCurationExperiences(slug, experiences);
  const otherCollections = collections.filter((item) => item.slug !== collection.slug).slice(0, 3);

  return (
    <article className="page-section curation-detail">
      <Link className="journal-detail-back" href={userRoutes.curations}>
        <RiArrowLeftLine size={18} />
        기획전 목록
      </Link>

      <header className="curation-detail-hero">
        <img src={collection.image} alt={collection.title} />
        <span>
          <small>{collection.eyebrow}</small>
          <h1>{collection.title}</h1>
          <p>{collection.description}</p>
        </span>
      </header>

      <section className="curation-detail-section">
        <div className="curation-section-head">
          <span className="eyebrow">Selected Experiences</span>
          <h2>함께 보면 좋은 체험</h2>
        </div>
        <div className="card-grid">
          {relatedExperiences.map((experience) => (
            <ExperienceCard experience={experience} key={experience.slug} />
          ))}
        </div>
      </section>

      {otherCollections.length ? (
        <section className="curation-detail-section">
          <div className="curation-section-head">
            <span className="eyebrow">More Curations</span>
            <h2>다른 기획전</h2>
          </div>
          <div className="curation-mini-grid">
            {otherCollections.map((item) => (
              <Link href={item.href} key={item.slug}>
                <img src={item.image} alt={item.title} loading="lazy" />
                <span>
                  <small>{item.eyebrow}</small>
                  <strong>{item.title}</strong>
                  <RiArrowRightLine size={17} />
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}

function pickCurationExperiences(slug: string, experiences: Awaited<ReturnType<typeof getExperiences>>) {
  if (slug.includes("brewery")) {
    return experiences.filter((item) => item.tags.some((tag) => ["양조장", "마을", "시음"].includes(tag))).slice(0, 4);
  }

  if (slug.includes("team")) {
    return experiences.filter((item) => item.tags.includes("프라이빗") || item.category === "미식").slice(0, 4);
  }

  return experiences.filter((item) => item.tags.some((tag) => ["쿠킹", "베이킹", "식사", "감귤"].includes(tag))).slice(0, 4);
}
