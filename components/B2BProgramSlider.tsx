"use client";

import Link from "next/link";
import { RiArrowRightLine } from "@remixicon/react";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

export type B2BProgramSlideItem = {
  description: string;
  duration: string;
  href: string;
  image: string;
  imageAlt: string;
  outcome: string;
  price: string;
  title: string;
  tone: string;
};

export function B2BProgramSlider({ items }: { items: B2BProgramSlideItem[] }) {
  if (!items.length) return null;

  return (
    <div className="b2b-program-slider-shell" data-aos="fade-up" data-aos-delay="120">
      <Swiper
        autoplay={{ delay: 4200, disableOnInteraction: false }}
        breakpoints={{
          760: { slidesPerView: 1.08, spaceBetween: 16 },
          1100: { slidesPerView: 1.18, spaceBetween: 24 },
        }}
        className="b2b-program-swiper"
        loop={items.length > 1}
        modules={[Autoplay, Pagination]}
        pagination={{ clickable: true }}
        slidesPerView={1}
        spaceBetween={16}
      >
        {items.map((item) => (
          <SwiperSlide key={item.href}>
            <Link className="b2b-program-slide" data-tone={item.tone} href={item.href}>
              <img alt={item.imageAlt} src={item.image} loading="lazy" decoding="async" />
              <span className="b2b-program-slide-overlay" />
              <span className="b2b-program-slide-copy">
                <small>{item.outcome}</small>
                <strong>{item.title}</strong>
                <span>{item.description}</span>
              </span>
              <span className="b2b-program-slide-meta">
                <b>{item.duration}</b>
                <em>{item.price}</em>
                <i>
                  상세보기
                  <RiArrowRightLine size={18} />
                </i>
              </span>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
