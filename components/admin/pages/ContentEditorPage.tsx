import { AdminCreateForm } from "@/components/admin/AdminCreateForm";
import type { AdminData } from "@/lib/admin/data";

type ContentEditorType = "banners" | "curations" | "journal";

export function ContentEditorPage({ data, type }: { data: AdminData; type: ContentEditorType }) {
  const isBanner = type === "banners";
  const isCuration = type === "curations";
  const previewImage = isBanner ? data.heroSlides[0]?.image : isCuration ? data.collections[0]?.image : data.journals[0]?.image;

  if (isBanner) {
    return (
      <section className="admin-content-editor" data-variant="banner">
        <article className="admin-banner-preview" style={{ backgroundImage: `url(${previewImage})` }}>
          <span>home_main</span>
          <h2>도심을 떠나 오늘도 푸릇해, eat.around</h2>
          <p>노출 위치와 이미지를 먼저 확인한 뒤 등록합니다.</p>
        </article>
        <article className="admin-content-editor-panel">
          <div className="admin-creation-head">
            <span>Banner slot</span>
            <h2>슬롯, 문구, 링크를 한 번에 설정합니다.</h2>
            <p>이미지는 파일을 올리거나 주소(URL)를 직접 입력합니다. 노출 기간 예약은 아직 연결되지 않았습니다.</p>
          </div>
          <AdminCreateForm
            backHref="/admin/banners"
            endpoint="/api/admin/banners"
            fields={[
              {
                name: "placement",
                label: "노출 슬롯",
                type: "select",
                defaultValue: "home_main",
                options: [
                  { value: "home_main", label: "home_main · 메인 히어로" },
                  { value: "home_event", label: "home_event · 메인 이벤트" },
                  { value: "package_cta", label: "package_cta · 기업·기관 CTA" },
                ],
              },
              {
                name: "theme",
                label: "테마",
                type: "select",
                defaultValue: "green",
                options: [
                  { value: "green", label: "green · 기본" },
                  { value: "red", label: "red · 마감임박" },
                  { value: "blue", label: "blue · 정보" },
                ],
              },
              { name: "isVisible", label: "상태", type: "flag", flagLabels: ["즉시 노출", "비공개"] },
              { name: "sortOrder", label: "정렬 순서(작을수록 먼저)", type: "number", defaultValue: 0 },
              { name: "eyebrow", label: "아이브로(상단 작은 텍스트)", type: "text", maxLength: 80, wide: true },
              { name: "title", label: "제목", type: "text", maxLength: 190, required: true, wide: true },
              { name: "subtitle", label: "서브카피", type: "textarea", maxLength: 300 },
              { name: "linkUrl", label: "연결 URL", type: "text", maxLength: 300, placeholder: "/curations/...", wide: true },
              { name: "imageUrl", label: "이미지 (파일을 올리거나 주소 입력)", type: "text", maxLength: 500, placeholder: "https://...", upload: "banners" },
            ]}
            submitLabel="배너 저장"
          />
        </article>
      </section>
    );
  }

  if (isCuration) {
    return (
      <section className="admin-creation-layout" data-variant="curation">
        <article className="admin-creation-main">
          <div className="admin-creation-head">
            <span>Curation builder</span>
            <h2>기획전 카드와 연결 링크를 등록합니다.</h2>
            <p>기획전에 상품을 묶는 기능은 연결 테이블이 없어 아직 지원하지 않습니다. 상품 목록은 연결 URL로 지정합니다.</p>
          </div>
          <AdminCreateForm
            backHref="/admin/curations"
            endpoint="/api/admin/curations"
            fields={[
              { name: "title", label: "기획전명", type: "text", maxLength: 190, required: true, wide: true },
              { name: "eyebrow", label: "아이브로(상단 작은 텍스트)", type: "text", maxLength: 80 },
              { name: "isVisible", label: "노출 상태", type: "flag", flagLabels: ["노출중", "비공개"] },
              { name: "subtitle", label: "설명", type: "textarea", maxLength: 300 },
              { name: "linkUrl", label: "연결 URL", type: "text", maxLength: 300, placeholder: "/local-experiences?tag=...", wide: true },
              { name: "imageUrl", label: "키 비주얼 이미지 (파일을 올리거나 주소 입력)", type: "text", maxLength: 500, placeholder: "https://...", upload: "curations" },
              { name: "sortOrder", label: "정렬 순서(작을수록 먼저)", type: "number", defaultValue: 0 },
            ]}
            submitLabel="기획전 저장"
          />
        </article>
        <aside className="admin-creation-side">
          <article className="admin-preview-stack">
            <span>현재 기획전</span>
            {previewImage ? <img alt="" src={previewImage} loading="lazy" decoding="async" /> : null}
            <strong>{data.collections[0]?.title}</strong>
            <small>PC 450px 카드와 모바일 스와이프 영역에 노출됩니다.</small>
          </article>
        </aside>
      </section>
    );
  }

  return (
    <section className="admin-journal-editor">
      <article className="admin-journal-canvas">
        <div className="admin-creation-head">
          <span>Journal editor</span>
          <h2>저널 글을 작성해 발행합니다.</h2>
          <p>커버 이미지는 파일을 올리거나 주소(URL)를 직접 입력합니다. SEO 설정과 연관 상품 연결은 저장할 곳이 없어 아직 지원하지 않습니다.</p>
        </div>
        <AdminCreateForm
          backHref="/admin/journal"
          endpoint="/api/admin/journals"
          fields={[
            { name: "title", label: "제목", type: "text", maxLength: 190, required: true, wide: true },
            { name: "category", label: "카테고리", type: "text", maxLength: 80, placeholder: "Local, Food, Guide ..." },
            { name: "isVisible", label: "발행 상태", type: "flag", flagLabels: ["바로 발행", "비공개 저장"] },
            { name: "excerpt", label: "요약", type: "textarea", maxLength: 500 },
            { name: "content", label: "본문", type: "textarea", maxLength: 20000 },
            { name: "imageUrl", label: "커버 이미지 (파일을 올리거나 주소 입력)", type: "text", maxLength: 500, placeholder: "https://...", upload: "journals" },
          ]}
          submitLabel="저널 저장"
        />
      </article>
      <aside className="admin-journal-side">
        <article className="admin-preview-stack">
          <span>최근 저널</span>
          {previewImage ? <img alt="" src={previewImage} loading="lazy" decoding="async" /> : null}
          {data.adminJournals.slice(0, 3).map((journal) => (
            <small key={journal.slug}>{journal.title}</small>
          ))}
        </article>
      </aside>
    </section>
  );
}
