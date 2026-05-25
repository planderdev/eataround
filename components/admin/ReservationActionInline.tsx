"use client";

import { useState } from "react";
import { RiCheckLine, RiCloseLine, RiMailSendLine } from "@remixicon/react";
import { notifyAdminToast } from "@/lib/admin/toast";
import { withBasePath } from "@/lib/paths";

type ReservationActionInlineProps = {
  reservationId: string;
  productLabel: string;
  approvalRequired?: boolean;
};

type Mode = "idle" | "reject";

export function ReservationActionInline({ reservationId, productLabel, approvalRequired }: ReservationActionInlineProps) {
  const [mode, setMode] = useState<Mode>("idle");
  const [rejectReason, setRejectReason] = useState("");
  const [busy, setBusy] = useState<"confirm" | "reject" | "notify" | null>(null);

  async function patch(payload: { status?: string; rejectReason?: string; memo?: string }, busyKey: NonNullable<typeof busy>, successMessage: string) {
    setBusy(busyKey);
    try {
      const response = await fetch(withBasePath(`/api/admin/reservations/${encodeURIComponent(reservationId)}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; message?: string };

      if (response.ok && data.ok !== false) {
        notifyAdminToast(data.message ?? successMessage, "success");
        setMode("idle");
        setRejectReason("");
        return;
      }
      notifyAdminToast(data.message ?? "처리 중 문제가 발생했습니다.", "error");
    } catch {
      notifyAdminToast("네트워크 오류로 처리하지 못했습니다.", "error");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="admin-inline-actions" data-mode={mode}>
      {mode === "idle" ? (
        <>
          <button
            className="admin-action-button secondary"
            disabled={Boolean(busy)}
            onClick={() => patch({ status: approvalRequired ? "confirmed" : "paid" }, "confirm", `${productLabel} 예약을 확정했습니다.`)}
            type="button"
          >
            <RiCheckLine size={14} />
            {busy === "confirm" ? "처리 중..." : approvalRequired ? "예약 확정" : "결제 확인"}
          </button>
          <button
            className="admin-action-button info"
            disabled={Boolean(busy)}
            onClick={() => patch({ memo: "안내 발송" }, "notify", "안내 메시지를 발송했습니다.")}
            type="button"
          >
            <RiMailSendLine size={14} />
            {busy === "notify" ? "발송 중..." : "안내 발송"}
          </button>
          <button
            className="admin-action-button danger"
            disabled={Boolean(busy)}
            onClick={() => setMode("reject")}
            type="button"
          >
            <RiCloseLine size={14} />
            거절 처리
          </button>
        </>
      ) : (
        <form
          className="admin-inline-reject"
          onSubmit={(event) => {
            event.preventDefault();
            patch({ status: "rejected", rejectReason }, "reject", `${productLabel} 예약을 거절 처리했습니다.`);
          }}
        >
          <label>
            <span>거절 사유</span>
            <textarea
              autoFocus
              maxLength={300}
              onChange={(event) => setRejectReason(event.target.value)}
              placeholder="고객에게 함께 안내될 사유를 입력하세요."
              required
              rows={2}
              value={rejectReason}
            />
          </label>
          <div className="admin-inline-reject-actions">
            <button className="admin-action-button ghost" disabled={Boolean(busy)} onClick={() => { setMode("idle"); setRejectReason(""); }} type="button">
              취소
            </button>
            <button className="admin-action-button danger" disabled={Boolean(busy) || !rejectReason.trim()} type="submit">
              {busy === "reject" ? "처리 중..." : "거절 사유 전송"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
