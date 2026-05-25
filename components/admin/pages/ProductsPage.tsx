import Link from "next/link";
import {
  AdminDataTable,
  AdminStatusBadge,
  type AdminTableColumn,
} from "@/components/admin/AdminPrimitives";
import {
  DetailPairs,
  ListFrame,
  RowActionButtons,
  toneFromStatus,
} from "@/components/admin/AdminLayoutPrimitives";
import type { AdminData } from "@/lib/admin/data";
import { formatWon } from "@/lib/format";

export function ProductsPage({ data }: { data: AdminData }) {
  const columns: AdminTableColumn<AdminData["experiences"][number]>[] = [
    { key: "title", label: "상품명", render: (row) => <strong>{row.title}</strong> },
    { key: "category", label: "카테고리", render: (row) => row.category },
    { key: "region", label: "지역", render: (row) => row.region },
    { key: "price", label: "기본가", align: "right", render: (row) => formatWon(row.price) },
    {
      key: "stock",
      label: "재고",
      align: "center",
      render: (row) =>
        `${row.schedules.reduce((sum, item) => sum + item.booked, 0)}/${row.schedules.reduce((sum, item) => sum + item.capacity, 0)}`,
    },
    { key: "booking", label: "예약유형", render: (row) => row.schedules[0]?.reservationType ?? "timeslot" },
    { key: "status", label: "노출상태", render: (row) => <AdminStatusBadge tone={toneFromStatus(row.badge ?? "노출중")}>{row.badge ?? "노출중"}</AdminStatusBadge> },
  ];

  return (
    <ListFrame
      bulkOptions={["선택 상품 검토", "노출 ON", "노출 OFF", "특가 배지 적용", "회차 일괄 마감"]}
      filters={[
        { label: "검색어", name: "query", placeholder: "상품명, 태그, 호스트" },
        { label: "카테고리", name: "category", type: "select", options: data.categories.map((category) => category.label) },
        { label: "지역", name: "region", type: "select", options: ["제주시", "서귀포시", "구좌", "애월"] },
        { label: "예약유형", name: "bookingType", type: "select", options: ["instant", "approval", "inquiry"] },
        { label: "재고상태", name: "stock", type: "select", options: ["예약가능", "마감임박", "마감"] },
        { label: "등록일", name: "createdAt", type: "date" },
      ]}
      resultLabel="상품 노출, 예약유형, 회차 재고 기준 관리"
      summary={
        <div className="admin-product-overview">
          {data.experiences.slice(0, 3).map((experience) => (
            <article key={experience.slug}>
              <img alt="" src={experience.image} loading="lazy" decoding="async" />
              <span>{experience.category}</span>
              <strong>{experience.title}</strong>
              <small>{experience.region} · {experience.schedules.length}개 회차</small>
            </article>
          ))}
        </div>
      }
      total={data.experiences.length}
    >
      <AdminDataTable
        actions={(row) => (
          <>
            <Link className="admin-action-button ghost" href={`/experiences/${row.slug}`} target="_blank">
              프론트 보기
            </Link>
            <RowActionButtons info="회차 관리" primary="상품 수정" secondary="배지 설정" />
          </>
        )}
        columns={columns}
        detail={(row) => (
          <div className="admin-row-product-detail">
            <img alt="" src={row.image} loading="lazy" decoding="async" />
            <DetailPairs
              items={[
                ["요약", row.summary],
                ["호스트", row.host.name],
                ["장소", `${row.place.name} · ${row.place.address}`],
                ["태그", row.tags.join(", ") || "-"],
                ["포함사항", row.included.join(", ")],
              ]}
            />
          </div>
        )}
        rowKey={(row) => row.slug}
        rows={data.experiences}
      />
    </ListFrame>
  );
}
