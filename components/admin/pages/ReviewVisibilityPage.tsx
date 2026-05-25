import { AdminStatusBadge } from "@/components/admin/AdminPrimitives";
import { AdminEditorActions } from "@/components/admin/AdminLayoutPrimitives";
import type { AdminData } from "@/lib/admin/data";

export function ReviewVisibilityPage({ data }: { data: AdminData }) {
  return (
    <section className="admin-review-workbench">
      <article className="admin-review-queue">
        <div className="admin-creation-head">
          <span>Review moderation</span>
          <h2>후기 노출 여부와 신고 상태를 검수합니다.</h2>
        </div>
        {data.flatReviews.slice(0, 6).map((review, index) => (
          <label className="admin-review-reviewable" key={`${review.name}-${review.text}`}>
            <input defaultChecked={index < 4} type="checkbox" />
            <span>
              <strong>{review.name} · ★ {review.rating}</strong>
              <small>{review.text}</small>
            </span>
            <AdminStatusBadge tone={index < 4 ? "success" : "warning"}>{index < 4 ? "VISIBLE" : "PENDING"}</AdminStatusBadge>
          </label>
        ))}
      </article>
      <aside className="admin-creation-side">
        <article className="admin-preview-stack">
          <span>검수 기준</span>
          <strong>개인정보, 신고, 상품 무관 내용을 확인합니다.</strong>
          <textarea defaultValue="호스트 답변 요청 또는 비노출 사유를 남겨주세요." />
          <AdminEditorActions backHref="/admin/reviews" primaryLabel="노출 상태 저장" />
        </article>
      </aside>
    </section>
  );
}
