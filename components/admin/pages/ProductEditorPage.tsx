import { RiSave3Line } from "@remixicon/react";
import { AdminProductForm } from "@/components/admin/AdminProductForm";
import type { AdminData } from "@/lib/admin/data";

export function ProductEditorPage({ data }: { data: AdminData }) {
  return (
    <section className="admin-editor-layout">
      <article className="admin-card admin-editor-main">
        <div className="admin-tabs" role="tablist" aria-label="상품 등록 단계">
          {["기본정보", "미디어", "상세 콘텐츠", "가격·예약", "회차·재고", "연관 설정"].map((tab, index) => (
            <button aria-selected={index === 0} className="admin-tab" data-active={index === 0} key={tab} role="tab" tabIndex={index === 0 ? 0 : -1} type="button">
              {tab}
            </button>
          ))}
        </div>
        <AdminProductForm />
      </article>
      <aside className="admin-editor-aside">
        <article className="admin-card">
          <span>등록 체크</span>
          <strong>프론트 노출 전 확인</strong>
          <ul className="admin-checklist">
            <li>세로형 썸네일과 상세 이미지 등록</li>
            <li>예약 유형과 승인 필요 여부 확인</li>
            <li>팀 단위 재고와 캘린더 노출 확인</li>
          </ul>
          <button className="admin-action-button primary" type="button">
            <RiSave3Line size={16} />
            상품 저장
          </button>
        </article>
        <article className="admin-card">
          <span>회차 미리보기</span>
          <div className="admin-schedule-mini-list">
            {data.experiences.slice(0, 2).flatMap((experience) =>
              experience.schedules.slice(0, 2).map((schedule) => (
                <p key={`${experience.slug}-${schedule.date}-${schedule.label}`}>
                  <b>{schedule.date}</b>
                  <span>{schedule.label} · {schedule.reservedTeams ?? 0}/{schedule.maxTeams ?? 4}팀</span>
                </p>
              )),
            )}
          </div>
        </article>
      </aside>
    </section>
  );
}
