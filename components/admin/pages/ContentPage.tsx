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
import type { AdminData } from "@/lib/admin/data";

const REVIEW_STATUS_LABEL = { pending: "검수대기", approved: "노출중", hidden: "숨김" } as const;
const REVIEW_STATUS_TONE = { pending: "warning", approved: "success", hidden: "danger" } as const;

type ContentType = "banners" | "curations" | "journal" | "reviews";

export function ContentPage({ data, type }: { data: AdminData; type: ContentType }) {
  if (type === "banners") {
    const rows = data.adminBanners;
    const columns: AdminTableColumn<(typeof rows)[number]>[] = [
      { key: "slot", label: "슬롯", render: (row) => row.slot },
      { key: "title", label: "제목", render: (row) => <strong>{row.title}</strong> },
      { key: "order", label: "순서", align: "center", render: (row) => row.sortOrder },
      { key: "link", label: "링크", render: (row) => row.href || "-" },
      {
        key: "status",
        label: "상태",
        render: (row) => <AdminStatusBadge tone={row.isVisible ? "success" : "danger"}>{row.isVisible ? "노출중" : "비공개"}</AdminStatusBadge>,
      },
    ];
    return (
      <ListFrame
        bulk={[
          { label: "노출 ON", endpoint: "/api/admin/banners", payload: { isVisible: true } },
          { label: "노출 OFF", endpoint: "/api/admin/banners", payload: { isVisible: false } },
        ]}
        filters={[
          { label: "슬롯", name: "slot", type: "select", options: ["MAIN_HERO", "MAIN_EVENT", "MAIN_CURATION", "MAIN_B2B_CTA", "LIST_TOP"] },
          { label: "노출상태", name: "status", type: "select", options: ["노출중", "예약노출", "비공개"] },
          { label: "노출 시작일", name: "startAt", type: "date" },
        ]}
        resultLabel="위치별 배너 슬롯과 링크 관리"
        total={rows.length}
      >
        <AdminDataTable
          columns={columns}
          detail={(row) => (
            <>
              <div className="admin-row-product-detail">
                {row.image ? <img alt="" src={row.image} loading="lazy" decoding="async" /> : null}
                <DetailPairs items={[["노출 슬롯", row.slot]]} />
              </div>
              <AdminRowEditor
                endpoint={`/api/admin/banners/${row.id ?? `sample-${row.slot}-${row.title}`}`}
                fields={[
                  { name: "title", label: "제목", type: "text", value: row.title, maxLength: 190, wide: true },
                  { name: "subtitle", label: "서브카피", type: "textarea", value: row.subtitle, maxLength: 300 },
                  { name: "linkUrl", label: "연결 링크", type: "text", value: row.href, maxLength: 300 },
                  { name: "sortOrder", label: "순서(작을수록 먼저)", type: "number", value: row.sortOrder },
                  { name: "isVisible", label: "노출", type: "flag", value: row.isVisible },
                ]}
                key={`${row.id}-${row.title}-${row.subtitle}-${row.href}-${row.sortOrder}-${row.isVisible}`}
                saveLabel="배너 저장"
              />
            </>
          )}
          rowId={(row) => row.id}
          rowKey={(row) => `${row.id ?? ""}-${row.slot}-${row.title}`}
          rows={rows}
        />
      </ListFrame>
    );
  }

  if (type === "curations") {
    const columns: AdminTableColumn<AdminData["adminCollections"][number]>[] = [
      { key: "title", label: "기획전명", render: (row) => <strong>{row.title}</strong> },
      { key: "order", label: "순서", align: "center", render: (row) => row.sortOrder },
      { key: "link", label: "링크", render: (row) => row.href || "-" },
      {
        key: "status",
        label: "상태",
        render: (row) => <AdminStatusBadge tone={row.isVisible ? "success" : "danger"}>{row.isVisible ? "노출중" : "비공개"}</AdminStatusBadge>,
      },
    ];
    return (
      <ListFrame
        bulk={[
          { label: "노출 ON", endpoint: "/api/admin/curations", payload: { isVisible: true } },
          { label: "노출 OFF", endpoint: "/api/admin/curations", payload: { isVisible: false } },
        ]}
        filters={[
          { label: "검색어", name: "query", placeholder: "기획전명, 테마" },
          { label: "상태", name: "status", type: "select", options: ["노출중", "비공개", "예약노출"] },
          { label: "연결 상품", name: "products", type: "select", options: ["3개 이하", "4개 이상"] },
        ]}
        resultLabel="테마 큐레이션 목록"
        total={data.adminCollections.length}
      >
        <AdminDataTable
          columns={columns}
          detail={(row) => (
            <>
              <DetailPairs items={[["키 비주얼", row.image || "-"], ["슬러그", row.slug]]} />
              <AdminRowEditor
                endpoint={`/api/admin/curations/${row.id ?? `sample-${row.slug}`}`}
                fields={[
                  { name: "title", label: "기획전명", type: "text", value: row.title, maxLength: 190, wide: true },
                  { name: "subtitle", label: "설명", type: "textarea", value: row.description, maxLength: 300 },
                  { name: "linkUrl", label: "연결 링크", type: "text", value: row.href, maxLength: 300 },
                  { name: "sortOrder", label: "순서(작을수록 먼저)", type: "number", value: row.sortOrder },
                  { name: "isVisible", label: "노출", type: "flag", value: row.isVisible },
                ]}
                key={`${row.id}-${row.title}-${row.description}-${row.href}-${row.sortOrder}-${row.isVisible}`}
                saveLabel="기획전 저장"
              />
            </>
          )}
          rowId={(row) => row.id}
          rowKey={(row) => row.slug}
          rows={data.adminCollections}
        />
      </ListFrame>
    );
  }

  if (type === "journal") {
    const columns: AdminTableColumn<AdminData["adminJournals"][number]>[] = [
      { key: "title", label: "제목", render: (row) => <strong>{row.title}</strong> },
      { key: "category", label: "카테고리", render: (row) => row.category || "-" },
      { key: "date", label: "발행일", render: (row) => row.date },
      {
        key: "status",
        label: "상태",
        render: (row) => <AdminStatusBadge tone={row.isVisible ? "success" : "danger"}>{row.isVisible ? "발행중" : "비공개"}</AdminStatusBadge>,
      },
    ];
    return (
      <ListFrame
        bulk={[
          { label: "노출 ON", endpoint: "/api/admin/journals", payload: { isVisible: true } },
          { label: "노출 OFF", endpoint: "/api/admin/journals", payload: { isVisible: false } },
        ]}
        filters={[
          { label: "검색어", name: "query", placeholder: "제목, 태그, SEO 키워드" },
          { label: "발행상태", name: "status", type: "select", options: ["DRAFT", "PUBLISHED", "ARCHIVED"] },
          { label: "카테고리", name: "category", type: "select", options: ["Local", "Food", "Guide", "B2B"] },
          { label: "발행일", name: "publishedAt", type: "date" },
        ]}
        resultLabel="저널 발행과 검색 노출 관리"
        total={data.adminJournals.length}
      >
        <AdminDataTable
          columns={columns}
          detail={(row) => (
            <>
              <DetailPairs items={[["상세 URL", `/journal/${row.slug}`]]} />
              <AdminRowEditor
                endpoint={`/api/admin/journals/${row.id ?? `sample-${row.slug}`}`}
                fields={[
                  { name: "title", label: "제목", type: "text", value: row.title, maxLength: 190, wide: true },
                  { name: "category", label: "카테고리", type: "text", value: row.category, maxLength: 80 },
                  { name: "isVisible", label: "발행", type: "flag", value: row.isVisible, flagLabels: ["발행중", "비공개"] },
                  { name: "excerpt", label: "요약", type: "textarea", value: row.excerpt, maxLength: 500 },
                  { name: "content", label: "본문", type: "textarea", value: row.content, maxLength: 20000 },
                  { name: "imageUrl", label: "커버 이미지 URL", type: "text", value: row.image, maxLength: 500, wide: true },
                ]}
                key={`${row.id}-${row.title}-${row.category}-${row.isVisible}-${row.excerpt}-${row.content.length}-${row.image}`}
                saveLabel="저널 저장"
              />
            </>
          )}
          rowId={(row) => row.id}
          rowKey={(row) => row.slug}
          rows={data.adminJournals}
        />
      </ListFrame>
    );
  }

  const columns: AdminTableColumn<AdminData["adminReviews"][number]>[] = [
    { key: "product", label: "상품", render: (row) => row.product },
    { key: "name", label: "작성자", render: (row) => <strong>{row.name}</strong> },
    { key: "rating", label: "평점", align: "center", render: (row) => row.rating },
    { key: "content", label: "내용 요약", render: (row) => row.text },
    {
      key: "status",
      label: "노출상태",
      render: (row) => <AdminStatusBadge tone={REVIEW_STATUS_TONE[row.status]}>{REVIEW_STATUS_LABEL[row.status]}</AdminStatusBadge>,
    },
  ];
  return (
    <ListFrame
      bulk={[
        { label: "선택 리뷰 노출", endpoint: "/api/admin/reviews", payload: { status: "approved" } },
        { label: "선택 리뷰 숨김", endpoint: "/api/admin/reviews", payload: { status: "hidden" } },
        { label: "호스트 답변 요청", unlinked: "메일·알림 발송 수단이 없습니다." },
      ]}
      filters={[
        { label: "상품", name: "product", placeholder: "상품명" },
        { label: "평점", name: "rating", type: "select", options: ["5", "4", "3", "2", "1"] },
        { label: "노출상태", name: "status", type: "select", options: ["VISIBLE", "HIDDEN", "PENDING"] },
        { label: "신고상태", name: "report", type: "select", options: ["신고 없음", "신고 있음"] },
      ]}
      resultLabel="리뷰 검수와 노출 관리"
      total={data.adminReviews.length}
    >
      <AdminDataTable
        columns={columns}
        detail={(row) => (
          <div className="admin-review-moderation-panel">
            <DetailPairs items={[["상품", row.product], ["작성자", row.name], ["평점", `${row.rating}.0`], ["전문", row.text]]} />
            <AdminRowEditor
              endpoint={`/api/admin/reviews/${row.id ?? `sample-${row.name}`}`}
              fields={[
                {
                  name: "status",
                  label: "노출 상태",
                  type: "select",
                  value: row.status,
                  wide: true,
                  options: [
                    { value: "pending", label: "검수대기" },
                    { value: "approved", label: "노출 승인" },
                    { value: "hidden", label: "숨김" },
                  ],
                },
              ]}
              key={`${row.id}-${row.status}`}
              saveLabel="노출 상태 저장"
            />
          </div>
        )}
        rowId={(row) => row.id}
        rowKey={(row) => `${row.id ?? ""}-${row.name}-${row.text}`}
        rows={data.adminReviews}
      />
    </ListFrame>
  );
}
