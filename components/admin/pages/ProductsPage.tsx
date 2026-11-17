import Link from "next/link";
import {
  AdminDataTable,
  AdminStatusBadge,
  type AdminTableColumn,
} from "@/components/admin/AdminPrimitives";
import {
  DetailPairs,
  ListFrame,
} from "@/components/admin/AdminLayoutPrimitives";
import { AdminRowEditor } from "@/components/admin/AdminRowEditor";
import { ProductGalleryEditor } from "@/components/admin/ProductGalleryEditor";
import { GALLERY_MAX_IMAGES } from "@/lib/admin/gallery-rules";
import type { AdminData } from "@/lib/admin/data";
import { formatWon } from "@/lib/format";

export function ProductsPage({ data }: { data: AdminData }) {
  const columns: AdminTableColumn<AdminData["adminProducts"][number]>[] = [
    { key: "title", label: "상품명", render: (row) => <strong>{row.title}</strong> },
    { key: "category", label: "카테고리", render: (row) => row.category },
    { key: "region", label: "지역", render: (row) => row.region },
    { key: "price", label: "기본가", align: "right", render: (row) => formatWon(row.price) },
    { key: "stock", label: "재고", align: "center", render: (row) => `${row.booked}/${row.capacity}` },
    { key: "schedules", label: "예약 가능 회차", align: "center", render: (row) => `${row.scheduleCount}개` },
    { key: "badge", label: "배지", render: (row) => row.badge ?? "-" },
    { key: "gallery", label: "갤러리", align: "center", render: (row) => `${row.gallery.length}장` },
    {
      key: "status",
      label: "노출상태",
      render: (row) => <AdminStatusBadge tone={row.isVisible ? "success" : "danger"}>{row.isVisible ? "노출중" : "비공개"}</AdminStatusBadge>,
    },
  ];

  return (
    <ListFrame
      bulk={[
        { label: "노출 ON", endpoint: "/api/admin/products", payload: { isVisible: true } },
        { label: "노출 OFF", endpoint: "/api/admin/products", payload: { isVisible: false } },
        { label: "특가 배지 적용", endpoint: "/api/admin/products", payload: { badge: "특가" } },
        { label: "배지 제거", endpoint: "/api/admin/products", payload: { badge: "" } },
        { label: "회차 일괄 마감", unlinked: "회차·재고 > 일괄 마감 화면에서 상품과 기간을 지정해 처리해 주세요." },
      ]}
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
      total={data.adminProducts.length}
    >
      <AdminDataTable
        actions={(row) => (
          <Link className="admin-action-button ghost" href={`/experiences/${row.slug}`} target="_blank">
            프론트 보기
          </Link>
        )}
        columns={columns}
        detail={(row) => (
          <>
            <div className="admin-row-product-detail">
              <img alt="" src={row.image} loading="lazy" decoding="async" />
              <DetailPairs
                items={[
                  ["요약", row.summary || "-"],
                  ["호스트", row.host],
                  ["상세 URL", `/experiences/${row.slug}`],
                ]}
              />
            </div>
            <AdminRowEditor
              endpoint={`/api/admin/products/${row.id ?? `sample-${row.slug}`}`}
              fields={[
                { name: "title", label: "상품명", type: "text", value: row.title, maxLength: 190, wide: true },
                { name: "summary", label: "요약", type: "textarea", value: row.summary, maxLength: 500 },
                { name: "price", label: "기본가", type: "number", value: row.price },
                { name: "originalPrice", label: "정가(비우면 없음)", type: "number", value: row.originalPrice, nullable: true },
                { name: "badge", label: "배지", type: "text", value: row.badge, maxLength: 40 },
                { name: "isVisible", label: "노출", type: "flag", value: row.isVisible },
                { name: "imageUrl", label: "대표 이미지 (파일을 올리거나 주소 입력)", type: "text", value: row.imageUrl, maxLength: 500, upload: "products" },
              ]}
              key={`${row.id}-${row.title}-${row.price}-${row.originalPrice}-${row.badge}-${row.isVisible}-${row.summary}-${row.imageUrl}`}
              saveLabel="상품 저장"
            />
            <ProductGalleryEditor images={row.gallery} maxImages={GALLERY_MAX_IMAGES} primaryImageUrl={row.imageUrl} productId={row.id} />
          </>
        )}
        rowId={(row) => row.id}
        rowKey={(row) => row.slug}
        rows={data.adminProducts}
      />
    </ListFrame>
  );
}
