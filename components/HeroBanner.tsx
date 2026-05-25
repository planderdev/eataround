"use client";

import { useState } from "react";
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiPauseFill,
  RiPlayFill,
  RiSparkling2Line,
} from "@remixicon/react";
import { Autoplay, EffectFade } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";
import type { HeroSlide } from "@/lib/data";

export function HeroBanner({ slides }: { slides: HeroSlide[] }) {
  const [swiper, setSwiper] = useState<SwiperInstance | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const totalSlides = slides.length;

  if (!slides.length) return null;

  function goPrevious() {
    swiper?.slidePrev();
  }

  function goNext() {
    swiper?.slideNext();
  }

  function toggleAutoplay() {
    if (!swiper?.autoplay) return;

    if (isPaused) {
      swiper.autoplay.start();
      setIsPaused(false);
      return;
    }

    swiper.autoplay.stop();
    setIsPaused(true);
  }

  return (
    <section className="hero-shell" aria-labelledby="home-hero-title" data-aos="fade-up">
      <div className="hero-main">
        <Swiper
          autoplay={{ delay: 4200, disableOnInteraction: false }}
          className="hero-swiper"
          effect="fade"
          loop
          modules={[Autoplay, EffectFade]}
          onSlideChange={(instance) => setActiveIndex(instance.realIndex)}
          onSwiper={setSwiper}
          speed={850}
        >
          {slides.map((slide, index) => {
            const Heading = index === 0 ? "h1" : "h2";
            const headingProps = index === 0 ? { id: "home-hero-title" } : {};
            const isFirst = index === 0;

            return (
              <SwiperSlide key={slide.title}>
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="hero-image"
                  decoding={isFirst ? "sync" : "async"}
                  fetchPriority={isFirst ? "high" : "low"}
                  loading={isFirst ? "eager" : "lazy"}
                />
                <div className="hero-overlay" />
                <div className="hero-content">
                  <span className="hero-kicker">
                    <RiSparkling2Line size={16} />
                    {slide.eyebrow}
                  </span>
                  <Heading {...headingProps}>{slide.title}</Heading>
                  <p>{slide.description}</p>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>

        <div className="hero-nav" aria-label="히어로 슬라이드 제어">
          <div className="hero-nav-progress">
            <span>{activeIndex + 1}</span>
            <i>
              <b style={{ width: `${((activeIndex + 1) / totalSlides) * 100}%` }} />
            </i>
            <span>{totalSlides}</span>
            <button aria-label={isPaused ? "슬라이드 재생" : "슬라이드 일시정지"} onClick={toggleAutoplay} type="button">
              {isPaused ? <RiPlayFill size={15} /> : <RiPauseFill size={15} />}
            </button>
          </div>
          <div className="hero-nav-arrows">
            <button aria-label="이전 슬라이드" onClick={goPrevious} type="button">
              <RiArrowLeftSLine size={26} />
            </button>
            <button aria-label="다음 슬라이드" onClick={goNext} type="button">
              <RiArrowRightSLine size={26} />
            </button>
          </div>
        </div>
      </div>

    </section>
  );
}
