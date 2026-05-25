"use client";

import { useState } from "react";
import { RiCheckLine, RiCloseLine, RiMailSendLine } from "@remixicon/react";
import { notifyAdminToast } from "@/lib/admin/toast";
import { withBasePath } from "@/lib/paths";

type MemberApprovalInlineProps = {
  memberId: string;
  memberLabel: string;
  status: "pending" | "approved" | "rejected" | "active" | "inactive";
};

type Mode = "idle" | "reject";

export function MemberApprovalInline({ memberId, memberLabel, status }: MemberApprovalInlineProps) {
  const [mode, setMode] = useState<Mode>("idle");
  const [rejectReason, setRejectReason] = useState("");
  const [busy, setBusy] = useState<"approve" | "reject" | "notify" | null>(null);
  const [resolvedStatus, setResolvedStatus] = useState(status);

  async function patch(payload: { action: "approve" | "reject" | "notify"; rejectReason?: string }, busyKey: NonNullable<typeof busy>, successMessage: string, nextStatus?: typeof resolvedStatus) {
    setBusy(busyKey);
    try {
      const response = await fetch(withBasePath(`/api/admin/members/${encodeURIComponent(memberId)}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; message?: string };

      if (response.ok && data.ok !== false) {
        notifyAdminToast(data.message ?? successMessage, "success");
        if (nextStatus) setResolvedStatus(nextStatus);
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

  const isApproved = resolvedStatus === "approved" || resolvedStatus === "active";
  const isRejected = resolvedStatus === "rejected" || resolvedStatus === "inactive";

  if (mode === "reject") {
    return (
      <form
        className="admin-inline-reject"
        onSubmit={(event) => {
          event.preventDefault();
          patch({ action: "reject", rejectReason }, "reject", `${memberLabel} 가입 요청을 반려했습니다.`, "rejected");
        }}
      >
        <label>
          <span>반려 사유</span>
          <textarea
            autoFocus
            maxLength={300}
            onChange={(event) => setRejectReason(event.target.value)}
            placeholder="회원에게 함께 안내될 사유를 입력하세요."
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
            {busy === "reject" ? "처리 중..." : "반려 사유 전송"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="admin-inline-actions" data-mode="idle">
      <button
        className="admin-action-button secondary"
        disabled={Boolean(busy) || isApproved}
        onClick={() => patch({ action: "approve" }, "approve", `${memberLabel} 가입을 승인했습니다.`, "approved")}
        type="button"
      >
        <RiCheckLine size={14} />
        {busy === "approve" ? "처리 중..." : isApproved ? "승인 완료" : "승인 처리"}
      </button>
      <button
        className="admin-action-button info"
        disabled={Boolean(busy)}
        onClick={() => patch({ action: "notify" }, "notify", `${memberLabel}에 안내를 발송했습니다.`)}
        type="button"
      >
        <RiMailSendLine size={14} />
        {busy === "notify" ? "발송 중..." : "안내 발송"}
      </button>
      <button
        className="admin-action-button danger"
        disabled={Boolean(busy) || isRejected}
        onClick={() => setMode("reject")}
        type="button"
      >
        <RiCloseLine size={14} />
        {isRejected ? "반려됨" : "반려"}
      </button>
    </div>
  );
}
