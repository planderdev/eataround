"use client";

import { RiAlertLine, RiCloseLine } from "@remixicon/react";

type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  tone?: "danger" | "warning" | "info";
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  confirmLabel = "확인",
  description,
  isOpen,
  onCancel,
  onConfirm,
  title,
  tone = "warning",
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="admin-confirm-backdrop" role="presentation">
      <section className="admin-confirm-dialog" data-tone={tone} aria-modal="true" role="dialog" aria-labelledby="admin-confirm-title">
        <header>
          <i aria-hidden>
            <RiAlertLine size={22} />
          </i>
          <button type="button" aria-label="닫기" onClick={onCancel}>
            <RiCloseLine size={18} />
          </button>
        </header>
        <h2 id="admin-confirm-title">{title}</h2>
        <p>{description}</p>
        <footer>
          <button className="admin-action-button ghost" type="button" onClick={onCancel}>
            취소
          </button>
          <button className={`admin-action-button ${tone === "danger" ? "danger" : "primary"}`} type="button" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </footer>
      </section>
    </div>
  );
}
