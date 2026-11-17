import { AdminBulkBar, type AdminBulkAction } from "@/components/admin/AdminBulkBar";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  RiAddLine,
  RiEdit2Line,
  RiFilePdf2Line,
  RiMailSendLine,
  RiSave3Line,
} from "@remixicon/react";
import {
  AdminFilterBar,
  AdminPagination,
  AdminResultSummary,
  AdminSelect,
  type AdminTone,
} from "@/components/admin/AdminPrimitives";
import { adminActionTargets } from "@/lib/admin/route-meta";

export type AdminButtonVariant = "primary" | "secondary" | "info" | "warning" | "danger" | "ghost";

export const dashboardBars = [38, 58, 46, 68, 74, 62, 88, 54, 71, 96];

export function toneFromStatus(status: string): AdminTone {
  if (/(취소|환불|종료|마감|반려|삭제|CANCELED|REFUNDED|CLOSED|HIDDEN|LOST)/i.test(status)) return "danger";
  if (/(검토|대기|요청|임시|예정|PENDING|REQUESTED|IN_REVIEW|DRAFT|UNPAID)/i.test(status)) return "warning";
  if (/(확정|승인|노출|진행|발행|결제|완료|CONFIRMED|PAID|ONGOING|PUBLISHED|APPROVED|VISIBLE|WON)/i.test(status)) return "success";
  if (/(문의|ARCHIVED|PRIVATE)/i.test(status)) return "info";
  return "neutral";
}

export function memberApprovalStatus(
  status: string,
): "pending" | "approved" | "rejected" | "active" | "inactive" {
  if (/(승인완료|승인|approved)/i.test(status)) return "approved";
  if (/(반려|거절|rejected)/i.test(status)) return "rejected";
  if (/(승인대기|대기|pending)/i.test(status)) return "pending";
  if (/(정상|active)/i.test(status)) return "active";
  if (/(휴면|탈퇴|inactive)/i.test(status)) return "inactive";
  return "pending";
}

export function actionVariant(label: string, primary?: boolean): AdminButtonVariant {
  if (primary) return "primary";
  if (/(삭제|취소|마감|반려|환불)/.test(label)) return "danger";
  if (/(메일|발송|안내)/.test(label)) return "info";
  if (/(전환|승인|확정)/.test(label)) return "secondary";
  if (/(검토|보류)/.test(label)) return "warning";
  return "ghost";
}

export function ActionIcon({ label }: { label: string }) {
  if (/(발송|메일|안내)/.test(label)) return <RiMailSendLine size={16} />;
  if (/(견적|PDF)/.test(label)) return <RiFilePdf2Line size={16} />;
  if (/(저장|발행)/.test(label)) return <RiSave3Line size={16} />;
  if (/(수정|변경)/.test(label)) return <RiEdit2Line size={16} />;
  return <RiAddLine size={16} />;
}

export function HeaderAction({ href, label, primary }: { href?: string; label: string; primary?: boolean }) {
  const className = `admin-action-button ${actionVariant(label, primary)}`;

  if (href) {
    return (
      <Link className={className} href={href}>
        <ActionIcon label={label} />
        {label}
      </Link>
    );
  }

  return (
    <button className={className} type="button">
      <ActionIcon label={label} />
      {label}
    </button>
  );
}

export function HeaderActions({ currentKey, primary, secondary }: { currentKey: string; primary?: string; secondary?: string }) {
  const targets = adminActionTargets[currentKey] ?? {};

  return (
    <>
      {secondary ? <HeaderAction href={targets.secondary} label={secondary} /> : null}
      {primary ? <HeaderAction href={targets.primary} label={primary} primary /> : null}
    </>
  );
}

export function DetailPairs({ items }: { items: Array<[string, ReactNode]> }) {
  return (
    <div className="admin-detail-pairs">
      {items.map(([label, value]) => (
        <dl key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </dl>
      ))}
    </div>
  );
}

export function AdminField({ children, label, wide }: { children: ReactNode; label: string; wide?: boolean }) {
  return (
    <label className="admin-editor-field" data-wide={wide ? "true" : undefined}>
      <span>{label}</span>
      {children}
    </label>
  );
}

export function AdminEditorActions({
  backHref,
  primaryLabel,
  unlinkedReason,
}: {
  backHref: string;
  primaryLabel: string;
  /** 이 버튼들이 저장되지 않는 이유. 눌렀을 때 안내 문구에 함께 나온다. */
  unlinkedReason?: string;
}) {
  return (
    <div className="admin-editor-actions">
      <Link className="admin-action-button ghost" href={backHref}>
        취소
      </Link>
      <button className="admin-action-button secondary" data-admin-unlinked={unlinkedReason} type="button">
        임시저장
      </button>
      <button className="admin-action-button primary" data-admin-unlinked={unlinkedReason} type="button">
        <ActionIcon label={primaryLabel} />
        {primaryLabel}
      </button>
    </div>
  );
}

export function RowActionButtons({
  danger,
  info,
  primary,
  secondary,
  unlinkedReason,
}: {
  danger?: string;
  info?: string;
  primary?: string;
  secondary?: string;
  /** 이 버튼들이 저장되지 않는 이유. 눌렀을 때 안내 문구에 함께 나온다. */
  unlinkedReason?: string;
}) {
  return (
    <>
      {secondary ? (
        <button className="admin-action-button ghost" data-admin-unlinked={unlinkedReason} type="button">
          {secondary}
        </button>
      ) : null}
      {info ? (
        <button className="admin-action-button info" data-admin-unlinked={unlinkedReason} type="button">
          {info}
        </button>
      ) : null}
      {danger ? (
        <button className="admin-action-button danger" data-admin-unlinked={unlinkedReason} type="button">
          {danger}
        </button>
      ) : null}
      {primary ? (
        <button className="admin-action-button secondary" data-admin-unlinked={unlinkedReason} type="button">
          {primary}
        </button>
      ) : null}
    </>
  );
}

export function StatCard({ detail, icon, label, value }: { detail: string; icon?: ReactNode; label: string; value: string | number }) {
  return (
    <article className="admin-stat-card">
      {icon ? <i>{icon}</i> : null}
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

export function ListFrame({
  children,
  filters,
  resultLabel,
  total,
  bulk,
  summary,
}: {
  children: ReactNode;
  filters: Parameters<typeof AdminFilterBar>[0]["fields"];
  resultLabel: string;
  total: number;
  /** 목록 상단 일괄 처리. 없으면 일괄 처리 영역을 그리지 않는다. */
  bulk?: AdminBulkAction[];
  summary?: ReactNode;
}) {
  return (
    <section className="admin-list-shell">
      {summary}
      <AdminFilterBar fields={filters} resultLabel={resultLabel} />
      <AdminResultSummary>
        <span>총 {total.toLocaleString("ko-KR")}건</span>
        {bulk?.length ? <AdminBulkBar actions={bulk} /> : null}
      </AdminResultSummary>
      <div className="admin-table-panel">{children}</div>
      <AdminPagination total={total} />
    </section>
  );
}
