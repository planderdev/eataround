"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { RiCheckboxCircleLine } from "@remixicon/react";

export type AdminNotification = {
  id: string;
  category: string;
  title: string;
  href: string;
  unread: boolean;
};

type NotificationPanelProps = {
  isOpen: boolean;
  items: AdminNotification[];
  onClose: () => void;
  onReadAll: () => void;
};

export function NotificationPanel({ isOpen, items, onClose, onReadAll }: NotificationPanelProps) {
  const [activeCategory, setActiveCategory] = useState("전체");
  const categories = useMemo(() => ["전체", ...Array.from(new Set(items.map((item) => item.category)))], [items]);
  const filteredItems = activeCategory === "전체" ? items : items.filter((item) => item.category === activeCategory);

  if (!isOpen) return null;

  return (
    <section className="admin-notification-panel" aria-label="관리자 알림">
      <header>
        <div>
          <span>Notifications</span>
          <strong>운영 알림</strong>
        </div>
        <button type="button" onClick={onReadAll}>
          모두 읽음
        </button>
      </header>
      <div className="admin-notification-tabs" role="tablist" aria-label="알림 카테고리">
        {categories.map((category) => (
          <button aria-selected={activeCategory === category} data-active={activeCategory === category} key={category} onClick={() => setActiveCategory(category)} role="tab" type="button">
            {category}
          </button>
        ))}
      </div>
      <div>
        {filteredItems.map((item) => (
          <Link href={item.href} data-unread={item.unread} key={item.id} onClick={onClose}>
            <i aria-hidden>
              <RiCheckboxCircleLine size={16} />
            </i>
            <span>
              <small>{item.category}</small>
              <strong>{item.title}</strong>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
