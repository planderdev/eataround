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
import { DatePicker } from "@/components/DatePicker";
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
  basePath?: string;
  submitLabel?: string;
};

function getInitialDraftValues(tabs: FilterTab[]) {
  return tabs.reduce<Record<string, string>>((draft, tab) => {
    for (const option of tab.options) {
      if (option.active && option.value) draft[option.filterKey] = option.value;
    }

    return draft;
  }, {});
}

export function ExperienceFilterModal({ tabs, resultCount, activeCount, initialTabId, basePath = userRoutes.experiences, submitLabel }: ExperienceFilterModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [activeTabId, setActiveTabId] = useState(initialTabId);
  const [tabSwiper, setTabSwiper] = useState<SwiperInstance | null>(null);
  const initialDraftValues = useMemo(() => getInitialDraftValues(tabs), [tabs]);
  const filterKeys = useMemo(() => [...new Set([...tabs.flatMap((tab) => tab.options.map((option) => option.filterKey)), "dateFrom", "dateTo"])], [tabs]);
  const [draftValues, setDraftValues] = useState<Record<string, string>>(initialDraftValues);
  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];
  const isDateTab = /date|날짜|일정|소요/.test(`${activeTab.id} ${activeTab.label}`);
  const activeTabIndex = Math.max(
    tabs.findIndex((tab) => tab.id === activeTab.id),
    0,
  );

  useEffect(() => {
    if (!open) return;
    const search = new URLSearchParams(window.location.search);
    setActiveTabId(initialTabId);
    setDraftValues({
      ...initialDraftValues,
      ...(search.get("dateFrom") ? { dateFrom: search.get("dateFrom") ?? "" } : {}),
      ...(search.get("dateTo") ? { dateTo: search.get("dateTo") ?? "" } : {}),
    });
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
    router.push(query ? `${basePath}?${query}` : basePath);
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
            {isDateTab ? (
              <div className="filter-date-range">
                <span>
                  <strong>날짜 직접 선택</strong>
                  <small>선택한 기간 안에 예약 가능한 회차가 있는 상품만 볼 수 있어요.</small>
                </span>
                <div>
                  <DatePicker
                    label="시작일"
                    name="dateFrom"
                    value={draftValues.dateFrom}
                    onChange={(value) => setDraftValues((current) => ({ ...current, dateFrom: value }))}
                  />
                  <DatePicker
                    label="종료일"
                    name="dateTo"
                    value={draftValues.dateTo}
                    onChange={(value) => setDraftValues((current) => ({ ...current, dateTo: value }))}
                  />
                </div>
              </div>
            ) : null}
          </div>

          <footer className="filter-modal-footer">
            <button className="filter-modal-reset" onClick={() => setDraftValues({})} type="button">
              <RiRefreshLine size={18} />
              초기화
            </button>
            <button className="filter-modal-submit" onClick={handleApply} type="button">
              {submitLabel ?? `${resultCount.toLocaleString("ko-KR")}개의 체험보기`}
            </button>
          </footer>
        </section>
      </Modal>
    </>
  );
}
