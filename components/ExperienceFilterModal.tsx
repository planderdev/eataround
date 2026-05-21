"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
  filterKey: string;
  value: string;
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

function getInitialDraftValues(tabs: FilterTab[]) {
  return tabs.reduce<Record<string, string>>((draft, tab) => {
    for (const option of tab.options) {
      if (option.active && option.value) draft[option.filterKey] = option.value;
    }

    return draft;
  }, {});
}

export function ExperienceFilterModal({ tabs, resultCount, activeCount, initialTabId }: ExperienceFilterModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [activeTabId, setActiveTabId] = useState(initialTabId);
  const [tabSwiper, setTabSwiper] = useState<SwiperInstance | null>(null);
  const initialDraftValues = useMemo(() => getInitialDraftValues(tabs), [tabs]);
  const filterKeys = useMemo(() => [...new Set(tabs.flatMap((tab) => tab.options.map((option) => option.filterKey)))], [tabs]);
  const [draftValues, setDraftValues] = useState<Record<string, string>>(initialDraftValues);
  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];
  const activeTabIndex = Math.max(
    tabs.findIndex((tab) => tab.id === activeTab.id),
    0,
  );

  useEffect(() => {
    if (!open) return;
    setActiveTabId(initialTabId);
    setDraftValues(initialDraftValues);
  }, [initialDraftValues, initialTabId, open]);

  useEffect(() => {
    if (!open || !tabSwiper) return;
    tabSwiper.slideTo(activeTabIndex, 220);
  }, [activeTabIndex, open, tabSwiper]);

  function handleSelect(option: FilterOption) {
    setDraftValues((current) => {
      const next = { ...current };
      const isSelected = option.value ? current[option.filterKey] === option.value : !current[option.filterKey];

      if (!option.value || isSelected) {
        delete next[option.filterKey];
      } else {
        next[option.filterKey] = option.value;
      }

      return next;
    });
  }

  function handleApply() {
    const search = new URLSearchParams(window.location.search);
    search.delete("page");

    for (const key of filterKeys) {
      search.delete(key);
    }

    for (const [key, value] of Object.entries(draftValues)) {
      if (value) search.set(key, value);
    }

    const query = search.toString();
    router.push(query ? `${userRoutes.experiences}?${query}` : userRoutes.experiences);
    setOpen(false);
  }

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
                const selected = option.value ? draftValues[option.filterKey] === option.value : !draftValues[option.filterKey];
                const Icon = selected ? RiCheckboxFill : RiCheckboxBlankLine;

                return (
                  <button
                    aria-pressed={selected}
                    className="filter-check-option"
                    data-active={selected ? "true" : "false"}
                    key={`${activeTab.id}-${option.label}`}
                    onClick={() => handleSelect(option)}
                    type="button"
                  >
                    <Icon size={20} />
                    <span>
                      <strong>{option.label}</strong>
                      {option.note ? <small>{option.note}</small> : null}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <footer className="filter-modal-footer">
            <button className="filter-modal-reset" onClick={() => setDraftValues({})} type="button">
              <RiRefreshLine size={18} />
              초기화
            </button>
            <button className="filter-modal-submit" onClick={handleApply} type="button">
              {resultCount.toLocaleString("ko-KR")}개의 체험보기
            </button>
          </footer>
        </section>
      </Modal>
    </>
  );
}
