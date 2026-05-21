import Link from "next/link";
import { CategoryStrip } from "@/components/CategoryStrip";
import { EventCard } from "@/components/EventCard";
import { ExperienceCard } from "@/components/ExperienceCard";
import { HeroBanner } from "@/components/HeroBanner";
import { LastSeatSection, type LastSeatItem } from "@/components/LastSeatSection";
import { MobileExperienceCarousel } from "@/components/MobileExperienceCarousel";
import { MobileSwipeCarousel, type MobileSwipeItem } from "@/components/MobileSwipeCarousel";
import { PackageCtaCarousel } from "@/components/PackageCtaCarousel";
import { PromoBanner } from "@/components/PromoBanner";
import { SectionHeader } from "@/components/SectionHeader";
import { getCategories, getCollections, getEvents, getExperiences, getHeroSlides, getJournals, getPackageCtas } from "@/lib/content";
import { userRoutes } from "@/lib/routes";

export default async function HomePage() {
  const [experiences, events, journals, heroSlides, categoryItems, collectionItems, packageCtas] = await Promise.all([
    getExperiences(),
    getEvents(),
    getJournals(),
    getHeroSlides(),
    getCategories(),
    getCollections(),
    getPackageCtas(),
  ]);
  const featuredExperiences = experiences.slice(0, 4);
  const ongoingEvents = events.filter((event) => event.status === "ongoing");
  const collectionSwipeItems: MobileSwipeItem[] = collectionItems;
  const eventSwipeItems: MobileSwipeItem[] = ongoingEvents.map((event) => ({
    href: `/events/${event.slug}`,
    image: event.image,
    eyebrow: event.badge,
    title: event.title,
    description: event.summary,
  }));
  const journalSwipeItems: MobileSwipeItem[] = journals.map((item) => ({
    href: `/journal/${item.slug}`,
    image: item.image,
    eyebrow: `${item.category} · ${item.date}`,
    title: item.title,
    description: item.excerpt,
  }));
  const lastSeatItems: LastSeatItem[] = experiences
    .map((experience) => ({
      experience,
      schedule: experience.schedules.find((schedule) => schedule.capacity - schedule.booked === 1),
    }))
    .filter((item): item is LastSeatItem => Boolean(item.schedule));

  return (
    <>
      <HeroBanner slides={heroSlides} />
      <CategoryStrip items={categoryItems} />

      <LastSeatSection items={lastSeatItems} />

      <PromoBanner />

      <section className="page-section featured-experience-section" data-aos="fade-up">
        <SectionHeader
          eyebrow="Recommended"
          title="추천 로컬체험"
          description="이더라운드가 소개하는 제주 여행을 한눈에 만나보세요."
          href={userRoutes.experiences}
        />
        <div className="featured-grid">
          {featuredExperiences.map((experience) => (
            <ExperienceCard experience={experience} key={experience.slug} />
          ))}
        </div>
        <MobileExperienceCarousel items={featuredExperiences} />
      </section>

      <section className="page-section mobile-carousel-section" data-aos="fade-up">
        <SectionHeader eyebrow="Collections" title="기획전" description="먹고 알고 경험하는 제주 로컬 여행을 취향별로 둘러보세요." />
        <MobileSwipeCarousel ctaHref={userRoutes.curations} ctaLabel="기획전 전체보기" items={collectionSwipeItems} showDots variant="responsive" />
      </section>

      <div className="section-band section-band--soft">
        <section className="page-section mobile-carousel-section" data-aos="fade-up">
          <SectionHeader eyebrow="Live Events" title="진행중인 행사" href="/events" actionLabel="행사 전체보기" />
          <div className="event-grid">
            {ongoingEvents.map((event) => (
              <EventCard event={event} key={event.slug} />
            ))}
          </div>
          <MobileSwipeCarousel ctaHref="/events" ctaLabel="행사 전체보기" items={eventSwipeItems} />
        </section>
      </div>

      <section className="page-section package-cta-section" data-aos="fade-up">
        <PackageCtaCarousel items={packageCtas} />
      </section>

      <div className="section-band section-band--cream">
        <section className="page-section mobile-carousel-section" data-aos="fade-up">
          <SectionHeader eyebrow="Journal" title="저널" href="/journal" />
          <div className="journal-grid">
            {journals.map((item) => (
              <Link className="journal-card" data-aos="fade-up" href={`/journal/${item.slug}`} key={item.slug}>
                <img src={item.image} alt={item.title} loading="lazy" />
                <span>
                  <small>
                    {item.category} · {item.date}
                  </small>
                  <strong>{item.title}</strong>
                  <p>{item.excerpt}</p>
                </span>
              </Link>
            ))}
          </div>
          <MobileSwipeCarousel ctaHref="/journal" ctaLabel="저널 전체보기" items={journalSwipeItems} />
        </section>
      </div>
    </>
  );
}
