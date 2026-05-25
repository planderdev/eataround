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
import type { AdminData } from "@/lib/admin/data";

export function CategoriesPage({ data }: { data: AdminData }) {
  const columns: AdminTableColumn<AdminData["categories"][number]>[] = [
    { key: "label", label: "카테고리", render: (row) => <strong>{row.label}</strong> },
    { key: "href", label: "연결 경로", render: (row) => row.href },
    { key: "icon", label: "아이콘 에셋", render: (row) => row.iconAsset },
    { key: "depth", label: "깊이", align: "center", render: () => "1단계" },
    { key: "status", label: "노출", render: () => <AdminStatusBadge tone="success">노출중</AdminStatusBadge> },
  ];

  return (
    <ListFrame
      filters={[
        { label: "검색어", name: "query", placeholder: "카테고리명" },
        { label: "깊이", name: "depth", type: "select", options: ["1단계", "2단계"] },
        { label: "노출위치", name: "placement", type: "select", options: ["홈 아이콘", "상품 필터", "메가메뉴"] },
      ]}
      resultLabel="홈 아이콘 카테고리와 상품 분류 관리"
      total={data.categories.length}
    >
      <AdminDataTable
        actions={() => <RowActionButtons danger="숨김 처리" primary="카테고리 수정" secondary="순서 변경" />}
        columns={columns}
        detail={(row) => (
          <DetailPairs
            items={[
              ["아이콘 파일", row.iconAsset],
              ["연결 경로", row.href],
              ["톤", row.tone],
              ["프론트 반영", "홈 아이콘, 필터 모달, 메가메뉴에 동시 사용"],
            ]}
          />
        )}
        rowKey={(row) => row.label}
        rows={data.categories}
      />
    </ListFrame>
  );
}
