import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExperienceCard } from "@/components/ExperienceCard";
import { getCollection, getCollections, getExperiences } from "@/lib/content";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const curationHeroImages: Record<string, string> = {
  "jeju-local-food": "https://images.unsplash.com/photo-1761530439353-eed2b5718f9d?auto=format&fit=crop&w=2400&q=80",
  "seogwipo-brewery": "https://images.unsplash.com/photo-1766244953579-e829796849cc?auto=format&fit=crop&w=2400&q=80",
  "team-workshop": "https://images.unsplash.com/photo-1579169825453-8d4b4653cc2c?auto=format&fit=crop&w=2400&q=80",
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
  const heroImage = curationHeroImages[collection.slug] ?? collection.image;

  return (
    <article className="curation-detail-page">
      <header
        className="curation-detail-page-hero"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(21, 30, 26, 0.78), rgba(21, 30, 26, 0.42)), url(${heroImage})`,
        }}
      >
        <span>
          <small>{collection.eyebrow}</small>
          <h1>{collection.title}</h1>
          <p>{collection.description}</p>
        </span>
      </header>

      <section className="page-section curation-detail-page-section">
        <div className="curation-detail-page-section-head">
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
        <section className="page-section curation-detail-page-section">
          <div className="curation-detail-page-section-head">
            <span className="eyebrow">More Curations</span>
            <h2>다른 기획전</h2>
          </div>
          <div className="curation-detail-page-more-grid">
            {otherCollections.map((item) => (
              <Link href={item.href} key={item.slug}>
                <img src={item.image} alt={item.title} loading="lazy" />
                <span>
                  <small>{item.eyebrow}</small>
                  <strong>{item.title}</strong>
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
