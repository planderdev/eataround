"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSelect } from "@/components/admin/AdminPrimitives";
import { notifyAdminToast } from "@/lib/admin/toast";
import { withBasePath } from "@/lib/paths";

const STATUS_OPTIONS = [
  { value: "open", label: "답변 대기" },
  { value: "answered", label: "답변 완료" },
  { value: "closed", label: "상담 종료" },
];

type InquiryAnswerEditorProps = {
  inquiryId: string;
  statusCode: string;
  answer: string;
};

/** 문의 답변과 상태를 저장한다. 저장 버튼은 자체 처리하므로 셸의 공용 버튼 처리에서 제외된다. */
export function InquiryAnswerEditor({ inquiryId, statusCode, answer }: InquiryAnswerEditorProps) {
  const router = useRouter();
  const [text, setText] = useState(answer);
  const [status, setStatus] = useState(statusCode);
  const [busy, setBusy] = useState(false);

  async function save() {
    const payload: { status: string; answer?: string } = { status };
    if (text.trim() !== answer.trim()) payload.answer = text;
    // 답변을 새로 쓰고 상태를 그대로 두었다면 답변 완료로 바꾼다.
    if (payload.answer?.trim() && status === "open") payload.status = "answered";

    setBusy(true);
    try {
      const response = await fetch(withBasePath(`/api/admin/inquiries/${encodeURIComponent(inquiryId)}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; message?: string };
      if (response.ok && data.ok !== false) {
        notifyAdminToast(data.message ?? "저장했습니다.", "success");
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
      <label className="admin-quote-adjustment-panel-wide">
        <span>답변</span>
        <textarea maxLength={2000} onChange={(event) => setText(event.target.value)} placeholder="고객 마이페이지 문의 내역에 보일 답변을 입력해 주세요." value={text} />
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
      <button className="admin-action-button primary" data-admin-own-action disabled={busy} onClick={save} type="button">
        {busy ? "저장 중..." : "답변·상태 저장"}
      </button>
    </>
  );
}
