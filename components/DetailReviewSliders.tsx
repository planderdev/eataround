"use client";

import { RiArrowRightLine, RiStarFill } from "@remixicon/react";
import type { ExperienceReview } from "@/lib/data";
import { Swiper, SwiperSlide } from "swiper/react";

type DetailReviewSlidersProps = {
  images: string[];
  rating: number;
  reviewCount: number;
  reviews: ExperienceReview[];
};

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
    text: "아이들과 함께 참여하기에도 편했고 음식과 장소 설명이 세심했습니다. 새로운 지역을 자연스럽게 만날 수 있었습니다.",
  },
  {
    name: "Jihye",
    rating: 4,
    text: "예약부터 현장 안내까지 매끄러웠고, 체험 후에도 오래 기억에 남는 시간이었습니다.",
  },
];

export function DetailReviewSliders({ images, rating, reviewCount, reviews }: DetailReviewSlidersProps) {
  const primaryReviews = normalizeReviews(reviews, images);
  const serviceReviews = normalizeReviews(otherServiceReviews, images.slice().reverse());

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
  return (
    <Swiper
      className="detail-review-swiper"
      slidesPerView={1.08}
      spaceBetween={8}
      breakpoints={{
        560: { slidesPerView: 1.6, spaceBetween: 8 },
        860: { slidesPerView: 2.2, spaceBetween: 8 },
        1120: { slidesPerView: 2.55, spaceBetween: 8 },
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
              <span className="detail-review-thumb">
                <img src={review.image} alt={`${review.name} 후기 이미지`} loading="lazy" />
                <b>{review.photoCount}</b>
              </span>
            </div>
            <strong>{review.name}</strong>
          </article>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

type NormalizedReview = ExperienceReview & {
  dateLabel: string;
  image: string;
  photoCount: number;
};

function normalizeReviews(reviews: ExperienceReview[], images: string[]): NormalizedReview[] {
  const fallbackImage = images[0] ?? "https://cdn.imweb.me/thumbnail/20230831/5089900ac1a12.jpg";
  const fallbackReviews =
    reviews.length > 2
      ? reviews
      : [
          ...reviews,
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
        ];

  return fallbackReviews.slice(0, 6).map((review, index) => ({
    ...review,
    dateLabel: index === 0 ? "6달 전" : index === 1 ? "10달 전" : index === 2 ? "11달 전" : "1달 전",
    image: images[index % Math.max(images.length, 1)] ?? fallbackImage,
    photoCount: index % 2 === 0 ? 4 : 3,
  }));
}
