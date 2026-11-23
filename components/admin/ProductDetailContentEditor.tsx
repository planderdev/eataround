"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DETAIL_LIMITS,
  DETAIL_TYPES,
  DETAIL_TYPE_META,
  PRODUCT_TEXT_FIELDS,
  type DetailItem,
  type DetailType,
  type ProductTextFields,
  type ProductTextKey,
} from "@/lib/admin/product-details";
import { notifyAdminToast } from "@/lib/admin/toast";
import { withBasePath } from "@/lib/paths";

type Draft = DetailItem & { key: number };

let nextKey = 1;
const withKey = (item: DetailItem): Draft => ({ ...item, key: nextKey++ });
const FIELD_KEYS = Object.keys(PRODUCT_TEXT_FIELDS) as ProductTextKey[];

/**
 * 상품 상세 화면의 소개 칸과 항목(하이라이트·포함·불포함·안내·추천 대상·일정·포인트·코스·FAQ)을 고친다.
 * 열 때 서버에서 읽고, 저장하면 항목 전체를 이 순서대로 바꾼다.
 */
export function ProductDetailContentEditor({ productId }: { productId?: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error" | "sample">("idle");
  const [items, setItems] = useState<Draft[]>([]);
  const [fields, setFields] = useState<ProductTextFields>({});
  const [saved, setSaved] = useState<{ items: string; fields: string }>({ items: "[]", fields: "{}" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open || status !== "idle") return;
    if (!productId) {
      setStatus("sample");
      return;
    }
    setStatus("loading");
    fetch(withBasePath(`/api/admin/products/${productId}/details`))
      .then(async (response) => {
        const data = (await response.json().catch(() => ({}))) as { live?: boolean; items?: DetailItem[]; fields?: ProductTextFields; message?: string };
        if (!response.ok) throw new Error(data.message);
        if (!data.live) {
          setStatus("sample");
          return;
        }
        const loaded = (data.items ?? []).map(withKey);
        setItems(loaded);
        setFields(data.fields ?? {});
        setSaved({ items: serializeItems(loaded), fields: JSON.stringify(data.fields ?? {}) });
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [open, productId, status]);

  const dirty = serializeItems(items) !== saved.items || JSON.stringify(fields) !== saved.fields;

  function update(key: number, patch: Partial<DetailItem>) {
    setItems((current) => current.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  }

  function move(key: number, direction: -1 | 1) {
    setItems((current) => {
      const target = current.find((item) => item.key === key);
      if (!target) return current;
      const sameType = current.filter((item) => item.type === target.type);
      const index = sameType.indexOf(target);
      const swap = sameType[index + direction];
      if (!swap) return current;
      return current.map((item) => (item.key === target.key ? swap : item.key === swap.key ? target : item));
    });
  }

  async function save() {
    setBusy(true);
    try {
      const response = await fetch(withBasePath(`/api/admin/products/${productId}/details`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(({ key: _key, ...item }) => item),
          fields,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; message?: string };
      if (response.ok && data.ok !== false) {
        notifyAdminToast(data.message ?? "상세 내용을 저장했습니다.", "success");
        const cleaned = items.filter((item) => item.body.trim() || item.label?.trim());
        setItems(cleaned);
        setSaved({ items: serializeItems(cleaned), fields: JSON.stringify(fields) });
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
    <section className="admin-detail-content-editor" data-admin-own-action>
      <button aria-expanded={open} className="admin-action-button ghost" onClick={() => setOpen((value) => !value)} type="button">
        {open ? "상세 내용 편집 닫기" : "상세 내용 편집 (소개·포함·일정·코스·FAQ)"}
      </button>

      {open && status === "loading" ? <p className="admin-detail-content-note">불러오는 중입니다.</p> : null}
      {open && status === "error" ? <p className="admin-detail-content-note">상세 내용을 불러오지 못했습니다. 다시 열어 주세요.</p> : null}
      {open && status === "sample" ? (
        <p className="admin-detail-content-note">DB가 연결된 환경에서만 상세 내용을 고칠 수 있습니다.</p>
      ) : null}

      {open && status === "ready" ? (
        <>
          <div className="admin-quote-adjustment-panel">
            {FIELD_KEYS.map((key) => {
              const spec = PRODUCT_TEXT_FIELDS[key];
              const multiline = "multiline" in spec && spec.multiline;
              return (
                <label className={multiline ? "admin-quote-adjustment-panel-wide" : undefined} key={key}>
                  <span>
                    {spec.label}
                    {"required" in spec && spec.required ? " *" : ""}
                  </span>
                  {multiline ? (
                    <textarea maxLength={spec.max} onChange={(event) => setFields((current) => ({ ...current, [key]: event.target.value }))} value={fields[key] ?? ""} />
                  ) : (
                    <input maxLength={spec.max} onChange={(event) => setFields((current) => ({ ...current, [key]: event.target.value }))} value={fields[key] ?? ""} />
                  )}
                </label>
              );
            })}
          </div>

          {DETAIL_TYPES.map((type) => (
            <DetailTypeSection
              items={items.filter((item) => item.type === type)}
              key={type}
              onAdd={() => setItems((current) => [...current, withKey({ type, body: "" })])}
              onChange={update}
              onMove={move}
              onRemove={(key) => setItems((current) => current.filter((item) => item.key !== key))}
              type={type}
            />
          ))}

          <div className="admin-detail-content-actions">
            <small>{dirty ? "저장하지 않은 변경이 있습니다." : "저장된 내용과 같습니다."} 빈 줄은 저장하지 않습니다.</small>
            <button className="admin-action-button primary" disabled={busy || !dirty} onClick={save} type="button">
              {busy ? "저장 중..." : "상세 내용 저장"}
            </button>
          </div>
        </>
      ) : null}
    </section>
  );
}

function DetailTypeSection({
  type,
  items,
  onAdd,
  onChange,
  onMove,
  onRemove,
}: {
  type: DetailType;
  items: Draft[];
  onAdd: () => void;
  onChange: (key: number, patch: Partial<DetailItem>) => void;
  onMove: (key: number, direction: -1 | 1) => void;
  onRemove: (key: number) => void;
}) {
  const meta = DETAIL_TYPE_META[type];
  return (
    <fieldset className="admin-detail-content-type">
      <legend>
        {meta.title} <small>{meta.page} · {items.length}개</small>
      </legend>
      {items.map((item, index) => (
        <div className="admin-detail-content-row" key={item.key}>
          {meta.label ? (
            <input aria-label={meta.label} maxLength={DETAIL_LIMITS.label} onChange={(event) => onChange(item.key, { label: event.target.value })} placeholder={meta.label} value={item.label ?? ""} />
          ) : null}
          {meta.meta ? (
            <input aria-label={meta.meta} maxLength={DETAIL_LIMITS.meta} onChange={(event) => onChange(item.key, { meta: event.target.value })} placeholder={meta.meta} value={item.meta ?? ""} />
          ) : null}
          <textarea aria-label={meta.body} maxLength={DETAIL_LIMITS.body} onChange={(event) => onChange(item.key, { body: event.target.value })} placeholder={meta.body} rows={2} value={item.body} />
          {meta.note ? (
            <input aria-label={meta.note} maxLength={DETAIL_LIMITS.note} onChange={(event) => onChange(item.key, { note: event.target.value })} placeholder={meta.note} value={item.note ?? ""} />
          ) : null}
          <div className="admin-detail-content-row-actions">
            <button aria-label={`${meta.title} ${index + 1}번 위로`} className="admin-action-button ghost" disabled={index === 0} onClick={() => onMove(item.key, -1)} type="button">
              ↑
            </button>
            <button aria-label={`${meta.title} ${index + 1}번 아래로`} className="admin-action-button ghost" disabled={index === items.length - 1} onClick={() => onMove(item.key, 1)} type="button">
              ↓
            </button>
            <button aria-label={`${meta.title} ${index + 1}번 삭제`} className="admin-action-button danger" onClick={() => onRemove(item.key)} type="button">
              삭제
            </button>
          </div>
        </div>
      ))}
      {items.length < DETAIL_LIMITS.perType ? (
        <button className="admin-action-button ghost" onClick={onAdd} type="button">
          + {meta.title} 추가
        </button>
      ) : null}
    </fieldset>
  );
}

function serializeItems(items: Draft[]) {
  return JSON.stringify(items.map(({ key: _key, ...item }) => item));
}
