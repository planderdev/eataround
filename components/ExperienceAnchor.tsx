"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Swiper as SwiperType } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";

export type ExperienceAnchorItem = {
  id: string;
  label: string;
};

type ExperienceAnchorProps = {
  items: ExperienceAnchorItem[];
};

export function ExperienceAnchor({ items }: ExperienceAnchorProps) {
  const navRef = useRef<HTMLElement>(null);
  const swiperRef = useRef<SwiperType | null>(null);
  const manualActiveUntilRef = useRef(0);
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const itemKeys = useMemo(() => items.map((item) => item.id).join("|"), [items]);
  const activeIndex = useMemo(() => items.findIndex((item) => item.id === activeId), [activeId, items]);

  useEffect(() => {
    const ids = itemKeys.split("|").filter(Boolean);
    if (!ids.length) return;

    let ticking = false;

    function updateActiveFromScroll() {
      if (Date.now() < manualActiveUntilRef.current) return;

      const activationLine = getHeaderOffset() + 78;
      let nextActiveId = ids[0];
      let closestDistance = Number.POSITIVE_INFINITY;

      ids.forEach((id) => {
        const section = document.getElementById(id);
        if (!section) return;
        const distance = Math.abs(section.getBoundingClientRect().top - activationLine);
        if (distance < closestDistance) {
          closestDistance = distance;
          nextActiveId = id;
        }
      });

      setActiveId(nextActiveId);
    }

    function requestUpdate() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        updateActiveFromScroll();
        ticking = false;
      });
    }

    function updateActiveFromHash() {
      const hashId = decodeURIComponent(window.location.hash.replace("#", ""));
      if (ids.includes(hashId)) {
        manualActiveUntilRef.current = Date.now() + 760;
        setActiveId(hashId);
      }
      window.setTimeout(updateActiveFromScroll, 820);
    }

    updateActiveFromHash();
    updateActiveFromScroll();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    window.addEventListener("hashchange", updateActiveFromHash);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      window.removeEventListener("hashchange", updateActiveFromHash);
    };
  }, [itemKeys]);

  useEffect(() => {
    if (activeIndex < 0) return;
    swiperRef.current?.slideTo(activeIndex, 260);
  }, [activeIndex]);

  return (
    <nav className="experience-anchor" aria-label="상세 앵커 메뉴" ref={navRef}>
      <Swiper
        breakpoints={{
          0: {
            slidesPerView: 4.5,
            spaceBetween: 0,
          },
          641: {
            slidesPerView: Math.min(items.length, 7),
            spaceBetween: 0,
          },
        }}
        className="experience-anchor-swiper"
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        resistanceRatio={0.72}
        slidesPerView={4.5}
        spaceBetween={0}
        watchOverflow
      >
        {items.map((item) => {
          const isActive = activeId === item.id;

          return (
            <SwiperSlide key={item.id}>
              <a
                aria-current={isActive ? "true" : undefined}
                className={isActive ? "active" : undefined}
                data-active={isActive ? "true" : "false"}
                href={`#${item.id}`}
                onClick={() => {
                  manualActiveUntilRef.current = Date.now() + 760;
                  setActiveId(item.id);
                }}
              >
                {item.label}
              </a>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </nav>
  );
}

function getHeaderOffset() {
  const value = getComputedStyle(document.documentElement).getPropertyValue("--header-height");
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 72;
}
