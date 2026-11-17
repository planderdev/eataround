"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploadButton } from "@/components/admin/ImageUploadButton";
import { notifyAdminToast } from "@/lib/admin/toast";
import { withBasePath } from "@/lib/paths";

export type GalleryImage = { id: number; imageUrl: string; alt: string };

type ProductGalleryEditorProps = {
  /** DB 상품 id. 샘플 데이터에는 없다. */
  productId?: number;
  images: GalleryImage[];
  /** 현재 상품 대표 이미지 주소. 갤러리 사진 중 대표인 것을 표시한다. */
  primaryImageUrl: string;
  maxImages: number;
};

/** 상품 갤러리 편집: 여러 장 올리기, 순서 바꾸기, 대표 지정, 빼기. 누를 때마다 바로 저장하고 목록을 새로 읽는다. */
export function ProductGalleryEditor({ productId, images, primaryImageUrl, maxImages }: ProductGalleryEditorProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [urlDraft, setUrlDraft] = useState("");
  const base = `/api/admin/products/${productId ?? "sample"}/images`;
  const full = images.length >= maxImages;

  async function call(path: string, method: "POST" | "PATCH" | "DELETE", body?: unknown, quiet = false) {
    setBusy(true);
    try {
      const response = await fetch(withBasePath(path), {
        method,
        headers: { "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; message?: string };
      const ok = response.ok && data.ok !== false;
      if (!ok) notifyAdminToast(data.message ?? "처리 중 문제가 발생했습니다.", "error");
      else if (!quiet) notifyAdminToast(data.message ?? "저장했습니다.", "success");
      if (ok) router.refresh();
      return ok;
    } catch {
      notifyAdminToast("네트워크 오류로 처리하지 못했습니다.", "error");
      return false;
    } finally {
      setBusy(false);
    }
  }

  function move(index: number, delta: number) {
    const next = images.map((image) => image.id);
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    void call(base, "PATCH", { order: next });
  }

  async function addByUrl() {
    const url = urlDraft.trim();
    if (!url) return;
    if (await call(base, "POST", { imageUrl: url })) setUrlDraft("");
  }

  return (
    <section className="admin-gallery-editor" data-admin-own-action aria-label="상품 갤러리">
      <header>
        <strong>갤러리</strong>
        <small>
          {images.length}/{maxImages}장 · 상세 화면의 사진 영역에 순서대로 쓰입니다. 비어 있으면 기본 사진이 보입니다.
        </small>
      </header>
      {images.length ? (
        <ol>
          {images.map((image, index) => {
            const isPrimary = image.imageUrl === primaryImageUrl;
            return (
              <li key={image.id}>
                <img alt={image.alt} decoding="async" loading="lazy" src={image.imageUrl} />
                <div>
                  <span>
                    {index + 1}번째{isPrimary ? " · 대표" : ""}
                  </span>
                  <div className="admin-gallery-editor-actions">
                    <button aria-label={`${index + 1}번째 사진을 앞으로`} className="admin-action-button ghost" disabled={busy || index === 0} onClick={() => move(index, -1)} type="button">
                      앞으로
                    </button>
                    <button
                      aria-label={`${index + 1}번째 사진을 뒤로`}
                      className="admin-action-button ghost"
                      disabled={busy || index === images.length - 1}
                      onClick={() => move(index, 1)}
                      type="button"
                    >
                      뒤로
                    </button>
                    <button
                      aria-label={`${index + 1}번째 사진을 대표로 지정`}
                      className="admin-action-button secondary"
                      disabled={busy || isPrimary}
                      onClick={() => void call(`${base}/${image.id}`, "PATCH", { primary: true })}
                      type="button"
                    >
                      {isPrimary ? "대표 이미지" : "대표로 지정"}
                    </button>
                    <button
                      aria-label={`${index + 1}번째 사진 빼기`}
                      className="admin-action-button danger"
                      disabled={busy}
                      onClick={() => void call(`${base}/${image.id}`, "DELETE")}
                      type="button"
                    >
                      빼기
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <p>등록된 갤러리 사진이 없습니다.</p>
      )}
      {full ? (
        <small>상품당 {maxImages}장까지 넣을 수 있습니다. 사진을 뺀 뒤 추가해 주세요.</small>
      ) : (
        <div className="admin-gallery-editor-add">
          <ImageUploadButton
            folder="products"
            label="사진 여러 장 올리기"
            maxFiles={maxImages - images.length}
            multiple
            onUploaded={(url) => call(base, "POST", { imageUrl: url }, true)}
          />
          <div className="admin-gallery-editor-url">
            <input aria-label="갤러리에 넣을 이미지 주소" onChange={(event) => setUrlDraft(event.target.value)} placeholder="또는 이미지 주소 입력 (https://...)" type="text" value={urlDraft} />
            <button className="admin-action-button ghost" disabled={busy || !urlDraft.trim()} onClick={() => void addByUrl()} type="button">
              주소로 추가
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
