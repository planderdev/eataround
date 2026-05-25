import { AdminSelect } from "@/components/admin/AdminPrimitives";
import {
  AdminEditorActions,
  AdminField,
} from "@/components/admin/AdminLayoutPrimitives";
import type { AdminData } from "@/lib/admin/data";

export function CategoryEditorPage({ data }: { data: AdminData }) {
  return (
    <section className="admin-creation-layout" data-variant="category">
      <article className="admin-creation-main">
        <div className="admin-creation-head">
          <span>Category setup</span>
          <h2>홈 아이콘과 상품 분류를 함께 관리합니다.</h2>
          <p>프론트 홈, 필터, 메가메뉴에서 같은 분류 체계를 사용할 수 있도록 노출 위치와 아이콘 에셋을 함께 저장합니다.</p>
        </div>
        <div className="admin-editor-field-grid">
          <AdminField label="카테고리명">
            <input defaultValue="쿠킹·베이킹" />
          </AdminField>
          <AdminField label="URL 경로">
            <input defaultValue="/experiences?category=cooking" />
          </AdminField>
          <AdminField label="아이콘 에셋">
            <input defaultValue="/assets/icons/plat-cooking.png" />
          </AdminField>
          <AdminField label="톤">
            <AdminSelect defaultValue="mint">
              <option value="mint">Mint</option>
              <option value="coral">Coral</option>
              <option value="yellow">Yellow</option>
            </AdminSelect>
          </AdminField>
          <AdminField label="노출 위치" wide>
            <div className="admin-chip-options">
              {["홈 아이콘 그리드", "상품 필터", "메가메뉴", "검색 카테고리"].map((item) => (
                <label key={item}>
                  <input defaultChecked={item !== "검색 카테고리"} type="checkbox" />
                  {item}
                </label>
              ))}
            </div>
          </AdminField>
        </div>
        <AdminEditorActions backHref="/admin/products/categories" primaryLabel="카테고리 저장" />
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
