"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSelect } from "@/components/admin/AdminPrimitives";
import { notifyAdminToast } from "@/lib/admin/toast";
import { withBasePath } from "@/lib/paths";

export type AdminRowEditorField = {
  name: string;
  label: string;
  type: "text" | "number" | "textarea" | "select" | "flag";
  value: string | number | boolean | null | undefined;
  /** select 전용 */
  options?: { value: string; label: string }[];
  /** flag 전용: [켜짐 라벨, 꺼짐 라벨] */
  flagLabels?: [string, string];
  /** number 전용: 비워 두면 null로 저장 */
  nullable?: boolean;
  maxLength?: number;
  wide?: boolean;
};

type AdminRowEditorProps = {
  /** 예: /api/admin/banners/12. 실제 DB 행 id가 들어간 주소여야 한다. */
  endpoint: string;
  fields: AdminRowEditorField[];
  saveLabel?: string;
};

function toDraft(field: AdminRowEditorField) {
  if (field.type === "flag") return field.value ? "1" : "0";
  return field.value === null || field.value === undefined ? "" : String(field.value);
}

/** 목록 행 상세에서 바뀐 필드만 PATCH로 저장하고 목록을 새로 읽는다. */
export function AdminRowEditor({ endpoint, fields, saveLabel = "변경 저장" }: AdminRowEditorProps) {
  const router = useRouter();
  const [draft, setDraft] = useState<Record<string, string>>(() => Object.fromEntries(fields.map((field) => [field.name, toDraft(field)])));
  const [busy, setBusy] = useState(false);

  const changed = fields.filter((field) => draft[field.name] !== toDraft(field));

  function set(name: string, value: string) {
    setDraft((current) => ({ ...current, [name]: value }));
  }

  async function save() {
    const payload: Record<string, unknown> = {};
    for (const field of changed) {
      const value = draft[field.name];
      if (field.type === "flag") payload[field.name] = value === "1";
      else if (field.type === "number") {
        if (value.trim() === "") {
          if (!field.nullable) {
            notifyAdminToast(`${field.label}을(를) 입력해 주세요.`, "error");
            return;
          }
          payload[field.name] = null;
        } else payload[field.name] = Number(value);
      } else payload[field.name] = value;
    }

    setBusy(true);
    try {
      const response = await fetch(withBasePath(endpoint), {
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
    <div className="admin-quote-adjustment-panel" data-admin-own-action>
      {fields.map((field) => (
        <label className={field.wide || field.type === "textarea" ? "admin-quote-adjustment-panel-wide" : undefined} key={field.name}>
          <span>{field.label}</span>
          {field.type === "textarea" ? (
            <textarea maxLength={field.maxLength} onChange={(event) => set(field.name, event.target.value)} value={draft[field.name]} />
          ) : field.type === "select" || field.type === "flag" ? (
            <AdminSelect onChange={(event) => set(field.name, event.target.value)} value={draft[field.name]}>
              {(field.type === "flag"
                ? [
                    { value: "1", label: field.flagLabels?.[0] ?? "노출" },
                    { value: "0", label: field.flagLabels?.[1] ?? "비공개" },
                  ]
                : field.options ?? []
              ).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </AdminSelect>
          ) : (
            <input
              inputMode={field.type === "number" ? "numeric" : undefined}
              maxLength={field.maxLength}
              onChange={(event) => set(field.name, event.target.value)}
              type={field.type === "number" ? "number" : "text"}
              value={draft[field.name]}
            />
          )}
        </label>
      ))}
      <button className="admin-action-button primary" disabled={busy || !changed.length} onClick={save} type="button">
        {busy ? "저장 중..." : saveLabel}
      </button>
    </div>
  );
}
