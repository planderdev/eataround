"use client";

import { RiTimeLine } from "@remixicon/react";

export function SectionSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="me-section-skeleton" aria-label="마이페이지 데이터를 불러오는 중">
      {Array.from({ length: count }).map((_, index) => (
        <span key={index} />
      ))}
    </div>
  );
}

export function SectionError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="me-section-error" role="alert">
      <strong>정보를 불러오지 못했습니다.</strong>
      <span>잠시 후 다시 시도해 주세요.</span>
      <button className="secondary-button" onClick={onRetry} type="button">
        다시 시도
      </button>
    </div>
  );
}

export function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export function Timeline({ activeIndex, items }: { activeIndex: number; items: string[] }) {
  return (
    <ol className="me-timeline">
      {items.map((item, index) => (
        <li data-active={index <= activeIndex} key={item}>
          <span>
            <RiTimeLine size={15} />
          </span>
          {item}
        </li>
      ))}
    </ol>
  );
}
