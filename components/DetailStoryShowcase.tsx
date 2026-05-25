"use client";

import type { CSSProperties } from "react";
import { RiArrowRightLine, RiLeafLine, RiMapPin2Line, RiSparkling2Line, RiTimeLine } from "@remixicon/react";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

type DetailStoryShowcaseProps = {
  category: string;
  duration: string;
  highlights: string[];
  image: string;
  recommendedFor: string[];
  region: string;
  summary: string;
  tags: string[];
  title: string;
};

export function DetailStoryShowcase({
  category,
  duration,
  highlights,
  image,
  recommendedFor,
  region,
  summary,
  tags,
  title,
}: DetailStoryShowcaseProps) {
  const slides = [
    ...highlights.slice(0, 4).map((item, index) => ({
      eyebrow: `Point ${String(index + 1).padStart(2, "0")}`,
      title: item,
      body: "호스트가 준비한 흐름에 맞춰 현장에서 바로 경험할 수 있어요.",
    })),
    ...recommendedFor.slice(0, 2).map((item, index) => ({
      eyebrow: `For ${String(index + 1).padStart(2, "0")}`,
      title: item,
      body: "일정과 인원에 맞게 예약 옵션을 확인해 주세요.",
    })),
  ];

  const style = {
    "--detail-splash-image": `url("${image}")`,
  } as CSSProperties;

  return (
    <section className="detail-story-showcase" data-aos="fade-up" style={style}>
      <div className="detail-story-showcase-inner">
        <div className="detail-story-copy" data-aos="fade-up" data-aos-delay="80">
          <span className="detail-story-label">
            <RiSparkling2Line size={16} />
            Local Experience
          </span>
          <h2>{title}</h2>
          <p>{summary}</p>
          <div className="detail-story-tags" aria-label="체험 태그">
            {tags.slice(0, 4).map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        </div>

        <div className="detail-story-panel" data-aos="fade-left" data-aos-delay="140">
          <div className="detail-story-meta" aria-label="체험 핵심 정보">
            <span>
              <RiMapPin2Line size={17} />
              {region}
            </span>
            <span>
              <RiTimeLine size={17} />
              {duration}
            </span>
            <span>
              <RiLeafLine size={17} />
              {category}
            </span>
          </div>

          <Swiper
            className="detail-story-swiper"
            grabCursor
            modules={[Pagination]}
            pagination={{ clickable: true }}
            slidesPerView={1.5}
            spaceBetween={16}
            breakpoints={{
              720: { slidesPerView: 2.35, spaceBetween: 16 },
              1040: { slidesPerView: 3.5, spaceBetween: 16 },
            }}
          >
            {slides.map((slide) => (
              <SwiperSlide key={`${slide.eyebrow}-${slide.title}`}>
                <article className="detail-story-slide">
                  <small>{slide.eyebrow}</small>
                  <strong>{slide.title}</strong>
                  <span>{slide.body}</span> 
                </article>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
