"use client";

import Link from "next/link";
import { RiMapPinLine, RiStarFill, RiTimeLine } from "@remixicon/react";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { getBadgeTone } from "@/lib/badges";
import type { Experience } from "@/lib/data";
import { formatWon } from "@/lib/format";
import { experiencePath } from "@/lib/routes";

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
      slidesPerView={1.18}
      spaceBetween={14}
      breakpoints={{
        560: { slidesPerView: 2.08, spaceBetween: 14 },
        920: { slidesPerView: 4.5, spaceBetween: 16 },
      }}
    >
      {items.map((item) => (
        <SwiperSlide key={item.slug}>
          <Link className="detail-related-card" href={experiencePath(item.slug)}>
            <span className="detail-related-image">
              <img src={item.image} alt={item.title} loading="lazy" />
              {item.badge ? (
                <span className="badge-row">
                  <span className="last-seat-badge" data-tone={getBadgeTone(item.badge)}>
                    {item.badge}
                  </span>
                </span>
              ) : null}
            </span>
            <span className="detail-related-body">
              <span className="card-eyebrow">{item.eyebrow}</span>
              <strong>{item.title}</strong>
              <span className="detail-related-meta">
                <span>
                  <RiMapPinLine size={14} />
                  {item.region}
                </span>
                <span>
                  <RiTimeLine size={14} />
                  {item.duration}
                </span>
              </span>
              <span className="detail-related-tags">
                {item.tags.slice(0, 3).map((tag) => (
                  <span key={tag}>#{tag}</span>
                ))}
              </span>
              <span className="detail-related-price">
                <b>{formatWon(item.price)}</b>
                <small>
                  <RiStarFill size={14} />
                  {item.rating.toFixed(1)}
                </small>
              </span>
            </span>
          </Link>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
