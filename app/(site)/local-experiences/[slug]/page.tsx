import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RiExternalLinkLine, RiLeafLine, RiMapPin2Line, RiStarFill, RiUserStarLine } from "@remixicon/react";
import { Badge } from "@/components/Badge";
import { BookingPanel } from "@/components/BookingPanel";
import { DetailRelatedExperiences } from "@/components/DetailRelatedExperiences";
import { DetailOptionSelector } from "@/components/DetailOptionSelector";
import {
  LocalExperienceCardCarousel,
  LocalExperienceFaq,
  LocalExperiencePhotoGrid,
  LocalExperienceTabs,
  type LocalExperienceFaqItem,
  type LocalExperienceMediaItem,
  type LocalExperienceTabItem,
} from "@/components/LocalExperienceDetailClient";
import { getExperience, getExperienceDetail, getExperiences, getProductGallery, getProductReviews } from "@/lib/content";
import type { Experience, ExperienceDetail } from "@/lib/data";
import { formatWon } from "@/lib/format";
import { userRoutes } from "@/lib/routes";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const fallbackGalleryImages = [
  "https://cdn.imweb.me/thumbnail/20230831/65c0d9fa53fd2.jpg",
  "https://cdn.imweb.me/thumbnail/20230831/2ca78f5658b74.jpg",
  "https://cdn.imweb.me/thumbnail/20230831/266f4e7d5ddb5.jpg",
  "https://cdn.imweb.me/thumbnail/20230831/c0504b329b735.jpg",
];

const refundSteps = [
  { label: "D-7", value: "전액", tone: "good" },
  { label: "D-6", value: "70%", tone: "good" },
  { label: "D-5", value: "50%", tone: "warn" },
  { label: "D-4", value: "30%", tone: "warn" },
  { label: "D-3", value: "불가", tone: "bad" },
];

const tabItems: LocalExperienceTabItem[] = [
  { id: "points", label: "포인트" },
  { id: "host", label: "호스트" },
  { id: "course", label: "코스" },
  { id: "gallery", label: "사진" },
  { id: "review", label: "리뷰" },
  { id: "booking-info", label: "예약" },
];

const defaultFaqs: LocalExperienceFaqItem[] = [
  {
    question: "예약은 어떻게 확정되나요?",
    answer: "예약 요청 후 호스트 확인을 거쳐 확정 안내를 드립니다. 즉시확정 회차는 요청과 동시에 확정됩니다.",
  },
  {
    question: "우천 시 어떻게 되나요?",
    answer: "안전하게 진행하기 어려운 날씨에는 일정 변경 또는 환불 기준에 맞춰 안내드립니다.",
  },
];

export async function generateStaticParams() {
  const experiences = await getExperiences();
  return experiences.map((experience) => ({ slug: experience.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const experience = await getExperience(slug);

  if (!experience) return {};

  return {
    title: experience.title,
    description: experience.summary,
    openGraph: {
      title: experience.title,
      description: experience.summary,
      images: [experience.image],
      type: "website",
    },
  };
}

export default async function LocalExperienceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const experience = await getExperience(slug);
  if (!experience) notFound();

  const [experiences, managedDetail, reviews, gallery] = await Promise.all([
    getExperiences(),
    getExperienceDetail(slug),
    getProductReviews(slug),
    getProductGallery(slug),
  ]);

  const detail = resolveDetail(experience, managedDetail);
  const galleryImages = buildGalleryImages(
    experience.image,
    gallery.map((image) => image.imageUrl),
  );
  // 관리자가 적은 사진 설명. 있으면 "현장 사진"의 제목·대체 텍스트로 쓴다.
  const galleryAlts = new Map(gallery.filter((image) => image.alt).map((image) => [image.imageUrl, image.alt as string]));
  const related = experiences.filter((item) => item.slug !== experience.slug).slice(0, 6);
  const hasReviews = experience.reviewCount > 0;
  const priceLabel = experience.price > 0 ? formatWon(experience.price) : "가격 문의";
  const ratingLabel = hasReviews ? `${experience.rating.toFixed(1)} · 후기 ${experience.reviewCount}` : "신규 체험";
  const groupChip = detail.groupLabel?.split(" · ")[0];
  const tabs = tabItems.filter((item) => item.id !== "course" || detail.courseSteps.length > 0);
  const mapUrl = `https://map.kakao.com/link/search/${encodeURIComponent(experience.place.address)}`;
  const detailUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://eataround.co.kr"}${userRoutes.experiences}/${experience.slug}`;
  const experienceCards = buildExperienceCards(experience.highlights, galleryImages);
  const fieldPhotoItems = buildFieldPhotoItems(experience.title, galleryImages, galleryAlts);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: experience.title,
    description: experience.summary,
    image: galleryImages,
    brand: { "@type": "Brand", name: "이더라운드" },
    ...(hasReviews
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: experience.rating,
            reviewCount: experience.reviewCount,
          },
        }
      : {}),
    offers: {
      "@type": "Offer",
      priceCurrency: "KRW",
      price: experience.price,
      availability: "https://schema.org/InStock",
      url: detailUrl,
    },
  };

  return (
    <section className="local-experience-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />

      <header className="local-experience-hero">
        <img src={galleryImages[0]} alt={experience.title} />
        {experience.badge ? (
          <div className="local-experience-hero-badges" aria-label="상품 배지">
            <Badge tone="primary">{experience.badge}</Badge>
          </div>
        ) : null}
        <div className="local-experience-hero-copy">
          <span className="local-experience-hero-label">{experience.eyebrow}</span>
          <h1>{experience.title}</h1>
        </div>
      </header>

      <section className="local-experience-price-card" aria-label="상품 핵심 정보">
        <div className="local-experience-price-row">
          <strong>{priceLabel}</strong>
          <span>{ratingLabel}</span>
        </div>
        <div className="local-experience-chip-row">
          <Badge>{experience.region}</Badge>
          <Badge>{experience.duration}</Badge>
          <Badge>{experience.place.name}</Badge>
          {groupChip ? <Badge>{groupChip}</Badge> : null}
        </div>
      </section>

      <div className="local-experience-desktop-layout">
        <div className="local-experience-desktop-main">
          <section className="local-experience-intro" id="intro">
            <span>소개</span>
            <p>
              {experience.summary}
              <a href="#points">더보기</a>
            </p>
          </section>

          <LocalExperienceTabs items={tabs} />

          <main className="local-experience-flow">
            <section className="local-experience-section local-experience-points" id="points">
              {detail.kicker ? <span className="eyebrow local-experience-kicker">{detail.kicker}</span> : null}
              <h2>이 체험의 포인트 {detail.points.length}가지</h2>
              <div className="local-experience-point-list">
                {detail.points.map((point, index) => (
                  <article className="local-experience-point" key={point.title}>
                    <span className="local-experience-number">{index + 1}</span>
                    <div>
                      <h3>{point.title}</h3>
                      {point.description ? <p>{point.description}</p> : null}
                      <img src={galleryImages[(index + 1) % galleryImages.length]} alt={`${point.title} 사진`} loading="lazy" />
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="local-experience-section local-experience-snapshots" aria-label="이런 걸 경험해요">
              <h2>이런 걸 경험해요</h2>
              <LocalExperienceCardCarousel ariaLabel="이런 걸 경험해요 사진 슬라이드" items={experienceCards} />
            </section>

            <section className="local-experience-section local-experience-host" id="host">
              <h2>호스트 소개</h2>
              <article className="local-experience-host-card">
                <div className="local-experience-host-avatar" aria-hidden="true">
                  <RiUserStarLine size={24} />
                </div>
                <div>
                  <h3>{experience.host.name}</h3>
                  <span>로컬 호스트</span>
                  <strong>{ratingLabel}</strong>
                </div>
              </article>
              <blockquote>"{experience.host.description}"</blockquote>
            </section>

            {detail.courseSteps.length ? (
              <section className="local-experience-section local-experience-course" id="course">
                <div className="local-experience-section-head local-experience-course-head">
                  <div>
                    <span>코스</span>
                    <h2>코스 소개</h2>
                    <p>{detail.courseIntro ?? experience.description}</p>
                  </div>
                </div>
                <div className="local-experience-course-summary" aria-label="코스 요약">
                  <Badge tone="primary">총 {experience.duration}</Badge>
                  <Badge tone="info">{detail.courseSteps.length}개 코스</Badge>
                  <Badge tone="booking">{reservationLabel(experience)}</Badge>
                </div>
                <div className="local-experience-course-list">
                  {detail.courseSteps.map((step, index) => (
                    <article className="local-experience-course-item" key={`${index}-${step.title}`}>
                      <div className="local-experience-course-marker" aria-hidden="true">
                        <span className="local-experience-number">{index + 1}</span>
                        <i />
                      </div>
                      <div className="local-experience-course-copy">
                        {step.duration ? <small>{step.duration}</small> : null}
                        <h3>{step.title}</h3>
                        {step.description ? <p>{step.description}</p> : null}
                        {step.note ? <strong>{step.note}</strong> : null}
                      </div>
                      <img src={galleryImages[(index + 2) % galleryImages.length]} alt={`${step.title} 코스 사진`} loading="lazy" />
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="local-experience-section local-experience-gallery" id="gallery">
              <span>사진</span>
              <h2>현장 사진을 보여드릴게요</h2>
              <LocalExperiencePhotoGrid ariaLabel="현장 사진 슬라이드" items={fieldPhotoItems} />
            </section>

            <section className="local-experience-section local-experience-review" id="review">
              <span>리뷰</span>
              {hasReviews ? (
                <div className="local-experience-rating-line">
                  <strong>{experience.rating.toFixed(1)}</strong>
                  <span>후기 {experience.reviewCount}개</span>
                </div>
              ) : null}
              {reviews.length ? (
                reviews.slice(0, 3).map((review, index) => (
                  <article className="local-experience-review-card" key={`${index}-${review.name}`}>
                    <strong>
                      <RiStarFill size={16} aria-hidden />
                      {review.rating.toFixed(1)} · {maskName(review.name)}
                    </strong>
                    <p>{review.text}</p>
                  </article>
                ))
              ) : (
                <article className="local-experience-review-card">
                  <p>아직 등록된 후기가 없습니다. 첫 후기를 남겨 주세요.</p>
                </article>
              )}
            </section>

            <section className="local-experience-section local-experience-booking-info" id="booking-info">
              <div className="local-experience-booking-head">
                <Badge tone="booking">예약 정보 한눈에</Badge>
              </div>
              <dl className="local-experience-info-list">
                <div>
                  <dt>진행일정</dt>
                  <dd>{scheduleSummary(experience)}</dd>
                </div>
                <div>
                  <dt>소요시간</dt>
                  <dd>{experience.duration}</dd>
                </div>
                <div>
                  <dt>만나는 장소</dt>
                  <dd>{experience.place.name}</dd>
                </div>
                <div>
                  <dt>인원·연령</dt>
                  <dd>{detail.groupLabel ?? "예약 시 안내"}</dd>
                </div>
                <div>
                  <dt>예약마감</dt>
                  <dd>{detail.bookingDeadline ?? "예약 확정 시 안내"}</dd>
                </div>
              </dl>
              <a className="local-experience-map" href={mapUrl} target="_blank" rel="noreferrer">
                <RiMapPin2Line size={22} aria-hidden />
                <strong>
                  지도에서 보기 <RiExternalLinkLine size={14} aria-hidden />
                </strong>
                <span>{experience.place.address}</span>
              </a>
            </section>

            <section className="local-experience-section local-experience-refund" id="refund">
              <h2>취소 · 환불</h2>
              <div className="local-experience-refund-line">
                {refundSteps.map((step) => (
                  <span data-tone={step.tone} key={step.label}>
                    <i />
                    <strong>{step.label}</strong>
                    <small>{step.value}</small>
                  </span>
                ))}
              </div>
            </section>

            <section className="local-experience-section local-experience-faq" id="faq">
              <h2>안내사항 · FAQ</h2>
              <LocalExperienceFaq items={detail.faqs} />
            </section>

            <section className="local-experience-planet" aria-label="환경 기여 안내">
              <RiLeafLine size={22} aria-hidden />
              <strong>1% For Planet</strong>
              <span>결제 금액의 1%는 환경을 위해 쓰여요</span>
            </section>
          </main>
        </div>

        <aside className="local-experience-booking-side" aria-label="예약 선택">
          <BookingPanel experience={experience} variant="compact" />
        </aside>
      </div>

      {related.length ? (
        <section className="local-experience-section local-experience-related" id="related">
          <h2>비슷한 경험</h2>
          <DetailRelatedExperiences desktopSlidesPerView={6} items={related} />
        </section>
      ) : null}

      <DetailOptionSelector experience={experience} />
    </section>
  );
}

/** 대표 이미지를 맨 앞에 두고, 등록된 갤러리 사진이 있으면 그것을, 없으면 공용 샘플 사진을 잇는다. */
function buildGalleryImages(primaryImage: string, gallery: string[]) {
  return [primaryImage, ...(gallery.length ? gallery : fallbackGalleryImages)]
    .filter((image, index, images) => Boolean(image) && images.indexOf(image) === index)
    .slice(0, gallery.length ? 13 : 5);
}

/** 등록된 상세 콘텐츠가 없으면 상품 기본 정보로 채운다. */
function resolveDetail(experience: Experience, managed: ExperienceDetail | null): ExperienceDetail {
  const points = managed?.points.length
    ? managed.points
    : experience.highlights.slice(0, 3).map((title) => ({ title, description: "" }));
  const courseSteps = managed?.courseSteps.length
    ? managed.courseSteps
    : (experience.scheduleSteps ?? []).map((step) => ({ duration: step.time, title: step.title, description: "" }));

  return {
    kicker: managed?.kicker,
    groupLabel: managed?.groupLabel,
    bookingDeadline: managed?.bookingDeadline,
    courseIntro: managed?.courseIntro,
    points,
    courseSteps,
    faqs: managed?.faqs.length ? managed.faqs : defaultFaqs,
  };
}

function reservationLabel(experience: Experience) {
  const first = experience.schedules[0];
  if (first?.reservationType === "inquiry") return "문의 예약";
  if (first?.reservationType === "instant" && !first.approvalRequired) return "즉시확정";
  return "승인 후 확정";
}

function scheduleSummary(experience: Experience) {
  const dates = [...new Set(experience.schedules.map((schedule) => schedule.date))];
  if (!dates.length) return "일정 문의";
  const labels = dates.slice(0, 4).map((date) => {
    const match = /^\d{4}-(\d{2})-(\d{2})$/.exec(date);
    return match ? `${Number(match[1])}/${Number(match[2])}` : date;
  });
  return dates.length > 4 ? `${labels.join(", ")} 외 ${dates.length - 4}회` : labels.join(", ");
}

function maskName(name: string) {
  return name.length > 1 ? `${name[0]}${"*".repeat(Math.min(name.length - 1, 2))}` : name;
}

function buildExperienceCards(highlights: string[], images: string[]): LocalExperienceMediaItem[] {
  return highlights.slice(0, 4).map((title, index) => ({
    title,
    image: images[(index + 1) % images.length] ?? images[0],
  }));
}

function buildFieldPhotoItems(title: string, images: string[], alts: Map<string, string>): LocalExperienceMediaItem[] {
  return images.slice(0, 4).map((image, index) => ({
    image,
    title: alts.get(image) ?? `${title} 현장 사진 ${index + 1}`,
  }));
}
