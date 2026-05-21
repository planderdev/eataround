"use client";

import Link from "next/link";
import { RiArrowRightSLine } from "@remixicon/react";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

export type MobileSwipeItem = {
  href: string;
  image: string;
  eyebrow?: string;
  title: string;
  description?: string;
};

type MobileSwipeCarouselProps = {
  items: MobileSwipeItem[];
  ctaHref: string;
  ctaLabel: string;
  variant?: "mobile" | "responsive";
  showDots?: boolean;
};

export function MobileSwipeCarousel({ items, ctaHref, ctaLabel, variant = "mobile", showDots = false }: MobileSwipeCarouselProps) {
  if (!items.length) return null;

  const isResponsive = variant === "responsive";
  const carouselClassName = [
    "mobile-swipe-carousel",
    isResponsive ? "responsive-swipe-carousel" : "",
    showDots ? "has-dot-navigation" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={carouselClassName}>
      <Swiper
        centeredSlides={!isResponsive}
        className="mobile-card-swiper"
        grabCursor
        initialSlide={!isResponsive && items.length > 1 ? 1 : 0}
        modules={showDots ? [Pagination] : undefined}
        pagination={showDots ? { clickable: true } : undefined}
        slidesPerView={1.32}
        spaceBetween={16}
        breakpoints={
          isResponsive
            ? {
                641: {
                  centeredSlides: false,
                  slidesPerView: 2.05,
                  spaceBetween: 16,
                },
                981: {
                  centeredSlides: false,
                  slidesPerView: 2.45,
                  spaceBetween: 16,
                },
                1180: {
                  centeredSlides: false,
                  slidesPerView: 2.65,
                  spaceBetween: 16,
                },
              }
            : undefined
        }
      >
        {items.map((item) => (
          <SwiperSlide key={`${item.href}-${item.title}`}>
            <Link className="mobile-swipe-card" href={item.href}>
              <span className="mobile-swipe-image">
                <img src={item.image} alt={item.title} loading="lazy" />
              </span>
              <span className="mobile-swipe-copy">
                {item.eyebrow ? <small>{item.eyebrow}</small> : null}
                <strong>{item.title}</strong>
                {item.description ? <span className="mobile-swipe-description">{item.description}</span> : null}
              </span>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>

      <Link className="mobile-swipe-cta" href={ctaHref}>
        {ctaLabel}
        <RiArrowRightSLine size={18} />
      </Link>
    </div>
  );
}
