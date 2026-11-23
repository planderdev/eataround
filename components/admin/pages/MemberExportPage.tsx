import { withBasePath } from "@/lib/paths";

const EXPORTS = [
  { type: "general", title: "일반회원", note: "개인 회원 전체" },
  { type: "corporate", title: "기업·단체회원", note: "기관명·사업자번호·승인 상태 포함" },
  { type: "all", title: "전체 회원", note: "관리자 계정 제외" },
];

/** 회원 목록을 CSV 파일로 내려받는다. 파일에 개인정보가 들어 있으므로 받은 뒤 관리에 주의한다. */
export function MemberExportPage({ live }: { live: boolean }) {
  return (
    <section className="admin-workflow-detail">
      <div className="admin-workflow-layout">
        <article className="admin-workflow-form-panel">
          <div className="admin-card-header">
            <div>
              <span>CSV 내보내기</span>
              <h2>회원 목록 내려받기</h2>
            </div>
          </div>
          <p role="note">
            파일에는 이름·이메일·연락처가 들어 있습니다. 내려받은 파일은 필요한 사람에게만 공유하고 쓴 뒤에는 지워 주세요.
            {live ? null : " DB가 연결되지 않은 환경에서는 내려받을 수 없습니다."}
          </p>
          <div className="admin-member-export-list">
            {EXPORTS.map((item) => (
              <a
                aria-disabled={!live}
                className="admin-action-button primary"
                data-admin-own-action
                download
                href={live ? withBasePath(`/api/admin/members/export?type=${item.type}`) : undefined}
                key={item.type}
              >
                {item.title} CSV
                <small>{item.note}</small>
              </a>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
