"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RiCheckLine, RiCloseLine, RiMailSendLine } from "@remixicon/react";
import { notifyAdminToast } from "@/lib/admin/toast";
import { withBasePath } from "@/lib/paths";

type ReservationActionInlineProps = {
  reservationId: string;
  productLabel: string;
  approvalRequired?: boolean;
  /** DB 상태 코드(requested/confirmed/paid/canceled). 샘플 데이터에는 없다. */
  statusCode?: string;
};

type Mode = "idle" | "reject";

export function ReservationActionInline({ reservationId, productLabel, approvalRequired, statusCode }: ReservationActionInlineProps) {
  const router = useRouter();
  const isCanceled = statusCode === "canceled";
  const isSettled = statusCode === "confirmed" || statusCode === "paid";
  // 접수 단계에서는 "거절", 이미 확정·결제된 예약은 "취소"로 처리한다.
  const cancelWord = isSettled ? "취소" : "거절";
  const [mode, setMode] = useState<Mode>("idle");
  const [rejectReason, setRejectReason] = useState("");
  const [busy, setBusy] = useState<"confirm" | "reject" | "notify" | null>(null);

  async function patch(payload: { status?: string; action?: "notify"; rejectReason?: string; reason?: string }, busyKey: NonNullable<typeof busy>, successMessage: string) {
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
        router.refresh();
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
    <div className="admin-inline-actions" data-admin-own-action data-mode={mode}>
      {mode === "idle" ? (
        <>
          <button
            className="admin-action-button secondary"
            disabled={Boolean(busy) || isCanceled || isSettled}
            onClick={() => patch({ status: approvalRequired ? "confirmed" : "paid" }, "confirm", `${productLabel} 예약을 확정했습니다.`)}
            type="button"
          >
            <RiCheckLine size={14} />
            {busy === "confirm" ? "처리 중..." : isSettled ? "처리 완료" : approvalRequired ? "예약 확정" : "결제 확인"}
          </button>
          <button
            className="admin-action-button info"
            disabled={Boolean(busy)}
            onClick={() => patch({ action: "notify" }, "notify", "안내 메시지를 발송했습니다.")}
            type="button"
          >
            <RiMailSendLine size={14} />
            {busy === "notify" ? "발송 중..." : "안내 발송"}
          </button>
          <button
            className="admin-action-button danger"
            disabled={Boolean(busy) || isCanceled}
            onClick={() => setMode("reject")}
            type="button"
          >
            <RiCloseLine size={14} />
            {isCanceled ? "취소됨" : `${cancelWord} 처리`}
          </button>
        </>
      ) : (
        <form
          className="admin-inline-reject"
          data-admin-own-action
          onSubmit={(event) => {
            event.preventDefault();
            patch(
              isSettled ? { status: "cancelled", reason: rejectReason } : { status: "rejected", rejectReason },
              "reject",
              `${productLabel} 예약을 ${cancelWord} 처리했습니다.`,
            );
          }}
        >
          <label>
            <span>{cancelWord} 사유</span>
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
              {busy === "reject" ? "처리 중..." : `${cancelWord} 사유 전송`}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
