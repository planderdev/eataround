"use client";

import Link from "next/link";
import { RiArrowRightSLine, RiCalendarLine, RiShoppingBag3Line, RiTimeLine } from "@remixicon/react";
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
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const clock = [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
  return days > 0 ? `${days}일 ${clock}` : clock;
}

/** 회차 시작 시각(한국 시간)을 epoch ms로. 날짜 형식이 아니면 null */
function scheduleStartTime(schedule: ScheduleStock) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(schedule.date)) return null;

  const match = /(\d{1,2}):(\d{2})/.exec(schedule.label);
  if (!match) return Date.parse(`${schedule.date}T23:59:59+09:00`);

  let hour = Number(match[1]);
  if (schedule.label.includes("오후") && hour < 12) hour += 12;
  if (schedule.label.includes("오전") && hour === 12) hour = 0;
  return Date.parse(`${schedule.date}T${String(hour).padStart(2, "0")}:${match[2]}:00+09:00`);
}

/** 표시 중인 회차 가운데 가장 가까운, 아직 시작하지 않은 회차까지 남은 초. 없으면 null */
function secondsUntilNextStart(items: LastSeatItem[], now: number) {
  const upcoming = items
    .map((item) => scheduleStartTime(item.schedule))
    .filter((time): time is number => time !== null && time > now);
  if (!upcoming.length) return null;
  return Math.floor((Math.min(...upcoming) - now) / 1000);
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
      <div className="last-seat-content">
        <Link className="last-seat-body" href={experiencePath(experience.slug)}>
          <strong>{experience.title}</strong>
          <span className="last-seat-schedule">
            <span>
              <RiCalendarLine size={15} />
              {schedule.date}
            </span>
            <span>
              <RiTimeLine size={15} />
              {schedule.label}
            </span>
          </span>
          <span className="last-seat-price">
            {experience.originalPrice ? <del>{formatWon(experience.originalPrice)}</del> : null}
            <b>
              {percent ? <span className="discount-rate">{percent}%</span> : null}
              {formatWon(schedule.price)}
            </b>
          </span>
        </Link>
        <button className="last-seat-cart" type="button">
          <RiShoppingBag3Line size={15} />
          예약 담기
        </button>
      </div>
    </article>
  );
}

export function LastSeatSection({ items }: { items: LastSeatItem[] }) {
  const visibleItems = useMemo(() => items.slice(0, 4), [items]);
  // 현재 시각에 따라 달라지는 값이라 서버 렌더와 어긋나지 않도록 마운트 후에 계산한다.
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    const update = () => setSecondsLeft(secondsUntilNextStart(visibleItems, Date.now()));
    update();
    const timer = window.setInterval(update, 1000);

    return () => window.clearInterval(timer);
  }, [visibleItems]);

  if (!visibleItems.length) return null;

  return (
    <section className="main-section last-seat-section" data-aos="fade-up">
      <div className="last-seat-heading">
        <Link href={`${userRoutes.experiences}?tag=쿠킹`}>
          <span>원데이클래스 1자리 남음</span>
          <RiArrowRightSLine size={22} />
        </Link>
        {secondsLeft !== null ? (
          <div className="last-seat-timer" aria-label="가장 가까운 회차 시작까지 남은 시간">
            <RiTimeLine size={18} />
            <strong>{formatTimer(secondsLeft)}</strong>
          </div>
        ) : null}
      </div>

      <div className="last-seat-grid">
        {visibleItems.map((item, index) => (
          <LastSeatCard {...item} index={index} key={item.experience.slug} />
        ))}
      </div>

      <div className="last-seat-mobile-carousel" aria-label="원데이클래스 마감임박 슬라이드">
        <Swiper className="last-seat-mobile-swiper" slidesPerView={1} spaceBetween={16}>
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
