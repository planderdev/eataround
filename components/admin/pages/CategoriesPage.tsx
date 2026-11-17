import {
  AdminDataTable,
  AdminStatusBadge,
  type AdminTableColumn,
} from "@/components/admin/AdminPrimitives";
import { ListFrame } from "@/components/admin/AdminLayoutPrimitives";
import { AdminRowEditor } from "@/components/admin/AdminRowEditor";
import type { AdminData } from "@/lib/admin/data";

const TONE_OPTIONS = ["green", "coral", "blue", "yellow", "red", "ink"].map((tone) => ({ value: tone, label: tone }));

export function CategoriesPage({ data }: { data: AdminData }) {
  const columns: AdminTableColumn<AdminData["adminCategories"][number]>[] = [
    { key: "label", label: "카테고리", render: (row) => <strong>{row.label}</strong> },
    { key: "href", label: "연결 경로", render: (row) => row.href },
    { key: "icon", label: "아이콘 에셋", render: (row) => row.iconAsset || "-" },
    { key: "order", label: "순서", align: "center", render: (row) => row.sortOrder },
    {
      key: "status",
      label: "노출",
      render: (row) => <AdminStatusBadge tone={row.isVisible ? "success" : "danger"}>{row.isVisible ? "노출중" : "숨김"}</AdminStatusBadge>,
    },
  ];

  return (
    <ListFrame
      bulk={[
        { label: "노출 ON", endpoint: "/api/admin/categories", payload: { isVisible: true } },
        { label: "노출 OFF", endpoint: "/api/admin/categories", payload: { isVisible: false } },
      ]}
      filters={[
        { label: "검색어", name: "query", placeholder: "카테고리명" },
        { label: "노출", name: "status", type: "select", options: ["노출중", "숨김"] },
      ]}
      resultLabel="홈 아이콘 카테고리 관리"
      total={data.adminCategories.length}
    >
      <AdminDataTable
        columns={columns}
        detail={(row) => (
          <AdminRowEditor
            endpoint={`/api/admin/categories/${row.id ?? `sample-${row.label}`}`}
            fields={[
              { name: "label", label: "카테고리명", type: "text", value: row.label, maxLength: 80 },
              { name: "href", label: "연결 경로", type: "text", value: row.href, maxLength: 300 },
              { name: "iconAsset", label: "아이콘 (파일을 올리거나 에셋 경로 입력)", type: "text", value: row.iconAsset, maxLength: 300, upload: "categories" },
              { name: "tone", label: "톤", type: "select", value: row.tone, options: TONE_OPTIONS },
              { name: "sortOrder", label: "순서(작을수록 먼저)", type: "number", value: row.sortOrder },
              { name: "isVisible", label: "노출", type: "flag", value: row.isVisible, flagLabels: ["노출", "숨김"] },
            ]}
            key={`${row.id}-${row.label}-${row.href}-${row.iconAsset}-${row.tone}-${row.sortOrder}-${row.isVisible}`}
            saveLabel="카테고리 저장"
          />
        )}
        rowId={(row) => row.id}
        rowKey={(row) => row.label}
        rows={data.adminCategories}
      />
    </ListFrame>
  );
}
