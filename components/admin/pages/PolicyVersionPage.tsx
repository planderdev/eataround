import { AdminSelect } from "@/components/admin/AdminPrimitives";
import {
  AdminEditorActions,
  AdminField,
} from "@/components/admin/AdminLayoutPrimitives";
import { DatePicker } from "@/components/DatePicker";

export function PolicyVersionPage() {
  return (
    <section className="admin-journal-editor" data-variant="policy">
      <article className="admin-journal-canvas">
        <div className="admin-creation-head">
          <span>Policy version</span>
          <h2>푸터 모달에 노출될 새 약관 버전을 작성합니다.</h2>
        </div>
        <div className="admin-editor-field-grid">
          <AdminField label="정책 종류">
            <AdminSelect defaultValue="terms">
              <option value="terms">이용약관</option>
              <option value="privacy">개인정보처리방침</option>
              <option value="refund">취소·환불 규정</option>
            </AdminSelect>
          </AdminField>
          <AdminField label="버전">
            <input defaultValue="v1.1" />
          </AdminField>
          <AdminField label="시행일">
            <DatePicker className="admin-date-picker" defaultValue="2026-06-01" label="시행일" />
          </AdminField>
          <AdminField label="상태">
            <AdminSelect defaultValue="scheduled">
              <option value="draft">임시저장</option>
              <option value="scheduled">예약 발행</option>
              <option value="published">즉시 발행</option>
            </AdminSelect>
          </AdminField>
          <AdminField label="변경 요약" wide>
            <textarea defaultValue="회원 가입, 예약, 환불 안내 문구를 최신 운영 정책에 맞게 정리했습니다." />
          </AdminField>
          <AdminField label="본문" wide>
            <textarea
              className="admin-journal-body-input"
              defaultValue={"제1조 목적\n본 약관은 이더라운드 서비스 이용과 관련한 권리와 의무를 정합니다."}
            />
          </AdminField>
        </div>
        <AdminEditorActions backHref="/admin/settings/policies" primaryLabel="새 버전 발행" />
      </article>
      <aside className="admin-journal-side">
        <article className="admin-preview-stack">
          <span>발행 체크</span>
          <ol className="admin-checklist">
            <li>푸터 모달 내용 반영</li>
            <li>이전 버전 보관</li>
            <li>시행일 예약 발행</li>
          </ol>
        </article>
      </aside>
    </section>
  );
}
