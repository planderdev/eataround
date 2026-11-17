"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSelect } from "@/components/admin/AdminPrimitives";
import { notifyAdminToast } from "@/lib/admin/toast";
import { withBasePath } from "@/lib/paths";

const STATUS_OPTIONS = [
  { value: "requested", label: "요청접수" },
  { value: "reviewing", label: "검토중" },
  { value: "sent", label: "발송완료" },
  { value: "accepted", label: "수락완료" },
  { value: "closed", label: "종료" },
];

type QuoteStatusEditorProps = {
  quoteId: string;
  statusCode?: string;
  adminMemo?: string;
  estimatedTotal?: number;
};

/** 견적 상태와 관리자 메모를 저장한다. 저장 버튼은 자체 처리하므로 셸의 공용 버튼 처리에서 제외된다. */
export function QuoteStatusEditor({ quoteId, statusCode, adminMemo, estimatedTotal }: QuoteStatusEditorProps) {
  const router = useRouter();
  const [status, setStatus] = useState(STATUS_OPTIONS.some((option) => option.value === statusCode) ? (statusCode as string) : "requested");
  const [memo, setMemo] = useState(adminMemo ?? "");
  const [total, setTotal] = useState(estimatedTotal === undefined ? "" : String(estimatedTotal));
  const [busy, setBusy] = useState(false);

  async function save() {
    const payload: { status: string; adminMemo: string; estimatedTotal?: number } = { status, adminMemo: memo };
    if (total.trim() !== "" && Number(total) !== estimatedTotal) {
      if (!Number.isInteger(Number(total)) || Number(total) < 0) {
        notifyAdminToast("견적 금액은 0 이상의 정수로 입력해 주세요.", "error");
        return;
      }
      payload.estimatedTotal = Number(total);
    }
    setBusy(true);
    try {
      const response = await fetch(withBasePath(`/api/admin/quotes/${encodeURIComponent(quoteId)}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; message?: string };

      if (response.ok && data.ok !== false) {
        notifyAdminToast(data.message ?? "견적 정보를 저장했습니다.", "success");
        router.refresh();
        return;
      }
      notifyAdminToast(data.message ?? "처리 중 문제가 발생했습니다.", "error");
    } catch {
      notifyAdminToast("네트워크 오류로 처리하지 못했습니다.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <label>
        <span>관리자 조정 금액</span>
        <input inputMode="numeric" onChange={(event) => setTotal(event.target.value)} placeholder="최종 견적 금액" type="number" value={total} />
      </label>
      <label>
        <span>상태</span>
        <AdminSelect onChange={(event) => setStatus(event.target.value)} value={status}>
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </AdminSelect>
      </label>
      <label className="admin-quote-adjustment-panel-wide">
        <span>관리자 메모</span>
        <textarea maxLength={500} onChange={(event) => setMemo(event.target.value)} placeholder="내부 확인 사항을 남겨 주세요." value={memo} />
      </label>
      <button className="admin-action-button primary" data-admin-own-action disabled={busy} onClick={save} type="button">
        {busy ? "저장 중..." : "금액·상태·메모 저장"}
      </button>
    </>
  );
}
