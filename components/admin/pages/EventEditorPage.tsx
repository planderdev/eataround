import {
  AdminSelect,
} from "@/components/admin/AdminPrimitives";
import {
  AdminEditorActions,
  AdminField,
} from "@/components/admin/AdminLayoutPrimitives";
import { DatePicker } from "@/components/DatePicker";
import type { AdminData } from "@/lib/admin/data";

export function EventEditorPage({ data, closed }: { data: AdminData; closed: boolean }) {
  return (
    <section className="admin-creation-layout" data-variant="event">
      <article className="admin-creation-main">
        <div className="admin-creation-head">
          <span>{closed ? "Event result" : "Event campaign"}</span>
          <h2>{closed ? "종료된 행사를 포트폴리오로 정리합니다." : "모집 중인 행사 페이지를 구성합니다."}</h2>
          <p>{closed ? "성과 이미지, 참여 후기, 결과 요약을 남겨 기관 영업 자료로 재활용합니다." : "행사 소개, 모집 기간, 신청 CTA, 연결 배너를 한 화면에서 설정합니다."}</p>
        </div>
        <div className="admin-editor-field-grid">
          <AdminField label="행사명" wide>
            <input defaultValue={data.events[0]?.title ?? "제주 로컬테이블 위크"} />
          </AdminField>
          <AdminField label={closed ? "진행일" : "모집 시작일"}>
            <DatePicker className="admin-date-picker" defaultValue="2026-05-22" label={closed ? "진행일" : "모집 시작일"} />
          </AdminField>
          <AdminField label={closed ? "결과 공개일" : "모집 종료일"}>
            <DatePicker className="admin-date-picker" defaultValue="2026-06-13" label={closed ? "결과 공개일" : "모집 종료일"} />
          </AdminField>
          <AdminField label="장소">
            <input defaultValue="서귀포 로컬 키친" />
          </AdminField>
          <AdminField label="상태">
            <AdminSelect defaultValue={closed ? "closed" : "ongoing"}>
              <option value="ongoing">진행중</option>
              <option value="ready">예약중</option>
              <option value="closed">종료</option>
            </AdminSelect>
          </AdminField>
          <AdminField label={closed ? "결과 요약" : "행사 소개"} wide>
            <textarea defaultValue={closed ? "참여 인원, 현장 사진, 만족도와 후속 요청을 요약합니다." : "지역 호스트와 함께하는 모집형 로컬 행사입니다."} />
          </AdminField>
        </div>
        <AdminEditorActions backHref={closed ? "/admin/events/closed" : "/admin/events/ongoing"} primaryLabel={closed ? "결과 저장" : "행사 저장"} />
      </article>
      <aside className="admin-creation-side">
        <article className="admin-preview-stack">
          <span>{closed ? "포트폴리오 미리보기" : "행사 카드 미리보기"}</span>
          <img alt="" src={data.events[0]?.image} loading="lazy" decoding="async" />
          <strong>{data.events[0]?.title}</strong>
          <small>{closed ? "종료된 행사 리스트와 상세 결과에 노출됩니다." : "진행중 행사 리스트와 홈 섹션에 노출됩니다."}</small>
        </article>
      </aside>
    </section>
  );
}
