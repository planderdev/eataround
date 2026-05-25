"use client";

import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { ExperienceCard } from "@/components/ExperienceCard";
import type { Experience } from "@/lib/data";

type DetailRelatedExperiencesProps = {
  items: Experience[];
};

export function DetailRelatedExperiences({ items }: DetailRelatedExperiencesProps) {
  if (!items.length) return null;

  return (
    <Swiper
      className="detail-related-swiper"
      grabCursor
      modules={[Pagination]}
      pagination={{ clickable: true }}
      slidesPerView={1.5}
      spaceBetween={16}
      breakpoints={{
        560: { slidesPerView: 2.08, spaceBetween: 16 },
        920: { slidesPerView: 4.5, spaceBetween: 16 },
      }}
    >
      {items.map((item) => (
        <SwiperSlide key={item.slug}>
          <ExperienceCard experience={item} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
