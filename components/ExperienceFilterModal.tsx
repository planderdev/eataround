"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  RiCheckboxBlankLine,
  RiCheckboxFill,
  RiCloseLine,
  RiEqualizer2Line,
  RiRefreshLine,
} from "@remixicon/react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";
import { Modal } from "@/components/Modal";
import { userRoutes } from "@/lib/routes";

export type FilterOption = {
  label: string;
  href: string;
  active?: boolean;
  note?: string;
};

export type FilterTab = {
  id: string;
  label: string;
  options: FilterOption[];
};

type ExperienceFilterModalProps = {
  tabs: FilterTab[];
  resultCount: number;
  activeCount: number;
  initialTabId: string;
};

export function ExperienceFilterModal({ tabs, resultCount, activeCount, initialTabId }: ExperienceFilterModalProps) {
  const [open, setOpen] = useState(false);
  const [activeTabId, setActiveTabId] = useState(initialTabId);
  const [tabSwiper, setTabSwiper] = useState<SwiperInstance | null>(null);
  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];
  const activeTabIndex = Math.max(
    tabs.findIndex((tab) => tab.id === activeTab.id),
    0,
  );

  useEffect(() => {
    if (!open || !tabSwiper) return;
    tabSwiper.slideTo(activeTabIndex, 220);
  }, [activeTabIndex, open, tabSwiper]);

  return (
    <>
      <button className="filter-modal-trigger" data-active={activeCount > 0} onClick={() => setOpen(true)} type="button">
        <RiEqualizer2Line size={18} />
        필터
        {activeCount > 0 ? <span>{activeCount}</span> : null}
      </button>

      <Modal isOpen={open} onClose={() => setOpen(false)} label="필터">
        <section className="filter-modal-panel" aria-modal="true" role="dialog" aria-labelledby="filter-modal-title">
          <header className="filter-modal-header">
            <h2 id="filter-modal-title">필터</h2>
            <button className="filter-modal-close" aria-label="필터 닫기" onClick={() => setOpen(false)} type="button">
              <RiCloseLine size={26} />
            </button>
          </header>

          <Swiper
            className="filter-modal-tabs"
            onSwiper={setTabSwiper}
            role="tablist"
            slidesPerView="auto"
            spaceBetween={16}
            watchOverflow
            aria-label="필터 종류"
          >
            {tabs.map((tab) => (
              <SwiperSlide className="filter-modal-tab-slide" key={tab.id}>
                <button
                  aria-selected={activeTab.id === tab.id}
                  className="filter-modal-tab"
                  data-active={activeTab.id === tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  role="tab"
                  type="button"
                >
                  {tab.label}
                </button>
              </SwiperSlide>
            ))}
          </Swiper>

          <div className="filter-modal-body" role="tabpanel">
            <div className="filter-modal-options">
              {activeTab.options.map((option) => {
                const Icon = option.active ? RiCheckboxFill : RiCheckboxBlankLine;

                return (
                  <Link
                    aria-current={option.active ? "page" : undefined}
                    className="filter-check-option"
                    data-active={option.active ? "true" : "false"}
                    href={option.href}
                    key={`${activeTab.id}-${option.label}`}
                    onClick={() => setOpen(false)}
                  >
                    <Icon size={20} />
                    <span>
                      <strong>{option.label}</strong>
                      {option.note ? <small>{option.note}</small> : null}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          <footer className="filter-modal-footer">
            <Link className="filter-modal-reset" href={userRoutes.experiences} onClick={() => setOpen(false)}>
              <RiRefreshLine size={18} />
              초기화
            </Link>
            <button className="filter-modal-submit" onClick={() => setOpen(false)} type="button">
              {resultCount.toLocaleString("ko-KR")}개의 체험보기
            </button>
          </footer>
        </section>
      </Modal>
    </>
  );
}
