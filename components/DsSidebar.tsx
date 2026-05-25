"use client";

import { useEffect, useState } from "react";

type NavItem = { label: string; id: string };
type NavGroup = { label: string; items: NavItem[] };

const navGroups: NavGroup[] = [
  {
    label: "Tokens",
    items: [
      { label: "Color", id: "color" },
      { label: "Typography", id: "typography" },
      { label: "Spacing", id: "spacing" },
      { label: "Border Radius", id: "border-radius" },
      { label: "Shadow", id: "shadow" },
      { label: "Transition", id: "transition" },
      { label: "Z-index", id: "z-index" },
      { label: "Line Height", id: "line-height" },
    ],
  },
  {
    label: "Patterns",
    items: [
      { label: "Focus", id: "focus" },
      { label: "Motion", id: "motion" },
    ],
  },
  {
    label: "Components",
    items: [
      { label: "Buttons", id: "buttons" },
      { label: "Badges", id: "badges" },
      { label: "Toast", id: "toast" },
      { label: "Tooltip", id: "tooltip" },
      { label: "Empty State", id: "empty-state" },
      { label: "Avatar", id: "avatar" },
      { label: "Divider", id: "divider" },
      { label: "Form Controls", id: "form-controls" },
      { label: "Filter Chip", id: "filter-chip" },
      { label: "Segmented Control", id: "segmented-control" },
      { label: "Tabs", id: "tabs" },
      { label: "Form Message", id: "form-message" },
      { label: "Schedule Option", id: "schedule-option" },
      { label: "Booking Patterns", id: "booking-patterns" },
      { label: "Filter Source of Truth", id: "filter-source-of-truth" },
      { label: "Admin Inline Patterns", id: "admin-inline-patterns" },
      { label: "Card", id: "card" },
      { label: "Layout", id: "layout" },
    ],
  },
];

export function DsSidebar() {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const ids = navGroups.flatMap((g) => g.items.map((i) => i.id));
    const elements = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-10% 0px -75% 0px" },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <nav aria-label="섹션 목차" className="ds-sidebar">
      {navGroups.map((group) => (
        <div className="ds-sidebar-group" key={group.label}>
          <span className="ds-sidebar-group-label">{group.label}</span>
          <ul>
            {group.items.map((item) => (
              <li key={item.id}>
                <a className="ds-sidebar-link" data-active={activeId === item.id} href={`#${item.id}`}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
