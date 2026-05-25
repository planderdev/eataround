import Link from "next/link";
import { AdminSelect } from "@/components/admin/AdminPrimitives";
import {
  ActionIcon,
  actionVariant,
} from "@/components/admin/AdminLayoutPrimitives";
import { getAdminRouteConfig } from "@/lib/admin";
import type { AdminData } from "@/lib/admin/data";
import { workflowCopy } from "@/lib/admin/route-meta";

export function AdminWorkflowPage({ actionKey, data }: { actionKey: string; data: AdminData }) {
  const config = getAdminRouteConfig(actionKey);
  if (!config) return null;
  const parentHref = `/${["admin", ...actionKey.split("/").slice(0, -1)].join("/")}`;
  const detail = workflowCopy[actionKey] ?? {
    backHref: parentHref,
    scope: config.eyebrow,
    fields: ["대상", "상태", "담당자", "메모"],
    checklist: ["입력값 검토", "프론트 노출 영향 확인", "작업 로그 저장"],
  };
  const referenceCount = actionKey.startsWith("reservations")
    ? data.reservations.length
    : actionKey.startsWith("quotes")
      ? data.quoteRequests.length
      : actionKey.startsWith("events")
        ? data.events.length
        : actionKey.startsWith("members")
          ? data.members.length
          : actionKey.startsWith("journal")
            ? data.journals.length
            : data.experiences.length;

  return (
    <section className="admin-workflow-detail">
      <nav className="admin-workflow-back" aria-label="관리자 상세 탐색">
        <Link href={detail.backHref}>목록으로 돌아가기</Link>
      </nav>
      <div className="admin-workflow-hero">
        <div>
          <span>{detail.scope}</span>
          <h2>{config.title}</h2>
          <p>{config.description}</p>
        </div>
        <dl>
          <div>
            <dt>참조 데이터</dt>
            <dd>{referenceCount.toLocaleString("ko-KR")}건</dd>
          </div>
          <div>
            <dt>처리 방식</dt>
            <dd>검토 후 저장</dd>
          </div>
        </dl>
      </div>
      <div className="admin-workflow-layout">
        <article className="admin-workflow-form-panel">
          <div className="admin-card-header">
            <div>
              <span>입력 정보</span>
              <h2>{config.title} 상세 설정</h2>
            </div>
          </div>
          <div className="admin-workflow-fields">
            {detail.fields.map((field, index) => (
              <label data-wide={/(본문|메시지|요약|안내|메모)/.test(field)} key={field}>
                <span>{field}</span>
                {/(상태|역할|슬롯|형식|구분|정책|요일|노출|예약|권한)/.test(field) ? (
                  <AdminSelect defaultValue="">
                    <option value="">선택</option>
                    <option value="primary">기본값</option>
                    <option value="review">검토 필요</option>
                  </AdminSelect>
                ) : /(본문|메시지|요약|안내|메모)/.test(field) ? (
                  <textarea placeholder={`${field}을 입력하세요.`} />
                ) : (
                  <input placeholder={index === 0 ? `${field} 검색 또는 입력` : `${field} 입력`} />
                )}
              </label>
            ))}
          </div>
          <div className="admin-workflow-actions">
            <Link className="admin-action-button ghost" href={detail.backHref}>
              취소
            </Link>
            <button className={`admin-action-button ${actionVariant(config.primaryAction ?? config.title, true)}`} type="button">
              <ActionIcon label={config.primaryAction ?? config.title} />
              {config.primaryAction ?? "저장"}
            </button>
          </div>
        </article>
        <aside className="admin-workflow-side-panel">
          <div>
            <span>처리 체크리스트</span>
            <strong>저장 전 확인</strong>
          </div>
          <ol>
            {detail.checklist.map((checkpoint) => (
              <li key={checkpoint}>{checkpoint}</li>
            ))}
          </ol>
          <p>프론트 데이터와 관리자 DB가 같은 업무 단위로 연결될 수 있도록 필드와 검수 기준을 분리했습니다.</p>
        </aside>
      </div>
    </section>
  );
}
