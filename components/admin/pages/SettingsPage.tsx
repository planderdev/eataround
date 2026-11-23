import Link from "next/link";
import { RiShieldCheckLine } from "@remixicon/react";
import {
  AdminDataTable,
  AdminStatusBadge,
  type AdminTableColumn,
} from "@/components/admin/AdminPrimitives";
import {
  DetailPairs,
  ListFrame,
  RowActionButtons,
} from "@/components/admin/AdminLayoutPrimitives";
import type { AdminAccountRow } from "@/lib/admin/content";

type SettingsType = "admins" | "site" | "policies";

export function SettingsPage({ type, admins }: { type: SettingsType; admins?: AdminAccountRow[] }) {
  if (type === "admins") {
    const rows = admins ?? [];
    const columns: AdminTableColumn<(typeof rows)[number]>[] = [
      { key: "name", label: "이름", render: (row) => <strong>{row.name}</strong> },
      { key: "email", label: "이메일", render: (row) => row.email },
      { key: "role", label: "역할", render: (row) => row.role },
      { key: "createdAt", label: "등록일", render: (row) => row.createdAt },
      { key: "status", label: "상태", render: (row) => <AdminStatusBadge tone="success">{row.status}</AdminStatusBadge> },
    ];
    return (
      <ListFrame
        filters={[
          { label: "검색어", name: "query", placeholder: "이름, 이메일" },
          { label: "역할", name: "role", type: "select", options: ["관리자"] },
          { label: "상태", name: "status", type: "select", options: ["활성", "잠금", "초대중"] },
        ]}
        resultLabel="관리자 계정과 권한"
        total={rows.length}
      >
        <AdminDataTable
          actions={() => <RowActionButtons danger="잠금 처리" primary="권한 변경" secondary="접속 로그" unlinkedReason="관리자 권한 등급·잠금·접속 로그를 저장할 항목이 아직 없습니다." />}
          columns={columns}
          detail={(row) => (
            <DetailPairs
              items={[
                ["계정", row.email],
                ["역할", row.role],
                ["등록일", row.createdAt],
                ["권한 범위", row.role === "OPERATOR" ? "운영 메뉴" : "전체 메뉴"],
              ]}
            />
          )}
          rowKey={(row) => row.email}
          rows={rows}
        />
      </ListFrame>
    );
  }

  const labels =
    type === "site"
      ? ["회사명", "대표자", "사업자번호", "통신판매업번호", "고객센터", "비즈니스 이메일", "기본 SEO 제목", "기본 SEO 설명"]
      : ["이용약관", "개인정보처리방침", "환불정책", "취소·환불 템플릿"];

  return (
    <section className="admin-settings-layout">
      <article className="admin-card">
        <div className="admin-card-header">
          <div>
            <span>{type === "site" ? "사이트 기본정보" : "약관·정책"}</span>
            <h2>{type === "site" ? "사업자·고객센터·SEO" : "버전 관리"}</h2>
          </div>
          {type === "policies" ? (
            <Link className="admin-action-button primary" href="/admin/settings/policies/new">
              새 버전 발행
            </Link>
          ) : null}
        </div>
        <div className="admin-settings-grid">
          {labels.map((label) => (
            <label key={label}>
              <span>{label}</span>
              <input defaultValue={type === "site" ? "지붕뚫은친구들" : "v1.0 · 2026-05-19"} />
            </label>
          ))}
        </div>
      </article>
      <aside className="admin-card admin-settings-guard">
        <RiShieldCheckLine size={22} />
        <strong>변경 시 운영팀 알림</strong>
        <p>주요 설정 변경은 운영팀에 자동으로 안내되며, 변경 이력은 감사 로그로 저장됩니다.</p>
      </aside>
    </section>
  );
}
