"use client";

import Link from "next/link";
import { RiArrowRightSLine, RiShoppingBag3Line, RiTimeLine } from "@remixicon/react";
import { useEffect, useMemo, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { ProductBadge } from "@/components/Badge";
import type { Experience, ScheduleStock } from "@/lib/data";
import { formatWon } from "@/lib/format";
import { experiencePath, userRoutes } from "@/lib/routes";

export type LastSeatItem = {
  experience: Experience;
  schedule: ScheduleStock;
};

function formatTimer(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}

function discountPercent(price: number, originalPrice?: number) {
  if (!originalPrice || originalPrice <= price) return null;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

function LastSeatCard({ experience, schedule, index }: LastSeatItem & { index: number }) {
  const percent = discountPercent(schedule.price, experience.originalPrice);

  return (
    <article className="last-seat-card" data-aos="fade-up" data-aos-delay={String(index * 70)}>
      <Link className="last-seat-image" href={experiencePath(experience.slug)}>
        <img src={experience.image} alt={experience.title} loading="lazy" />
        <span className="badge-row last-seat-badge-row">
          <ProductBadge tone="urgent">마감임박</ProductBadge>
          <ProductBadge tone="stock">1자리 남음</ProductBadge>
        </span>
      </Link>
      <button className="last-seat-cart" type="button">
        <RiShoppingBag3Line size={15} />
        예약 담기
      </button>
      <Link className="last-seat-body" href={experiencePath(experience.slug)}>
        <strong>{experience.title}</strong>
        <span>
          {schedule.date} · {schedule.label}
        </span>
        <span className="last-seat-price">
          {experience.originalPrice ? <del>{formatWon(experience.originalPrice)}</del> : null}
          <b>
            {percent ? <span className="discount-rate">{percent}%</span> : null}
            {formatWon(schedule.price)}
          </b>
        </span>
      </Link>
    </article>
  );
}

export function LastSeatSection({ items }: { items: LastSeatItem[] }) {
  const [secondsLeft, setSecondsLeft] = useState(39010);
  const visibleItems = useMemo(() => items.slice(0, 4), [items]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => (current <= 0 ? 39010 : current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  if (!visibleItems.length) return null;

  return (
    <section className="page-section last-seat-section" data-aos="fade-up">
      <div className="last-seat-heading">
        <Link href={`${userRoutes.experiences}?tag=쿠킹`}>
          <span>원데이클래스 1자리 남음</span>
          <RiArrowRightSLine size={22} />
        </Link>
        <div className="last-seat-timer" aria-label="마감까지 남은 시간">
          <RiTimeLine size={18} />
          <strong>{formatTimer(secondsLeft)}</strong>
        </div>
      </div>

      <div className="last-seat-grid">
        {visibleItems.map((item, index) => (
          <LastSeatCard {...item} index={index} key={item.experience.slug} />
        ))}
      </div>

      <div className="last-seat-mobile-carousel" aria-label="원데이클래스 마감임박 슬라이드">
        <Swiper className="last-seat-mobile-swiper" slidesPerView={1.18} spaceBetween={16}>
          {visibleItems.map((item, index) => (
            <SwiperSlide key={`${item.experience.slug}-mobile`}>
              <LastSeatCard {...item} index={index} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
