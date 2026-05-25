import { AdminSelect } from "@/components/admin/AdminPrimitives";
import {
  AdminEditorActions,
  AdminField,
} from "@/components/admin/AdminLayoutPrimitives";
import { DatePicker } from "@/components/DatePicker";

export function AdminInvitePage() {
  return (
    <section className="admin-creation-layout" data-variant="invite">
      <article className="admin-creation-main">
        <div className="admin-creation-head">
          <span>Admin invite</span>
          <h2>운영 담당자의 접근 권한을 설정합니다.</h2>
          <p>계정 초대와 동시에 접근 가능한 메뉴, 승인 권한, 알림 수신 범위를 지정합니다.</p>
        </div>
        <div className="admin-editor-field-grid">
          <AdminField label="이름">
            <input placeholder="담당자 이름" />
          </AdminField>
          <AdminField label="이메일">
            <input placeholder="ops@eataround.co.kr" type="email" />
          </AdminField>
          <AdminField label="권한">
            <AdminSelect defaultValue="OPERATOR">
              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
              <option value="OPERATOR">OPERATOR</option>
              <option value="CONTENT_MANAGER">CONTENT_MANAGER</option>
            </AdminSelect>
          </AdminField>
          <AdminField label="초대 만료일">
            <DatePicker className="admin-date-picker" defaultValue="2026-05-29" label="초대 만료일" />
          </AdminField>
          <AdminField label="접근 메뉴" wide>
            <div className="admin-chip-options">
              {["예약관리", "상품관리", "행사관리", "배너관리", "견적관리"].map((item) => (
                <label key={item}>
                  <input defaultChecked type="checkbox" />
                  {item}
                </label>
              ))}
            </div>
          </AdminField>
        </div>
        <AdminEditorActions backHref="/admin/settings/admins" primaryLabel="초대 메일 발송" />
      </article>
      <aside className="admin-creation-side">
        <article className="admin-preview-stack">
          <span>보안 안내</span>
          <strong>SUPER_ADMIN만 계정과 정책 메뉴를 수정할 수 있습니다.</strong>
          <p>초대 수락 전에는 비활성 상태로 표시되고, 모든 권한 변경은 감사 로그로 남습니다.</p>
        </article>
      </aside>
    </section>
  );
}
