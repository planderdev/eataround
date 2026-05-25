"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  label?: string;
  zIndex?: string;
  children: import("react").ReactNode;
};

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export function Modal({ isOpen, onClose, label, zIndex = "var(--z-modal)", children }: ModalProps) {
  const layerRef = useRef<HTMLDivElement | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    restoreFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusFirst = window.setTimeout(() => {
      const layer = layerRef.current;
      if (!layer) return;
      const focusable = layer.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      const initial = focusable[1] ?? focusable[0];
      initial?.focus();
    }, 0);

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const layer = layerRef.current;
      if (!layer) return;
      const focusable = Array.from(layer.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (!active || active === first || !layer.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (!active || active === last || !layer.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKey);

    return () => {
      window.clearTimeout(focusFirst);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
      restoreFocusRef.current?.focus?.();
      restoreFocusRef.current = null;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modal = (
    <div className="modal-layer" ref={layerRef} role="presentation" style={{ zIndex }}>
      <button className="modal-backdrop" aria-label={label ? `${label} 닫기` : "닫기"} onClick={onClose} type="button" />
      {children}
    </div>
  );

  return createPortal(modal, document.body);
}
