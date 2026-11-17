import { AdminCreateForm } from "@/components/admin/AdminCreateForm";
import type { AdminData } from "@/lib/admin/data";

const TONE_OPTIONS = [
  { value: "green", label: "Green" },
  { value: "coral", label: "Coral" },
  { value: "blue", label: "Blue" },
  { value: "yellow", label: "Yellow" },
  { value: "red", label: "Red" },
  { value: "ink", label: "Ink" },
];

export function CategoryEditorPage({ data }: { data: AdminData }) {
  return (
    <section className="admin-creation-layout" data-variant="category">
      <article className="admin-creation-main">
        <div className="admin-creation-head">
          <span>Category setup</span>
          <h2>홈 아이콘 카테고리를 등록합니다.</h2>
          <p>저장하면 홈 아이콘 영역에 나타납니다. 아이콘은 이미지 파일을 올리거나 이미 있는 에셋 경로로 지정합니다.</p>
        </div>
        <AdminCreateForm
          backHref="/admin/products/categories"
          endpoint="/api/admin/categories"
          fields={[
            { name: "label", label: "카테고리명", type: "text", maxLength: 80, required: true },
            { name: "href", label: "연결 경로", type: "text", maxLength: 300, required: true, placeholder: "/local-experiences?tag=쿠킹" },
            { name: "iconAsset", label: "아이콘 (파일을 올리거나 에셋 경로 입력)", type: "text", maxLength: 300, placeholder: "/assets/images/plat-icon-cook.svg", upload: "categories" },
            { name: "tone", label: "톤", type: "select", defaultValue: "green", options: TONE_OPTIONS },
            { name: "isVisible", label: "노출", type: "flag" },
            { name: "sortOrder", label: "정렬 순서(작을수록 먼저)", type: "number", defaultValue: 0 },
          ]}
          submitLabel="카테고리 저장"
        />
      </article>
      <aside className="admin-creation-side">
        <article className="admin-preview-stack">
          <span>현재 카테고리</span>
          <div className="admin-category-preview-grid">
            {data.categories.slice(0, 7).map((category) => (
              <div key={category.label}>
                <img alt="" src={category.iconAsset} loading="lazy" decoding="async" />
                <strong>{category.label}</strong>
              </div>
            ))}
          </div>
        </article>
      </aside>
    </section>
  );
}
