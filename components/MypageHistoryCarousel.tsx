"use client";

import { useState } from "react";
import Link from "next/link";
import { RiArrowRightSLine } from "@remixicon/react";
import type { Swiper as SwiperInstance } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { StatusBadge } from "@/components/Badge";
import type { HistoryTone } from "@/lib/mypage-data";

export type MypageHistoryCardItem = {
  actionHref: string;
  actionLabel: string;
  meta: [string, string][];
  note: string;
  status: string;
  title: string;
  tone: HistoryTone;
};

type MypageHistoryCarouselProps = {
  items: MypageHistoryCardItem[];
  label: string;
};

function MypagePreviewCard({ actionHref, actionLabel, meta, note, status, title, tone }: MypageHistoryCardItem) {
  return (
    <article className="mypage-preview-card">
      <header>
        <div>
          <strong>{title}</strong>
          <p>{note}</p>
        </div>
        <StatusBadge tone={tone}>{status}</StatusBadge>
      </header>
      <dl>
        {meta.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <Link className="secondary-button" href={actionHref}>
        {actionLabel}
        <RiArrowRightSLine size={16} />
      </Link>
    </article>
  );
}

export function MypageHistoryCarousel({ items, label }: MypageHistoryCarouselProps) {
  const [swiper, setSwiper] = useState<SwiperInstance | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!items.length) return null;

  const hasMultipleItems = items.length > 1;

  return (
    <div className={hasMultipleItems ? "mypage-history-carousel has-dot-navigation" : "mypage-history-carousel"} aria-label={label}>
      <Swiper
        className="mypage-history-swiper"
        grabCursor={hasMultipleItems}
        onSlideChange={(instance) => setActiveIndex(instance.realIndex)}
        onSwiper={setSwiper}
        slidesPerView={1}
        spaceBetween={16}
      >
        {items.map((item) => (
          <SwiperSlide key={`${item.actionHref}-${item.title}`}>
            <MypagePreviewCard {...item} />
          </SwiperSlide>
        ))}
      </Swiper>
      {hasMultipleItems ? (
        <div className="mypage-history-dots" aria-label={`${label} 페이지`} role="tablist">
          {items.map((item, index) => (
            <button
              aria-label={`${index + 1}번째 내역 보기`}
              aria-selected={activeIndex === index}
              data-active={activeIndex === index ? "true" : "false"}
              key={`${item.actionHref}-dot`}
              onClick={() => swiper?.slideTo(index)}
              role="tab"
              type="button"
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
