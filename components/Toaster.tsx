"use client";

import { useEffect, useState } from "react";
import { type ToastItem, removeToast, subscribe } from "@/lib/toast";

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => subscribe(setToasts), []);

  if (!toasts.length) return null;

  return (
    <div aria-atomic="false" aria-live="polite" className="toast-list" role="log">
      {toasts.map((toast) => (
        <div className="toast" data-tone={toast.tone} key={toast.id}>
          <span>{toast.message}</span>
          <button aria-label="알림 닫기" onClick={() => removeToast(toast.id)} type="button">
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
