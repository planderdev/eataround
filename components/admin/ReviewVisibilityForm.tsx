"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminStatusBadge } from "@/components/admin/AdminPrimitives";
import { notifyAdminToast } from "@/lib/admin/toast";
import { withBasePath } from "@/lib/paths";

type Review = {
  id?: number;
  product: string;
  name: string;
  rating: number;
  text: string;
  status: "pending" | "approved" | "hidden";
};

/** 리뷰 노출 여부를 한 화면에서 체크해 한 번에 저장한다. 체크 = 노출 승인, 해제 = 숨김. */
export function ReviewVisibilityForm({ reviews }: { reviews: Review[] }) {
  const router = useRouter();
  const [checked, setChecked] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(reviews.map((review, index) => [String(review.id ?? `sample-${index}`), review.status === "approved"])),
  );
  const [busy, setBusy] = useState(false);

  const changes = reviews
    .map((review, index) => ({ review, key: String(review.id ?? `sample-${index}`) }))
    .filter(({ review, key }) => checked[key] !== (review.status === "approved"));

  async function save() {
    setBusy(true);
    let done = 0;
    let firstError = "";
    for (const { key } of changes) {
      try {
        const response = await fetch(withBasePath(`/api/admin/reviews/${encodeURIComponent(key)}`), {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: checked[key] ? "approved" : "hidden" }),
        });
        const data = (await response.json().catch(() => ({}))) as { ok?: boolean; message?: string };
        if (response.ok && data.ok !== false) done += 1;
        else if (!firstError) firstError = data.message ?? "처리하지 못했습니다.";
      } catch {
        if (!firstError) firstError = "네트워크 오류로 처리하지 못했습니다.";
      }
    }
    setBusy(false);

    const failed = changes.length - done;
    if (failed) notifyAdminToast(`${done}건 저장, ${failed}건 실패: ${firstError}`, done ? "warning" : "error");
    else notifyAdminToast(`리뷰 ${done}건의 노출 상태를 저장했습니다.`, "success");
    if (done) router.refresh();
  }

  return (
    <div data-admin-own-action>
      {reviews.length ? (
        reviews.map((review, index) => {
          const key = String(review.id ?? `sample-${index}`);
          return (
            <label className="admin-review-reviewable" key={key}>
              <input checked={checked[key] ?? false} onChange={(event) => setChecked((current) => ({ ...current, [key]: event.target.checked }))} type="checkbox" />
              <span>
                <strong>
                  {review.name} · ★ {review.rating} · {review.product}
                </strong>
                <small>{review.text}</small>
              </span>
              <AdminStatusBadge tone={review.status === "approved" ? "success" : review.status === "pending" ? "warning" : "danger"}>
                {review.status === "approved" ? "노출중" : review.status === "pending" ? "검수대기" : "숨김"}
              </AdminStatusBadge>
            </label>
          );
        })
      ) : (
        <p>등록된 리뷰가 없습니다.</p>
      )}
      <div className="admin-editor-actions">
        <Link className="admin-action-button ghost" href="/admin/reviews">
          목록으로
        </Link>
        <button className="admin-action-button primary" disabled={busy || !changes.length} onClick={save} type="button">
          {busy ? "저장 중..." : `노출 상태 저장${changes.length ? ` (${changes.length}건)` : ""}`}
        </button>
      </div>
    </div>
  );
}
