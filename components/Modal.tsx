"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  label?: string;
  zIndex?: string;
  children: import("react").ReactNode;
};

export function Modal({ isOpen, onClose, label, zIndex = "var(--z-modal)", children }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modal = (
    <div className="modal-layer" role="presentation" style={{ zIndex }}>
      <button className="modal-backdrop" aria-label={label ? `${label} 닫기` : "닫기"} onClick={onClose} type="button" />
      {children}
    </div>
  );

  return createPortal(modal, document.body);
}
