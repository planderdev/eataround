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
} from "@/components/admin/AdminLayoutPrimitives";
import type { AdminData } from "@/lib/admin/data";

type ContentType = "banners" | "curations" | "journal" | "reviews";

export function ContentPage({ data, type }: { data: AdminData; type: ContentType }) {
  if (type === "banners") {
    const rows = [
      ...data.heroSlides.map((banner, index) => ({
        slot: "MAIN_HERO",
        title: banner.title,
        subtitle: banner.description,
        href: banner.href,
        image: banner.image,
        status: "노출중",
        key: `hero-${index}`,
      })),
      ...data.packageCtas.map((banner, index) => ({
        slot: "MAIN_B2B_CTA",
        title: banner.title,
        subtitle: banner.subtitle,
        href: banner.href,
        image: banner.hostImages[0],
        status: "노출중",
        key: `cta-${index}`,
      })),
    ];
    const columns: AdminTableColumn<(typeof rows)[number]>[] = [
      { key: "slot", label: "슬롯", render: (row) => row.slot },
      { key: "title", label: "제목", render: (row) => <strong>{row.title}</strong> },
      { key: "period", label: "노출기간", render: () => "상시" },
      { key: "link", label: "링크", render: (row) => row.href },
      { key: "status", label: "상태", render: (row) => <AdminStatusBadge tone="success">{row.status}</AdminStatusBadge> },
    ];
    return (
      <ListFrame
        filters={[
          { label: "슬롯", name: "slot", type: "select", options: ["MAIN_HERO", "MAIN_EVENT", "MAIN_CURATION", "MAIN_B2B_CTA", "LIST_TOP"] },
          { label: "노출상태", name: "status", type: "select", options: ["노출중", "예약노출", "비공개"] },
          { label: "노출 시작일", name: "startAt", type: "date" },
        ]}
        resultLabel="위치별 배너 슬롯과 링크 관리"
        total={rows.length}
      >
        <AdminDataTable
          actions={() => <RowActionButtons danger="비공개 전환" primary="배너 수정" secondary="순서 변경" />}
          columns={columns}
          detail={(row) => (
            <div className="admin-row-product-detail">
              <img alt="" src={row.image} loading="lazy" decoding="async" />
              <DetailPairs items={[["서브카피", row.subtitle], ["연결 링크", row.href], ["노출 슬롯", row.slot]]} />
            </div>
          )}
          rowKey={(row) => row.key}
          rows={rows}
        />
      </ListFrame>
    );
  }

  if (type === "curations") {
    const columns: AdminTableColumn<AdminData["collections"][number]>[] = [
      { key: "title", label: "기획전명", render: (row) => <strong>{row.title}</strong> },
      { key: "products", label: "포함 상품", align: "center", render: () => "3개" },
      { key: "period", label: "노출기간", render: () => "상시" },
      { key: "status", label: "상태", render: () => <AdminStatusBadge tone="success">노출중</AdminStatusBadge> },
      { key: "views", label: "페이지뷰", align: "right", render: () => "1,248" },
    ];
    return (
      <ListFrame
        filters={[
          { label: "검색어", name: "query", placeholder: "기획전명, 테마" },
          { label: "상태", name: "status", type: "select", options: ["노출중", "비공개", "예약노출"] },
          { label: "연결 상품", name: "products", type: "select", options: ["3개 이하", "4개 이상"] },
        ]}
        resultLabel="테마 큐레이션 목록"
        total={data.collections.length}
      >
        <AdminDataTable
          actions={() => <RowActionButtons primary="기획전 수정" secondary="상품 연결" />}
          columns={columns}
          detail={(row) => <DetailPairs items={[["설명", row.description], ["링크", row.href], ["키 비주얼", row.image]]} />}
          rowKey={(row) => row.title}
          rows={data.collections}
        />
      </ListFrame>
    );
  }

  if (type === "journal") {
    const columns: AdminTableColumn<AdminData["journals"][number]>[] = [
      { key: "title", label: "제목", render: (row) => <strong>{row.title}</strong> },
      { key: "category", label: "카테고리", render: (row) => row.category },
      { key: "date", label: "발행일", render: (row) => row.date },
      { key: "status", label: "상태", render: () => <AdminStatusBadge tone="success">PUBLISHED</AdminStatusBadge> },
      { key: "views", label: "조회수", align: "right", render: () => "842" },
    ];
    return (
      <ListFrame
        filters={[
          { label: "검색어", name: "query", placeholder: "제목, 태그, SEO 키워드" },
          { label: "발행상태", name: "status", type: "select", options: ["DRAFT", "PUBLISHED", "ARCHIVED"] },
          { label: "카테고리", name: "category", type: "select", options: ["Local", "Food", "Guide", "B2B"] },
          { label: "발행일", name: "publishedAt", type: "date" },
        ]}
        resultLabel="저널 발행과 검색 노출 관리"
        total={data.journals.length}
      >
        <AdminDataTable
          actions={() => <RowActionButtons primary="본문 수정" secondary="SEO 설정" />}
          columns={columns}
          detail={(row) => <DetailPairs items={[["요약", row.excerpt], ["대표 이미지", row.image], ["상세 URL", `/journal/${row.slug}`]]} />}
          rowKey={(row) => row.slug}
          rows={data.journals}
        />
      </ListFrame>
    );
  }

  const columns: AdminTableColumn<AdminData["flatReviews"][number]>[] = [
    { key: "name", label: "작성자", render: (row) => <strong>{row.name}</strong> },
    { key: "rating", label: "평점", align: "center", render: (row) => row.rating },
    { key: "content", label: "내용 요약", render: (row) => row.text },
    { key: "status", label: "노출상태", render: () => <AdminStatusBadge tone="success">VISIBLE</AdminStatusBadge> },
    { key: "reports", label: "신고", align: "center", render: () => "0" },
  ];
  return (
    <ListFrame
      bulkOptions={["선택 리뷰 노출", "선택 리뷰 숨김", "호스트 답변 요청"]}
      filters={[
        { label: "상품", name: "product", placeholder: "상품명" },
        { label: "평점", name: "rating", type: "select", options: ["5", "4", "3", "2", "1"] },
        { label: "노출상태", name: "status", type: "select", options: ["VISIBLE", "HIDDEN", "PENDING"] },
        { label: "신고상태", name: "report", type: "select", options: ["신고 없음", "신고 있음"] },
      ]}
      resultLabel="리뷰 검수와 노출 관리"
      total={data.flatReviews.length}
    >
      <AdminDataTable
        actions={() => <RowActionButtons danger="숨김 처리" info="호스트 답변 요청" primary="노출 승인" />}
        columns={columns}
        detail={(row) => (
          <div className="admin-review-moderation-panel">
            <DetailPairs items={[["작성자", row.name], ["평점", `${row.rating}.0`], ["전문", row.text], ["검수 기준", "개인정보와 부적절 표현 확인"]]} />
            <div className="admin-review-moderation-grid">
              <label>
                <input type="checkbox" />
                개인정보 포함 여부 확인
              </label>
              <label>
                <input type="checkbox" />
                부적절 표현 없음
              </label>
              <label>
                <input type="checkbox" />
                상품과 무관한 내용 없음
              </label>
              <label>
                <input type="checkbox" />
                호스트 답변 필요
              </label>
            </div>
            <textarea aria-label="리뷰 검수 메모" placeholder="신고 사유, 비노출 사유, 호스트 전달 메모를 남겨주세요." />
          </div>
        )}
        rowKey={(row) => `${row.name}-${row.text}`}
        rows={data.flatReviews}
      />
    </ListFrame>
  );
}
