import { ReviewVisibilityForm } from "@/components/admin/ReviewVisibilityForm";
import type { AdminData } from "@/lib/admin/data";

export function ReviewVisibilityPage({ data }: { data: AdminData }) {
  return (
    <section className="admin-review-workbench">
      <article className="admin-review-queue">
        <div className="admin-creation-head">
          <span>Review moderation</span>
          <h2>후기 노출 여부를 한 번에 검수합니다.</h2>
          <p>체크한 후기는 상품 상세에 노출되고, 체크를 해제하면 숨김 처리됩니다.</p>
        </div>
        <ReviewVisibilityForm
          key={data.adminReviews.map((review) => `${review.id}:${review.status}`).join(",")}
          reviews={data.adminReviews}
        />
      </article>
      <aside className="admin-creation-side">
        <article className="admin-preview-stack">
          <span>검수 기준</span>
          <strong>개인정보, 신고, 상품 무관 내용을 확인합니다.</strong>
          <small>신고 접수·비노출 사유 기록·호스트 답변 요청은 저장할 곳과 발송 수단이 없어 아직 연결되지 않았습니다.</small>
        </article>
      </aside>
    </section>
  );
}
