"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { RiArrowLeftSLine, RiArrowRightLine, RiArrowRightSLine, RiCloseLine, RiStarFill } from "@remixicon/react";
import type { Swiper as SwiperInstance } from "swiper";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { ExperienceReview } from "@/lib/data";

type DetailReviewSlidersProps = {
  images: string[];
  rating: number;
  reviewCount: number;
  reviews: ExperienceReview[];
};

const defaultProductReviews: ExperienceReview[] = [
  {
    name: "오민지",
    rating: 5,
    text: "제주 바다를 식탁 위에서 만나는 경험이었어요. 재료 이야기를 들으며 먹으니 여행이 더 오래 기억에 남았습니다.",
  },
  {
    name: "조정",
    rating: 5,
    text: "직원분이 너무 친절하고 체험 거리가 많아 즐거웠어요. 위치도 찾기 쉬워서 다음에도 이용하고 싶습니다.",
  },
  {
    name: "임택",
    rating: 5,
    text: "전문적이고 친절했습니다. 예약 과정도 편했고 현장에서 추억을 많이 남길 수 있었습니다.",
  },
  {
    name: "김하나",
    rating: 5,
    text: "소규모로 진행돼서 질문하기 편했고, 호스트 설명이 깊어서 제주의 로컬 문화를 더 잘 이해할 수 있었습니다.",
  },
  {
    name: "박서연",
    rating: 4,
    text: "일정이 여유롭고 동선이 깔끔했습니다. 부모님과 함께해도 부담 없는 프로그램이라 만족스러웠어요.",
  },
  {
    name: "한지우",
    rating: 5,
    text: "사진으로만 보던 제주 식재료를 직접 만져보고 배울 수 있어 좋았습니다. 마지막 식사까지 알찬 구성이었습니다.",
  },
];

const otherServiceReviews: ExperienceReview[] = [
  {
    name: "William Andreo",
    rating: 5,
    text: "매우 흥미로운 투어였으며 가이드가 친절하고 전문적이었습니다. 단순히 먹기만 하는 투어가 아니라 현지 이야기를 들을 수 있어 좋았습니다.",
  },
  {
    name: "Sabrina",
    rating: 5,
    text: "투어가 정말 좋았고 추천합니다. 일부 구간에서는 조금 빠르게 이동했지만 전체적으로 만족스러운 일정이었습니다.",
  },
  {
    name: "Maxime",
    rating: 5,
    text: "아이들과 함께 참여하기에도 편했고 음식과 장소 설명이 좋았습니다. 새로운 지역을 자연스럽게 만날 수 있었습니다.",
  },
  {
    name: "Jihye",
    rating: 4,
    text: "예약부터 현장 안내까지 매끄러웠고 체험 후에도 오래 기억에 남는 시간이었습니다.",
  },
  {
    name: "Daniel",
    rating: 5,
    text: "현지 호스트가 안내해 주는 코스라 일반적인 여행 상품보다 훨씬 생생했습니다. 음식도 좋고 분위기도 좋았습니다.",
  },
  {
    name: "Mina",
    rating: 5,
    text: "짧은 시간이었지만 준비가 잘 되어 있었고, 동행한 친구들도 모두 만족했습니다. 다음 제주 여행 때도 이용하고 싶어요.",
  },
];

export function DetailReviewSliders({ images, rating, reviewCount, reviews }: DetailReviewSlidersProps) {
  const primaryReviews = normalizeReviews(reviews, images, defaultProductReviews);
  const serviceReviews = normalizeReviews(otherServiceReviews, images.slice().reverse(), otherServiceReviews);

  return (
    <div className="detail-review-area">
      <section className="detail-review-block">
        <div className="detail-review-heading">
          <h2>
            <RiStarFill size={20} />
            {rating.toFixed(1)} · 후기 {reviewCount.toLocaleString("ko-KR")}개
          </h2>
        </div>
        <ReviewSwiper reviews={primaryReviews} />
        <a className="detail-review-all-button" href="#review">
          후기 모두 보기
          <RiArrowRightLine size={17} />
        </a>
      </section>

      <section className="detail-review-block">
        <div className="detail-review-heading">
          <h2>다른 서비스의 이용 후기</h2>
        </div>
        <ReviewSwiper reviews={serviceReviews} />
      </section>
    </div>
  );
}

function ReviewSwiper({ reviews }: { reviews: NormalizedReview[] }) {
  const [isMounted, setIsMounted] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [lightboxSwiper, setLightboxSwiper] = useState<SwiperInstance | null>(null);
  const lightboxImages = useMemo(
    () =>
      reviews.map((review) => ({
        alt: `${review.name} 후기 사진`,
        image: review.image,
        name: review.name,
      })),
    [reviews],
  );
  const isLightboxOpen = lightboxIndex !== null;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isLightboxOpen) return;

    const originalOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") lightboxSwiper?.slidePrev();
      if (event.key === "ArrowRight") lightboxSwiper?.slideNext();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLightboxOpen, lightboxSwiper]);

  function closeLightbox() {
    setLightboxIndex(null);
    setLightboxSwiper(null);
  }

  const lightbox = isLightboxOpen ? (
    <div
      className="detail-review-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="후기 사진 슬라이드"
      onClick={(event) => {
        if (event.target === event.currentTarget) closeLightbox();
      }}
    >
      <button className="detail-review-lightbox-close" type="button" aria-label="후기 사진 닫기" onClick={closeLightbox}>
        <RiCloseLine size={24} />
      </button>
      <Swiper
        className="detail-review-lightbox-swiper"
        initialSlide={lightboxIndex ?? 0}
        modules={[Pagination]}
        onSwiper={setLightboxSwiper}
        pagination={{ clickable: true }}
        slidesPerView={1}
        spaceBetween={16}
      >
        {lightboxImages.map((item, index) => (
          <SwiperSlide key={`${item.image}-${index}`}>
            <figure className="detail-review-lightbox-slide">
              <img src={item.image} alt={item.alt} />
              <figcaption>{item.name}</figcaption>
            </figure>
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="detail-review-lightbox-controls" aria-label="후기 사진 슬라이드 제어">
        <button type="button" aria-label="이전 후기 사진" onClick={() => lightboxSwiper?.slidePrev()}>
          <RiArrowLeftSLine size={30} />
        </button>
        <button type="button" aria-label="다음 후기 사진" onClick={() => lightboxSwiper?.slideNext()}>
          <RiArrowRightSLine size={30} />
        </button>
      </div>
    </div>
  ) : null;

  return (
    <>
      <Swiper
        className="detail-review-swiper"
        slidesPerView={1.16}
        spaceBetween={8}
        breakpoints={{
          560: { slidesPerView: 1.85, spaceBetween: 8 },
          860: { slidesPerView: 3.2, spaceBetween: 8 },
          1120: { slidesPerView: 4.5, spaceBetween: 8 },
        }}
      >
        {reviews.map((review, index) => (
          <SwiperSlide key={`${review.name}-${index}`}>
            <article className="detail-review-card">
              <div className="detail-review-card-top">
                <span className="detail-review-stars" aria-label={`별점 ${review.rating}점`}>
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <RiStarFill data-muted={starIndex >= review.rating} key={starIndex} size={14} />
                  ))}
                </span>
                <small>{review.dateLabel}</small>
              </div>
              <div className="detail-review-card-body">
                <p>{review.text}</p>
                <button aria-label={`${review.name} 후기 사진 보기`} className="detail-review-thumb" onClick={() => setLightboxIndex(index)} type="button">
                  <img src={review.image} alt={`${review.name} 후기 이미지`} loading="lazy" />
                  <b>{review.photoCount}</b>
                </button>
              </div>
              <strong>{review.name}</strong>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>

      {isMounted && lightbox ? createPortal(lightbox, document.body) : null}
    </>
  );
}

type NormalizedReview = ExperienceReview & {
  dateLabel: string;
  image: string;
  photoCount: number;
};

function normalizeReviews(reviews: ExperienceReview[], images: string[], fallbackPool: ExperienceReview[]): NormalizedReview[] {
  const fallbackImage = images[0] ?? "https://cdn.imweb.me/thumbnail/20230831/5089900ac1a12.jpg";
  const sourceReviews = reviews.filter((review) => review.text.trim().length > 0);

  let fallbackIndex = 0;
  while (sourceReviews.length < 6) {
    sourceReviews.push(fallbackPool[fallbackIndex % fallbackPool.length]);
    fallbackIndex += 1;
  }

  return sourceReviews.slice(0, 6).map((review, index) => ({
    ...review,
    dateLabel: index === 0 ? "6달 전" : index === 1 ? "10달 전" : index === 2 ? "11달 전" : "1달 전",
    image: images[index % Math.max(images.length, 1)] ?? fallbackImage,
    photoCount: index % 2 === 0 ? 4 : 3,
  }));
}
