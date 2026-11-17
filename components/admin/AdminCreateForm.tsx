"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminSelect } from "@/components/admin/AdminPrimitives";
import { DatePicker } from "@/components/DatePicker";
import { notifyAdminToast } from "@/lib/admin/toast";
import { withBasePath } from "@/lib/paths";

export type AdminCreateField = {
  name: string;
  label: string;
  type: "text" | "number" | "textarea" | "select" | "date" | "weekdays" | "flag";
  defaultValue?: string | number | boolean | number[];
  /** select 전용 */
  options?: { value: string; label: string }[];
  /** select 전용: 값을 숫자로 보낸다(예: 상품 id) */
  numeric?: boolean;
  /** flag 전용: [켜짐 라벨, 꺼짐 라벨] */
  flagLabels?: [string, string];
  placeholder?: string;
  maxLength?: number;
  required?: boolean;
  wide?: boolean;
};

type AdminCreateFormProps = {
  endpoint: string;
  fields: AdminCreateField[];
  submitLabel: string;
  backHref: string;
  /** 요청에 항상 함께 보낼 고정 값 */
  fixed?: Record<string, string | number | boolean>;
};

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function initial(field: AdminCreateField): string | number[] {
  if (field.type === "weekdays") return Array.isArray(field.defaultValue) ? field.defaultValue : [];
  if (field.type === "flag") return field.defaultValue === false ? "0" : "1";
  if (field.type === "select") return String(field.defaultValue ?? field.options?.[0]?.value ?? "");
  // 날짜는 기본값이 없으면 오늘(한국 시간)로 시작한다. DatePicker의 기본 표시와 맞춘다.
  if (field.type === "date") return String(field.defaultValue ?? new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10));
  return field.defaultValue === undefined ? "" : String(field.defaultValue);
}

/** 등록 화면 공용 폼. 입력값을 POST로 보내 실제로 저장하고, 성공하면 목록으로 돌아간다. */
export function AdminCreateForm({ endpoint, fields, submitLabel, backHref, fixed }: AdminCreateFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string | number[]>>(() => Object.fromEntries(fields.map((field) => [field.name, initial(field)])));
  const [busy, setBusy] = useState(false);

  function set(name: string, value: string | number[]) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload: Record<string, unknown> = { ...fixed };

    for (const field of fields) {
      const value = values[field.name];
      if (field.type === "weekdays") payload[field.name] = value;
      else if (field.type === "flag") payload[field.name] = value === "1";
      else if (field.type === "number" || (field.type === "select" && field.numeric)) {
        const text = String(value).trim();
        if (!text) {
          if (field.required) {
            notifyAdminToast(`${field.label}을(를) 입력해 주세요.`, "error");
            return;
          }
          continue;
        }
        payload[field.name] = Number(text);
      } else {
        const text = String(value).trim();
        if (!text) {
          if (field.required) {
            notifyAdminToast(`${field.label}을(를) 입력해 주세요.`, "error");
            return;
          }
          continue;
        }
        payload[field.name] = text;
      }
    }

    setBusy(true);
    try {
      const response = await fetch(withBasePath(endpoint), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; message?: string };

      if (response.ok && data.ok !== false) {
        notifyAdminToast(data.message ?? "저장했습니다.", "success");
        router.push(backHref);
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
    <form data-admin-own-action onSubmit={submit}>
      <div className="admin-editor-field-grid">
        {fields.map((field) => {
          const value = values[field.name];
          const wide = field.wide || field.type === "textarea" || field.type === "weekdays";
          if (field.type === "weekdays") {
            const selected = value as number[];
            return (
              <div className="admin-editor-field" data-wide="true" key={field.name}>
                <span>{field.label}</span>
                <div className="admin-chip-options">
                  {WEEKDAYS.map((day, index) => (
                    <label key={day}>
                      <input
                        checked={selected.includes(index)}
                        onChange={(event) => set(field.name, event.target.checked ? [...selected, index] : selected.filter((item) => item !== index))}
                        type="checkbox"
                      />
                      {day}
                    </label>
                  ))}
                </div>
              </div>
            );
          }
          if (field.type === "date") {
            return (
              <div className="admin-editor-field" data-wide={wide ? "true" : undefined} key={field.name}>
                <span>{field.label}</span>
                <DatePicker className="admin-date-picker" defaultValue={String(value) || undefined} label={field.label} onChange={(date) => set(field.name, date)} />
              </div>
            );
          }
          return (
            <label className="admin-editor-field" data-wide={wide ? "true" : undefined} key={field.name}>
              <span>{field.label}</span>
              {field.type === "textarea" ? (
                <textarea maxLength={field.maxLength} onChange={(event) => set(field.name, event.target.value)} placeholder={field.placeholder} value={String(value)} />
              ) : field.type === "select" || field.type === "flag" ? (
                <AdminSelect onChange={(event) => set(field.name, event.target.value)} value={String(value)}>
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
                  placeholder={field.placeholder}
                  type={field.type === "number" ? "number" : "text"}
                  value={String(value)}
                />
              )}
            </label>
          );
        })}
      </div>
      <div className="admin-editor-actions">
        <Link className="admin-action-button ghost" href={backHref}>
          취소
        </Link>
        <button className="admin-action-button primary" disabled={busy} type="submit">
          {busy ? "저장 중..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
