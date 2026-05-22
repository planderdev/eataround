"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RiAddLine, RiCloseLine, RiSearchLine } from "@remixicon/react";
import { adminNavItems } from "@/lib/admin";

type CommandPaletteProps = {
  isOpen: boolean;
  query: string;
  onClose: () => void;
  onQueryChange: (value: string) => void;
};

const quickActions = [
  { label: "새 상품 등록", href: "/admin/products/new" },
  { label: "오늘 예약 보기", href: "/admin/reservations" },
  { label: "견적서 발송", href: "/admin/quotes/send" },
  { label: "배너 등록", href: "/admin/banners/new" },
];

export function CommandPalette({ isOpen, onClose, onQueryChange, query }: CommandPaletteProps) {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const normalized = query.trim().toLowerCase();
  const pages = adminNavItems.filter((item) => `${item.label} ${item.group}`.toLowerCase().includes(normalized)).slice(0, 8);
  const actions = quickActions.filter((item) => item.label.toLowerCase().includes(normalized)).slice(0, 4);
  const results = useMemo(
    () => [
      ...pages.map((item) => ({ ...item, section: item.group })),
      ...actions.map((item) => ({ ...item, id: item.href, group: "빠른 액션", section: "바로가기" })),
    ],
    [actions, pages],
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [query, isOpen]);

  if (!isOpen) return null;

  function handleKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, Math.max(0, results.length - 1)));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(0, index - 1));
      return;
    }
    if (event.key === "Enter" && results[activeIndex]) {
      event.preventDefault();
      router.push(results[activeIndex].href);
      onClose();
    }
  }

  return (
    <div className="admin-command-palette-backdrop">
      <section className="admin-command-palette" aria-modal="true" role="dialog" aria-label="명령 팔레트" onKeyDown={handleKeyDown}>
        <header>
          <RiSearchLine size={18} />
          <input autoFocus placeholder="페이지 또는 액션 검색" value={query} onChange={(event) => onQueryChange(event.target.value)} />
          <button type="button" aria-label="닫기" onClick={onClose}>
            <RiCloseLine size={18} />
          </button>
        </header>
        <div className="admin-command-results">
          <span>페이지</span>
          {pages.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link data-active={activeIndex === index} href={item.href} key={item.id} onClick={onClose}>
                <Icon size={16} />
                <strong>{item.label}</strong>
                <small>{item.group}</small>
              </Link>
            );
          })}
          <span>빠른 액션</span>
          {actions.map((item, index) => (
            <Link data-active={activeIndex === pages.length + index} href={item.href} key={item.href} onClick={onClose}>
              <RiAddLine size={16} />
              <strong>{item.label}</strong>
              <small>바로가기</small>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
