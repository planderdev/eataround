"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  RiAddLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiCloseLine,
  RiSubtractLine,
} from "@remixicon/react";
import type { Swiper as SwiperInstance } from "swiper";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

export type LocalExperienceTabItem = {
  id: string;
  label: string;
};

export type LocalExperienceMediaItem = {
  description?: string;
  image: string;
  title: string;
};

export type LocalExperienceFaqItem = {
  answer: string;
  question: string;
};

type MediaLightboxProps = {
  ariaLabel: string;
  initialIndex: number | null;
  items: LocalExperienceMediaItem[];
  onClose: () => void;
};

export function LocalExperienceTabs({ items }: { items: LocalExperienceTabItem[] }) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((section): section is HTMLElement => Boolean(section));

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry?.target.id) {
          setActiveId(visibleEntry.target.id);
        }
      },
      {
        rootMargin: "-140px 0px -58% 0px",
        threshold: [0.1, 0.2, 0.35],
      },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav className="tabs" aria-label="상세 섹션">
      {items.map((item) => (
        <a
          className="tab"
          href={`#${item.id}`}
          aria-current={activeId === item.id ? "true" : undefined}
          data-active={activeId === item.id}
          key={item.id}
          onClick={() => setActiveId(item.id)}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}

export function LocalExperienceCardCarousel({
  ariaLabel,
  items,
}: {
  ariaLabel: string;
  items: LocalExperienceMediaItem[];
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <Swiper
        className="local-experience-card-swiper"
        grabCursor
        slidesPerView={1.18}
        spaceBetween={12}
        breakpoints={{
          640: { slidesPerView: 2.1, spaceBetween: 16 },
          981: { slidesPerView: 2.4, spaceBetween: 16 },
        }}
      >
        {items.map((item, index) => (
          <SwiperSlide key={`${item.title}-${item.image}`}>
            <article className="local-experience-experience-card">
              <button
                className="local-experience-media-button"
                type="button"
                aria-label={`${item.title} 크게 보기`}
                onClick={() => setLightboxIndex(index)}
              >
                <img src={item.image} alt={item.title} loading="lazy" />
              </button>
              <div>
                <strong>{item.title}</strong>
                {item.description ? <p>{item.description}</p> : null}
              </div>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>

      <MediaLightbox ariaLabel={ariaLabel} initialIndex={lightboxIndex} items={items} onClose={() => setLightboxIndex(null)} />
    </>
  );
}

export function LocalExperiencePhotoGrid({
  ariaLabel,
  items,
}: {
  ariaLabel: string;
  items: LocalExperienceMediaItem[];
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <div className="local-experience-photo-grid">
        {items.map((item, index) => (
          <figure key={`${item.title}-${item.image}`}>
            <button
              className="local-experience-media-button"
              type="button"
              aria-label={`${item.title} 크게 보기`}
              onClick={() => setLightboxIndex(index)}
            >
              <img src={item.image} alt={item.title} loading="lazy" />
            </button>
          </figure>
        ))}
      </div>

      <MediaLightbox ariaLabel={ariaLabel} initialIndex={lightboxIndex} items={items} onClose={() => setLightboxIndex(null)} />
    </>
  );
}

export function LocalExperienceReviewPhotos({
  ariaLabel,
  items,
}: {
  ariaLabel: string;
  items: LocalExperienceMediaItem[];
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <div className="local-experience-review-photos" aria-label={ariaLabel}>
        {items.map((item, index) => (
          <button
            className="local-experience-media-button"
            type="button"
            aria-label={`${item.title} 크게 보기`}
            key={`${item.title}-${item.image}`}
            onClick={() => setLightboxIndex(index)}
          >
            <img src={item.image} alt={item.title} loading="lazy" />
          </button>
        ))}
      </div>

      <MediaLightbox ariaLabel={ariaLabel} initialIndex={lightboxIndex} items={items} onClose={() => setLightboxIndex(null)} />
    </>
  );
}

export function LocalExperienceFaq({ items }: { items: LocalExperienceFaqItem[] }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="local-experience-faq-list">
      {items.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <article className="local-experience-faq-item" data-open={isOpen} key={item.question}>
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={`local-experience-faq-${index}`}
              onClick={() => setOpenIndex(isOpen ? -1 : index)}
            >
              <span>{item.question}</span>
              {isOpen ? <RiSubtractLine size={18} aria-hidden /> : <RiAddLine size={18} aria-hidden />}
            </button>
            <div id={`local-experience-faq-${index}`} hidden={!isOpen}>
              <p>{item.answer}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function MediaLightbox({ ariaLabel, initialIndex, items, onClose }: MediaLightboxProps) {
  const [mounted, setMounted] = useState(false);
  const [swiper, setSwiper] = useState<SwiperInstance | null>(null);
  const isOpen = initialIndex !== null;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") swiper?.slidePrev();
      if (event.key === "ArrowRight") swiper?.slideNext();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, swiper]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      className="local-experience-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <button className="icon-button local-experience-lightbox-close" type="button" aria-label="닫기" onClick={onClose}>
        <RiCloseLine size={22} />
      </button>
      <Swiper
        className="local-experience-lightbox-swiper"
        initialSlide={initialIndex ?? 0}
        key={initialIndex ?? 0}
        modules={[Pagination]}
        onSwiper={setSwiper}
        pagination={{ clickable: true }}
        slidesPerView={1}
        spaceBetween={16}
      >
        {items.map((item, index) => (
          <SwiperSlide key={`${item.title}-${item.image}-${index}`}>
            <figure className="local-experience-lightbox-slide">
              <img src={item.image} alt={item.title} loading="lazy" />
              <figcaption>{item.title}</figcaption>
            </figure>
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="local-experience-lightbox-controls" aria-label="사진 슬라이드 제어">
        <button className="icon-button" type="button" aria-label="이전 사진" onClick={() => swiper?.slidePrev()}>
          <RiArrowLeftSLine size={26} />
        </button>
        <button className="icon-button" type="button" aria-label="다음 사진" onClick={() => swiper?.slideNext()}>
          <RiArrowRightSLine size={26} />
        </button>
      </div>
    </div>,
    document.body,
  );
}
