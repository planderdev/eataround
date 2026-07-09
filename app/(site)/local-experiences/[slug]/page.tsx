import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RiLeafLine, RiMapPin2Line, RiStarFill, RiUserStarLine } from "@remixicon/react";
import { Badge } from "@/components/Badge";
import { BookingPanel } from "@/components/BookingPanel";
import { DetailRelatedExperiences } from "@/components/DetailRelatedExperiences";
import { DetailOptionSelector } from "@/components/DetailOptionSelector";
import {
  LocalExperienceCardCarousel,
  LocalExperienceFaq,
  LocalExperiencePhotoGrid,
  LocalExperienceReviewPhotos,
  LocalExperienceTabs,
  type LocalExperienceFaqItem,
  type LocalExperienceMediaItem,
  type LocalExperienceTabItem,
} from "@/components/LocalExperienceDetailClient";
import { getExperience, getExperiences } from "@/lib/content";
import type { Experience } from "@/lib/data";
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

const pointItems = [
  {
    title: "필름으로 담는 마을의 진짜 일상",
    description: "호스트가 40년 산 골목의 가장 예쁜 자리를 안내해요.",
  },
  {
    title: "카메라부터 현상까지 다 포함",
    description: "준비물 없이 몸만 오면 돼요.",
  },
  {
    title: "소수 정예로 여유롭게",
    description: "10~15명 소그룹 코칭.",
  },
];

const courseSteps = [
  {
    time: "1",
    duration: "20분",
    title: "대포마을 회관 - 시작과 끝",
    description: "호스트와 만나 필름카메라 사용법을 익히고, 오늘 담을 마을의 장면을 미리 살펴봐요.",
    note: "오리엔테이션 · 카메라 체크",
  },
  {
    time: "2",
    duration: "120분",
    title: "자유산책 - 바다 둘레길",
    description: "골목과 바다 둘레길을 천천히 걸으며 빛이 좋은 자리에서 촬영 코칭을 받아요.",
    note: "마을 산책 · 필름 촬영",
  },
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
  { id: "gallery", label: "옵션" },
  { id: "review", label: "리뷰" },
  { id: "booking-info", label: "예약" },
];

const faqItems: LocalExperienceFaqItem[] = [
  {
    question: "준비물이 있나요?",
    answer: "필름카메라와 필름은 현장에서 준비돼요. 편한 신발과 가벼운 짐만 챙겨 오시면 됩니다.",
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

  const displayExperience = buildDisplayExperience(experience);

  return {
    title: displayExperience.title,
    description: displayExperience.summary,
    openGraph: {
      title: displayExperience.title,
      description: displayExperience.summary,
      images: [displayExperience.image],
      type: "website",
    },
  };
}

export default async function LocalExperienceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const sourceExperience = await getExperience(slug);
  if (!sourceExperience) notFound();

  const [experiences] = await Promise.all([getExperiences()]);

  const experience = buildDisplayExperience(sourceExperience);
  const galleryImages = buildGalleryImages(sourceExperience.image);
  const related = experiences.filter((item) => item.slug !== sourceExperience.slug).slice(0, 6);
  const groupLabel = "10~15명";
  const fieldPhotoCount = 18;
  const reviewPhotoCount = 64;
  const thisMonthGuests = 32;
  const detailUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://eataround.co.kr"}${userRoutes.experiences}/${experience.slug}`;
  const experienceCards = buildExperienceCards(galleryImages);
  const fieldPhotoItems = buildFieldPhotoItems(galleryImages);
  const reviewPhotoItems = buildReviewPhotoItems(galleryImages);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: experience.title,
    description: experience.summary,
    image: galleryImages,
    brand: { "@type": "Brand", name: "이더라운드" },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: experience.rating,
      reviewCount: experience.reviewCount,
    },
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
        <div className="local-experience-hero-badges" aria-label="상품 배지">
          <Badge tone="primary">NEW</Badge>
          <Badge tone="warning">ONLY</Badge>
        </div>
        <div className="local-experience-hero-copy">
          <span className="local-experience-hero-label">사진집 · 대표</span>
          <h1>{experience.title}</h1>
        </div>
      </header>

      <section className="local-experience-price-card" aria-label="상품 핵심 정보">
        <div className="local-experience-price-row">
          <strong>{formatWon(experience.price)}</strong>
          <span>
            {experience.rating.toFixed(1)} · 후기 {experience.reviewCount} · 이번 달 {thisMonthGuests}명
          </span>
        </div>
        <div className="local-experience-chip-row">
          <Badge>매월 상이</Badge>
          <Badge>{experience.duration}</Badge>
          <Badge>{experience.place.name.replace("회관", "")}</Badge>
          <Badge>{groupLabel}</Badge>
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

          <LocalExperienceTabs items={tabItems} />

          <main className="local-experience-flow">
            <section className="local-experience-section local-experience-points" id="points">
              <span className="eyebrow local-experience-kicker">이더라운드 에디터 픽 · 관광지 아닌 진짜 마을의 하루</span>
              <h2>이 체험의 포인트 3가지</h2>
              <div className="local-experience-point-list">
                {pointItems.map((point, index) => (
                  <article className="local-experience-point" key={point.title}>
                    <span className="local-experience-number">{index + 1}</span>
                    <div>
                      <h3>{point.title}</h3>
                      <p>{point.description}</p>
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
                  <span>로컬 호스트 · 마을 토박이</span>
                  <strong>{experience.rating.toFixed(1)} · 진행 47회</strong>
                </div>
              </article>
              <blockquote>"{experience.host.description}"</blockquote>
              <a className="secondary-button local-experience-wide-button" href="#booking-info">
                호스트 인터뷰 더보기
              </a>
            </section>

            <section className="local-experience-section local-experience-course" id="course">
              <div className="local-experience-section-head local-experience-course-head">
                <div>
                  <span>코스</span>
                  <h2>코스 소개</h2>
                  <p>대포마을 회관에서 시작해 바다 둘레길까지, 호스트가 아끼는 동선을 따라 천천히 걷습니다.</p>
                </div>
                <div className="segmented local-experience-segmented" aria-label="코스 보기 방식">
                  <button data-active="true" type="button">
                    사진형
                  </button>
                  <button type="button">시간표</button>
                </div>
              </div>
              <div className="local-experience-course-summary" aria-label="코스 요약">
                <Badge tone="primary">총 3시간</Badge>
                <Badge tone="info">도보 이동</Badge>
                <Badge tone="booking">소수 정예</Badge>
              </div>
              <div className="local-experience-course-list">
                {courseSteps.map((step, index) => (
                  <article className="local-experience-course-item" key={step.title}>
                    <div className="local-experience-course-marker" aria-hidden="true">
                      <span className="local-experience-number">{step.time}</span>
                      <i />
                    </div>
                    <div className="local-experience-course-copy">
                      <small>{step.duration}</small>
                      <h3>{step.title}</h3>
                      <p>{step.description}</p>
                      <strong>{step.note}</strong>
                    </div>
                    <img src={galleryImages[(index + 2) % galleryImages.length]} alt={`${step.title} 코스 사진`} loading="lazy" />
                  </article>
                ))}
              </div>
              <a className="secondary-button local-experience-wide-button" href="#booking-info">
                코스 전체 보기
              </a>
            </section>

            <section className="local-experience-section local-experience-gallery" id="gallery">
              <span>옵션 · 결과물</span>
              <h2>총 {fieldPhotoCount}컷, 현장 사진을 보여드릴게요</h2>
              <LocalExperiencePhotoGrid ariaLabel="현장 사진 슬라이드" items={fieldPhotoItems} />
              <a className="secondary-button local-experience-wide-button" href="#review">
                모든 작품 {fieldPhotoCount}개 보기
              </a>
            </section>

            <section className="local-experience-section local-experience-review" id="review">
              <span>리뷰 · 결정 직전 신뢰</span>
              <div className="local-experience-rating-line">
                <strong>{experience.rating.toFixed(1)}</strong>
                <span>
                  후기 {experience.reviewCount}개 · 사진후기 {reviewPhotoCount}
                </span>
              </div>
              <LocalExperienceReviewPhotos ariaLabel="리뷰 사진 슬라이드" items={reviewPhotoItems} />
              <article className="local-experience-review-card">
                <strong>
                  <RiStarFill size={16} aria-hidden />
                  5.0 · 지**
                </strong>
                <p>호스트 코칭 덕분에 인생샷 건졌어요. 강력 추천!</p>
              </article>
              <a className="secondary-button local-experience-wide-button" href="#review">
                후기 {experience.reviewCount}개 모두 보기
              </a>
            </section>

            <section className="local-experience-section local-experience-booking-info" id="booking-info">
              <div className="local-experience-booking-head">
                <Badge tone="booking">예약 정보 한눈에</Badge>
                <small>결제 직전 시트 = 동일</small>
              </div>
              <dl className="local-experience-info-list">
                <div>
                  <dt>진행일정</dt>
                  <dd>5/25, 6/8, 6/22 (토)</dd>
                </div>
                <div>
                  <dt>소요시간</dt>
                  <dd>약 {experience.duration}</dd>
                </div>
                <div>
                  <dt>만나는 장소</dt>
                  <dd>{experience.place.name}</dd>
                </div>
                <div>
                  <dt>인원·연령</dt>
                  <dd>{groupLabel} · 성인</dd>
                </div>
                <div>
                  <dt>예약마감</dt>
                  <dd>3일 전 오전</dd>
                </div>
              </dl>
              <div className="local-experience-map" aria-label="지도 위치">
                <RiMapPin2Line size={22} aria-hidden />
                <strong>지도 (탭하면 확대)</strong>
                <span>{experience.place.address}</span>
              </div>
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
              <LocalExperienceFaq items={faqItems} />
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

function buildGalleryImages(primaryImage: string) {
  return [primaryImage, ...fallbackGalleryImages]
    .filter((image, index, images) => Boolean(image) && images.indexOf(image) === index)
    .slice(0, 5);
}

function buildDisplayExperience(experience: Experience): Experience {
  return {
    ...experience,
    title: "필름카메라로 담는 대포마을의 하루",
    eyebrow: "사진집 · 대표",
    region: "대포마을",
    category: "사진집",
    price: 60000,
    originalPrice: undefined,
    duration: "3시간",
    rating: 4.9,
    reviewCount: 128,
    badge: "ONLY",
    tags: ["매월 상이", "대포마을", "소규모"],
    summary: "대포마을의 푸른 바다와 빛바랜 골목을 산책하듯 필름에 담는 아날로그 여행입니다.",
    description: "호스트가 오래 살며 아끼는 골목과 바다 둘레길을 따라 걷고, 필름카메라로 오늘의 장면을 기록합니다.",
    highlights: pointItems.map((point) => point.title),
    included: ["필름카메라 대여", "필름 1롤", "현장 코칭"],
    notices: ["예약마감은 3일 전 오전입니다.", "편한 신발을 권장합니다."],
    host: {
      name: "대포마을 영자 님",
      description: "40년 산 골목을 가장 예쁘게 담는 자리를 알려드려요.",
    },
    place: {
      name: "대포마을회관",
      address: "제주특별자치도 서귀포시 대포동",
    },
    schedules: [
      {
        date: "2026-05-25",
        label: "오전 10:00",
        capacity: 15,
        booked: 5,
        price: 60000,
        maxTeams: 3,
        reservedTeams: 1,
        teamCapacity: 5,
        reservationType: "approval",
        approvalRequired: true,
      },
      {
        date: "2026-06-08",
        label: "오전 10:00",
        capacity: 15,
        booked: 7,
        price: 60000,
        maxTeams: 3,
        reservedTeams: 1,
        teamCapacity: 5,
        reservationType: "approval",
        approvalRequired: true,
      },
      {
        date: "2026-06-22",
        label: "오전 10:00",
        capacity: 15,
        booked: 8,
        price: 60000,
        maxTeams: 3,
        reservedTeams: 1,
        teamCapacity: 5,
        reservationType: "approval",
        approvalRequired: true,
      },
    ],
  };
}

function buildExperienceCards(images: string[]): LocalExperienceMediaItem[] {
  return [
    {
      title: "골목 산책 컷",
      description: "빛바랜 골목을 천천히 걸으며 마을의 결을 담아요.",
      image: images[1] ?? images[0],
    },
    {
      title: "바다 둘레길 컷",
      description: "대포마을의 바다 앞에서 필름으로 장면을 남겨요.",
      image: images[2] ?? images[0],
    },
    {
      title: "현장 분위기",
      description: "소수 정예로 코칭받으며 여유롭게 촬영해요.",
      image: images[3] ?? images[0],
    },
  ];
}

function buildFieldPhotoItems(images: string[]): LocalExperienceMediaItem[] {
  return images.slice(0, 4).map((image, index) => ({
    image,
    title: `작품 ${index + 1}`,
  }));
}

function buildReviewPhotoItems(images: string[]): LocalExperienceMediaItem[] {
  return images.slice(0, 3).map((image) => ({
    image,
    title: "사진후기",
  }));
}
