"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSelect } from "@/components/admin/AdminPrimitives";
import { notifyAdminToast } from "@/lib/admin/toast";
import { withBasePath } from "@/lib/paths";

export type AdminBulkAction = {
  label: string;
  /** 행 id를 뒤에 붙여 PATCH할 주소. 예: /api/admin/products */
  endpoint?: string;
  payload?: Record<string, unknown>;
  /** 연결할 수 없는 동작이면 그 이유. 서버에 요청하지 않고 이유를 안내한다. */
  unlinked?: string;
};

/** 목록 상단 일괄 처리. 체크한 행의 실제 id마다 PATCH를 보내고 결과 건수를 알려 준다. */
export function AdminBulkBar({ actions }: { actions: AdminBulkAction[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState(0);
  const [busy, setBusy] = useState(false);
  const action = actions[selected];

  async function apply(event: React.MouseEvent<HTMLButtonElement>) {
    if (!action) return;
    if (action.unlinked || !action.endpoint) {
      notifyAdminToast(`"${action.label}"은(는) 아직 연결되지 않았습니다. ${action.unlinked ?? ""}`.trim(), "warning");
      return;
    }

    const shell = event.currentTarget.closest(".admin-list-shell");
    const rows = Array.from(shell?.querySelectorAll<HTMLTableRowElement>(".admin-data-table tbody tr") ?? []).filter(
      (row) => row.querySelector<HTMLInputElement>(".admin-table-check input")?.checked,
    );
    if (!rows.length) {
      notifyAdminToast("먼저 목록에서 처리할 항목을 선택해 주세요.", "warning");
      return;
    }
    if (!window.confirm(`선택한 ${rows.length}건에 "${action.label}"을(를) 적용할까요?`)) return;

    setBusy(true);
    let done = 0;
    let firstError = "";
    for (const row of rows) {
      try {
        const response = await fetch(withBasePath(`${action.endpoint}/${encodeURIComponent(row.dataset.rowId ?? "sample")}`), {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(action.payload ?? {}),
        });
        const data = (await response.json().catch(() => ({}))) as { ok?: boolean; message?: string };
        if (response.ok && data.ok !== false) done += 1;
        else if (!firstError) firstError = data.message ?? "처리하지 못했습니다.";
      } catch {
        if (!firstError) firstError = "네트워크 오류로 처리하지 못했습니다.";
      }
    }
    setBusy(false);

    const failed = rows.length - done;
    if (failed) notifyAdminToast(`${done}건 처리, ${failed}건 실패: ${firstError}`, done ? "warning" : "error");
    else notifyAdminToast(`${done}건에 "${action.label}"을(를) 적용했습니다.`, "success");
    if (done) router.refresh();
  }

  return (
    <span data-admin-own-action style={{ display: "contents" }}>
      <AdminSelect aria-label="일괄 처리 선택" onChange={(event) => setSelected(Number(event.target.value))} value={selected}>
        {actions.map((item, index) => (
          <option key={item.label} value={index}>
            {item.unlinked || !item.endpoint ? `${item.label} (미연결)` : item.label}
          </option>
        ))}
      </AdminSelect>
      <button className="admin-action-button ghost" disabled={busy} onClick={apply} type="button">
        {busy ? "처리 중..." : "일괄 적용"}
      </button>
    </span>
  );
}
