"use client";

import { useState } from "react";
import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react";
import type { Swiper as SwiperInstance } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";

type DetailHeroSliderProps = {
  images: string[];
  title: string;
};

export function DetailHeroSlider({ images, title }: DetailHeroSliderProps) {
  const [swiper, setSwiper] = useState<SwiperInstance | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const slides = images.filter(Boolean);

  if (!slides.length) return null;

  return (
    <section className="detail-hero-slider" aria-label={`${title} 이미지`} data-aos="fade-up">
      <div className="detail-hero-stage">
        <Swiper
          className="detail-hero-swiper"
          onSlideChange={(instance) => setActiveIndex(instance.activeIndex)}
          onSwiper={setSwiper}
          slidesPerView={1}
          spaceBetween={0}
          speed={420}
        >
          {slides.map((image, index) => (
            <SwiperSlide key={`${image}-${index}`}>
              <img src={image} alt={`${title} 이미지 ${index + 1}`} />
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="detail-hero-count">
          {activeIndex + 1} / {slides.length}
        </div>

        <div className="detail-hero-controls" aria-label="상세 이미지 슬라이드 제어">
          <button aria-label="이전 이미지" onClick={() => swiper?.slidePrev()} type="button">
            <RiArrowLeftSLine size={26} />
          </button>
          <button aria-label="다음 이미지" onClick={() => swiper?.slideNext()} type="button">
            <RiArrowRightSLine size={26} />
          </button>
        </div>
      </div>

      <div className="detail-hero-thumbs" aria-label="상세 이미지 썸네일">
        {slides.map((image, index) => (
          <button
            aria-label={`${index + 1}번 이미지 보기`}
            data-active={activeIndex === index}
            key={`${image}-thumb-${index}`}
            onClick={() => swiper?.slideTo(index)}
            type="button"
          >
            <img src={image} alt={`${title} 썸네일 ${index + 1}`} loading="lazy" />
          </button>
        ))}
      </div>
    </section>
  );
}
