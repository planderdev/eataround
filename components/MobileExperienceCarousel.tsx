"use client";

import Link from "next/link";
import { RiArrowRightSLine, RiMapPinFill, RiTimeLine } from "@remixicon/react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Experience } from "@/lib/data";
import { experiencePath, userRoutes } from "@/lib/routes";

type MobileExperienceCarouselProps = {
  items: Experience[];
};

export function MobileExperienceCarousel({ items }: MobileExperienceCarouselProps) {
  if (!items.length) return null;

  return (
    <div className="mobile-experience-carousel">
      <div className="mobile-experience-heading">
        <h2>추천 로컬체험</h2>
        <Link href={userRoutes.experiences}>
          더보기
          <RiArrowRightSLine size={18} />
        </Link>
      </div>

      <Swiper className="mobile-experience-swiper" slidesPerView={1.28} spaceBetween={16}>
        {items.map((experience) => (
          <SwiperSlide key={experience.slug}>
            <Link className="mobile-experience-card" href={experiencePath(experience.slug)}>
              <span className="mobile-experience-image">
                <img src={experience.image} alt={experience.title} loading="lazy" />
                <span>
                  <RiMapPinFill size={16} />
                  {experience.place.name}
                </span>
              </span>
              <strong>{experience.title}</strong>
              <span className="mobile-experience-duration">
                <RiTimeLine size={16} />
                {experience.duration} 소요
              </span>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
