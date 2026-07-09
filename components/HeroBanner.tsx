"use client";

import { useEffect, useMemo, useRef, useState, type DragEvent, type MouseEvent, type PointerEvent, type TouchEvent } from "react";
import { RiArrowLeftLine, RiArrowRightLine } from "@remixicon/react";
import type { HeroSlide } from "@/lib/data";

export type HeroRankingItem = {
  title: string;
  href: string;
  category: string;
  author?: string;
  date?: string;
};

export function HeroBanner({ rankingItems = [], slides }: { slides: HeroSlide[]; rankingItems?: HeroRankingItem[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [slideInteractionKey, setSlideInteractionKey] = useState(0);
  const [activeRankingIndex, setActiveRankingIndex] = useState(0);
  const [isRankingMobile, setIsRankingMobile] = useState(false);
  const [isRankingPaused, setIsRankingPaused] = useState(false);
  const swipeStartRef = useRef<{ pointerId: number; x: number; y: number } | null>(null);
  const mouseStartRef = useRef<{ x: number; y: number; width: number } | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const lastSwipeAtRef = useRef(0);
  const suppressSwipeClickRef = useRef(false);
  const totalSlides = slides.length;
  const visibleRankingItems = useMemo(() => rankingItems.slice(0, 5), [rankingItems]);
  const rankingCount = visibleRankingItems.length;

  useEffect(() => {
    if (totalSlides < 2) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % totalSlides);
    }, 6000);

    return () => window.clearInterval(timer);
  }, [slideInteractionKey, totalSlides]);

  useEffect(() => {
    const mobileMedia = window.matchMedia("(max-width: 767px)");
    const syncMobileState = () => setIsRankingMobile(mobileMedia.matches);

    syncMobileState();
    mobileMedia.addEventListener("change", syncMobileState);

    return () => mobileMedia.removeEventListener("change", syncMobileState);
  }, []);

  useEffect(() => {
    if (!rankingCount) return;
    setActiveRankingIndex(0);
  }, [isRankingMobile, rankingCount]);

  useEffect(() => {
    if (!rankingCount) return;

    const rankingCycleMs = 3000;

    if (isRankingMobile) {
      const mobileStepMs = 1200;
      const mobilePauseMs = 2400;
      let cycleTimer: number | undefined;
      let sequenceTimers: number[] = [];

      const clearSequenceTimers = () => {
        sequenceTimers.forEach((timer) => window.clearTimeout(timer));
        sequenceTimers = [];
      };

      const runMobileSequence = () => {
        clearSequenceTimers();

        sequenceTimers = Array.from({ length: rankingCount }, (_, itemIndex) =>
          window.setTimeout(() => {
            setActiveRankingIndex(itemIndex);
          }, itemIndex * mobileStepMs),
        );

        cycleTimer = window.setTimeout(runMobileSequence, mobileStepMs * rankingCount + mobilePauseMs);
      };

      runMobileSequence();

      return () => {
        if (cycleTimer) {
          window.clearTimeout(cycleTimer);
        }
        clearSequenceTimers();
      };
    }

    if (rankingCount < 2 || isRankingPaused) return;

    const timer = window.setInterval(() => {
      setActiveRankingIndex((current) => (current + 1) % rankingCount);
    }, rankingCycleMs);

    return () => window.clearInterval(timer);
  }, [isRankingMobile, isRankingPaused, rankingCount]);

  if (!slides.length) return null;

  function resetHeroAutoplay() {
    setSlideInteractionKey((current) => current + 1);
  }

  function goToSlide(index: number) {
    setActiveIndex(index);
    resetHeroAutoplay();
  }

  function goPrevious() {
    setActiveIndex((current) => (current - 1 + totalSlides) % totalSlides);
    resetHeroAutoplay();
  }

  function goNext() {
    setActiveIndex((current) => (current + 1) % totalSlides);
    resetHeroAutoplay();
  }

  function isHeroControlEventTarget(target: EventTarget | null) {
    return target instanceof Element && Boolean(target.closest(".hero-featured__controls, button"));
  }

  function commitHeroSwipe(deltaX: number, deltaY: number, containerWidth: number) {
    const horizontalDistance = Math.abs(deltaX);
    const verticalDistance = Math.abs(deltaY);
    const swipeThreshold = Math.max(36, containerWidth * 0.07);
    const isHorizontalSwipe = horizontalDistance >= swipeThreshold && horizontalDistance > verticalDistance * 1.15;

    if (!isHorizontalSwipe) return false;

    const now = Date.now();
    if (now - lastSwipeAtRef.current < 350) return true;

    lastSwipeAtRef.current = now;
    suppressSwipeClickRef.current = true;
    if (deltaX < 0) {
      goNext();
    } else {
      goPrevious();
    }

    window.setTimeout(() => {
      suppressSwipeClickRef.current = false;
    }, 450);

    return true;
  }

  function handleHeroPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (totalSlides < 2 || isHeroControlEventTarget(event.target) || (event.pointerType === "mouse" && event.button !== 0)) return;

    swipeStartRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
    suppressSwipeClickRef.current = false;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function handleHeroPointerUp(event: PointerEvent<HTMLDivElement>) {
    const swipeStart = swipeStartRef.current;
    if (!swipeStart || swipeStart.pointerId !== event.pointerId) return;

    swipeStartRef.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);

    const deltaX = event.clientX - swipeStart.x;
    const deltaY = event.clientY - swipeStart.y;
    commitHeroSwipe(deltaX, deltaY, event.currentTarget.clientWidth);
  }

  function handleHeroPointerCancel(event: PointerEvent<HTMLDivElement>) {
    if (swipeStartRef.current?.pointerId === event.pointerId) {
      swipeStartRef.current = null;
    }
  }

  function handleHeroMouseDown(event: MouseEvent<HTMLDivElement>) {
    if (totalSlides < 2 || isHeroControlEventTarget(event.target) || event.button !== 0) return;

    mouseStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      width: event.currentTarget.clientWidth,
    };
    suppressSwipeClickRef.current = false;
    event.preventDefault();
  }

  function handleHeroMouseUp(event: MouseEvent<HTMLDivElement>) {
    const mouseStart = mouseStartRef.current;
    if (!mouseStart) return;

    mouseStartRef.current = null;
    commitHeroSwipe(event.clientX - mouseStart.x, event.clientY - mouseStart.y, mouseStart.width);
  }

  function handleHeroMouseLeave(event: MouseEvent<HTMLDivElement>) {
    const mouseStart = mouseStartRef.current;
    if (!mouseStart) return;

    mouseStartRef.current = null;
    if (event.buttons !== 1) return;

    commitHeroSwipe(event.clientX - mouseStart.x, event.clientY - mouseStart.y, mouseStart.width);
  }

  function handleHeroDragStart(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
  }

  function handleHeroTouchStart(event: TouchEvent<HTMLDivElement>) {
    if (totalSlides < 2 || isHeroControlEventTarget(event.target) || event.touches.length !== 1) return;

    const touch = event.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    };
    suppressSwipeClickRef.current = false;
  }

  function handleHeroTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const touchStart = touchStartRef.current;
    const touch = event.changedTouches[0];
    if (!touchStart || !touch) return;

    touchStartRef.current = null;
    commitHeroSwipe(touch.clientX - touchStart.x, touch.clientY - touchStart.y, event.currentTarget.clientWidth);
  }

  function handleHeroTouchCancel() {
    touchStartRef.current = null;
  }

  function handleHeroClickCapture(event: MouseEvent<HTMLDivElement>) {
    if (!suppressSwipeClickRef.current) return;

    if (isHeroControlEventTarget(event.target)) {
      suppressSwipeClickRef.current = false;
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    suppressSwipeClickRef.current = false;
  }

  function handleHeroSlideClick(event: MouseEvent<HTMLAnchorElement>) {
    const isRecentSwipe = Date.now() - lastSwipeAtRef.current < 700;
    if (!suppressSwipeClickRef.current && !isRecentSwipe) return;

    event.preventDefault();
    event.stopPropagation();
    suppressSwipeClickRef.current = false;
  }

  function stopHeroControlEvent(event: MouseEvent<HTMLElement> | PointerEvent<HTMLElement> | TouchEvent<HTMLElement>) {
    event.stopPropagation();
  }

  function handleHeroIndicatorClick(event: MouseEvent<HTMLButtonElement>, index: number) {
    event.preventDefault();
    event.stopPropagation();
    goToSlide(index);
  }

  function handleHeroPreviousClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    goPrevious();
  }

  function handleHeroNextClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    goNext();
  }

  return (
    <section className="hero-shell" aria-labelledby="home-hero-title" data-aos="fade-up">
      <div className="hero-main">
        <div
          className="hero-featured"
          data-autoplay="1"
          onClickCapture={handleHeroClickCapture}
          onDragStart={handleHeroDragStart}
          onMouseDown={handleHeroMouseDown}
          onMouseLeave={handleHeroMouseLeave}
          onMouseUp={handleHeroMouseUp}
          onPointerCancel={handleHeroPointerCancel}
          onPointerDown={handleHeroPointerDown}
          onPointerUp={handleHeroPointerUp}
          onTouchCancel={handleHeroTouchCancel}
          onTouchEnd={handleHeroTouchEnd}
          onTouchStart={handleHeroTouchStart}
        >
          <div className="hero-featured__slides">
            {slides.map((slide, index) => {
              const Heading = index === 0 ? "h1" : "h2";
              const headingProps = index === 0 ? { id: "home-hero-title" } : {};
              const isActive = index === activeIndex;
              const isNext = totalSlides > 1 && index === (activeIndex + 1) % totalSlides;

              return (
                <article
                  className={`hero-slide${isActive ? " is-active" : ""}${isNext ? " is-next" : ""}`}
                  data-badge={slide.eyebrow.toLowerCase()}
                  data-index={index}
                  key={slide.title}
                >
                  <a className="hero-slide__link" href={slide.href} onClick={handleHeroSlideClick}>
                    <div className="hero-slide__media" aria-hidden="true">
                      <img
                        src={slide.image}
                        alt=""
                        className="hero-slide__image"
                        decoding={index === 0 ? "sync" : "async"}
                        draggable={false}
                        fetchPriority={index === 0 ? "high" : "low"}
                        loading={index === 0 ? "eager" : "lazy"}
                      />
                    </div>
                    <div className="hero-slide__overlay">
                      <div className="hero-slide__category">{slide.eyebrow}</div>
                      <Heading {...headingProps} className="hero-slide__title">
                        {slide.title}
                      </Heading>
                      <div className="hero-slide__meta">
                        <span className="hero-slide__author-name">eat.around</span>
                        <span className="hero-slide__meta-divider" aria-hidden="true" />
                        <span className="hero-slide__date">Local Experience</span>
                      </div>
                    </div>
                  </a>
                </article>
              );
            })}
          </div>

          <div className="hero-featured__controls">
            <div className="hero-featured__indicators" aria-label="히어로 슬라이드 이동">
              {slides.map((slide, index) => (
                <button
                  aria-label={`${index + 1}번째 슬라이드로 이동`}
                  className={`hero-indicator${index === activeIndex ? " is-active" : ""}`}
                  data-index={index}
                  key={`${slide.title}-indicator`}
                  onClick={(event) => handleHeroIndicatorClick(event, index)}
                  onMouseDown={stopHeroControlEvent}
                  onPointerDown={stopHeroControlEvent}
                  onTouchStart={stopHeroControlEvent}
                  type="button"
                />
              ))}
            </div>
            <div className="hero-featured__arrows" aria-label="히어로 슬라이드 제어">
              <button
                aria-label="이전 슬라이드"
                className="hero-featured__arrow hero-featured__arrow--prev"
                onClick={handleHeroPreviousClick}
                onMouseDown={stopHeroControlEvent}
                onPointerDown={stopHeroControlEvent}
                onTouchStart={stopHeroControlEvent}
                type="button"
              >
                <RiArrowLeftLine size={18} />
              </button>
              <button
                aria-label="다음 슬라이드"
                className="hero-featured__arrow hero-featured__arrow--next"
                onClick={handleHeroNextClick}
                onMouseDown={stopHeroControlEvent}
                onPointerDown={stopHeroControlEvent}
                onTouchStart={stopHeroControlEvent}
                type="button"
              >
                <RiArrowRightLine size={18} />
              </button>
            </div>
          </div>
        </div>

        <aside
          className="hero-ranking"
          aria-label="인기 콘텐츠"
          onMouseEnter={() => setIsRankingPaused(true)}
          onMouseLeave={() => setIsRankingPaused(false)}
          onPointerEnter={() => setIsRankingPaused(true)}
          onPointerLeave={() => setIsRankingPaused(false)}
        >
          <div className="hero-ranking__header">
            <div className="hero-ranking__title-row">
              <h2 className="hero-ranking__heading" data-active-rank={activeRankingIndex + 1}>
                RANKING
              </h2>
              <span className="hero-ranking__subtitle">지금 많이 찾는 로컬 경험</span>
            </div>
          </div>
          <ol className="hero-ranking__list">
            {visibleRankingItems.map((item, index) => {
              const isRankingActive = index === activeRankingIndex;
              const revealClassName = isRankingMobile && isRankingActive ? " is-reveal" : "";

              return (
                <li className={`hero-ranking__item${isRankingActive ? " is-active" : ""}`} key={`${item.title}-ranking`}>
                  <span className={`hero-ranking__number${revealClassName}`}>{index + 1}</span>
                  <a className={`hero-ranking__title${revealClassName}`} href={item.href}>
                    {item.title}
                  </a>
                  <span className="hero-ranking__meta">
                    <span className="hero-ranking__category">{item.category}</span>
                    {item.author ? <span className="hero-ranking__author">{item.author}</span> : null}
                    {item.date ? <span className="hero-ranking__date">{item.date}</span> : null}
                  </span>
                </li>
              );
            })}
          </ol>
        </aside>
      </div>
    </section>
  );
}
