"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { RiCloseLine } from "@remixicon/react";

type SlideOverProps = {
  isOpen: boolean;
  title: string;
  description?: string;
  size?: "sm" | "md" | "lg";
  footer?: ReactNode;
  children: ReactNode;
  onClose: () => void;
};

export function SlideOver({ children, description, footer, isOpen, onClose, size = "md", title }: SlideOverProps) {
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="admin-slideover-root" data-open={isOpen}>
      <button className="admin-slideover-backdrop" type="button" aria-label="패널 닫기" onClick={onClose} />
      <aside className="admin-slideover" data-size={size} aria-modal="true" role="dialog" aria-labelledby="admin-slideover-title">
        <header className="admin-slideover-header">
          <div>
            <h2 id="admin-slideover-title">{title}</h2>
            {description ? <p>{description}</p> : null}
          </div>
          <button className="admin-icon-button" type="button" aria-label="닫기" onClick={onClose}>
            <RiCloseLine size={18} />
          </button>
        </header>
        <div className="admin-slideover-body">{children}</div>
        {footer ? <footer className="admin-slideover-footer">{footer}</footer> : null}
      </aside>
    </div>
  );
}
