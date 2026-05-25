import {
  AdminSelect,
} from "@/components/admin/AdminPrimitives";
import {
  AdminEditorActions,
  AdminField,
} from "@/components/admin/AdminLayoutPrimitives";
import { DatePicker } from "@/components/DatePicker";
import type { AdminData } from "@/lib/admin/data";
import { formatWon } from "@/lib/format";

type ContentEditorType = "banners" | "curations" | "journal";

export function ContentEditorPage({ data, type }: { data: AdminData; type: ContentEditorType }) {
  const isBanner = type === "banners";
  const isCuration = type === "curations";
  const previewImage = isBanner ? data.heroSlides[0]?.image : isCuration ? data.collections[0]?.image : data.journals[0]?.image;
  const backHref = isBanner ? "/admin/banners" : isCuration ? "/admin/curations" : "/admin/journal";
  const primaryLabel = isBanner ? "배너 저장" : isCuration ? "기획전 저장" : "저널 발행";

  if (isBanner) {
    return (
      <section className="admin-content-editor" data-variant="banner">
        <article className="admin-banner-preview" style={{ backgroundImage: `url(${previewImage})` }}>
          <span>home_main</span>
          <h2>도심을 떠나 오늘도 푸릇해, eat.around</h2>
          <p>노출 위치와 디바이스별 이미지를 먼저 확인한 뒤 등록합니다.</p>
        </article>
        <article className="admin-content-editor-panel">
          <div className="admin-creation-head">
            <span>Banner slot</span>
            <h2>슬롯, 기간, 링크를 한 번에 설정합니다.</h2>
          </div>
          <div className="admin-editor-field-grid">
            <AdminField label="노출 슬롯 (placement)">
              <AdminSelect defaultValue="home_main">
                <option value="home_main">home_main · 메인 히어로</option>
                <option value="home_event">home_event · 메인 이벤트</option>
                <option value="package_cta">package_cta · 기업·기관 CTA</option>
              </AdminSelect>
            </AdminField>
            <AdminField label="테마 (theme)">
              <AdminSelect defaultValue="green">
                <option value="green">green · 기본</option>
                <option value="red">red · 마감임박</option>
                <option value="blue">blue · 정보</option>
              </AdminSelect>
            </AdminField>
            <AdminField label="상태">
              <AdminSelect defaultValue="visible">
                <option value="visible">즉시 노출</option>
                <option value="scheduled">예약 노출</option>
                <option value="hidden">비공개</option>
              </AdminSelect>
            </AdminField>
            <AdminField label="정렬 순서">
              <input defaultValue="0" inputMode="numeric" placeholder="작을수록 먼저" />
            </AdminField>
            <AdminField label="아이브로(eyebrow)" wide>
              <input defaultValue="JEJU LOCAL" placeholder="상단 작은 텍스트" />
            </AdminField>
            <AdminField label="제목 (title)" wide>
              <input defaultValue="제주 로컬 미식 특가" />
            </AdminField>
            <AdminField label="서브카피 (subtitle)" wide>
              <textarea defaultValue="로컬 호스트가 준비한 계절 체험을 소개합니다." />
            </AdminField>
            <AdminField label="시작일 (starts_at)">
              <DatePicker className="admin-date-picker" defaultValue="2026-05-22" label="시작일" />
            </AdminField>
            <AdminField label="종료일 (ends_at)">
              <DatePicker className="admin-date-picker" defaultValue="2026-06-30" label="종료일" />
            </AdminField>
            <AdminField label="연결 URL (link_url)" wide>
              <input defaultValue="/curations/jeju-local-food" />
            </AdminField>
            <AdminField label="이미지 URL (image_url)" wide>
              <input defaultValue={data.heroSlides[0]?.image ?? ""} placeholder="https://..." />
            </AdminField>
          </div>
          <AdminEditorActions backHref={backHref} primaryLabel={primaryLabel} />
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
            <h2>테마와 상품 묶음을 먼저 구성합니다.</h2>
            <p>기획전 상세, 홈 섹션, 검색 결과에서 같은 상품 묶음을 재사용할 수 있도록 연결 상품을 관리합니다.</p>
          </div>
          <div className="admin-editor-field-grid">
            <AdminField label="기획전명" wide>
              <input defaultValue={data.collections[0]?.title ?? "제주 한 끼를 오래 기억하는 방법"} />
            </AdminField>
            <AdminField label="키워드">
              <input defaultValue="미식, 서귀포, 로컬" />
            </AdminField>
            <AdminField label="노출 상태">
              <AdminSelect defaultValue="visible">
                <option value="visible">노출중</option>
                <option value="scheduled">예약노출</option>
                <option value="hidden">비공개</option>
              </AdminSelect>
            </AdminField>
            <AdminField label="설명" wide>
              <textarea defaultValue={data.collections[0]?.description} />
            </AdminField>
          </div>
          <div className="admin-linked-product-board">
            {data.experiences.slice(0, 4).map((experience) => (
              <label key={experience.slug}>
                <input defaultChecked type="checkbox" />
                <img alt="" src={experience.image} loading="lazy" decoding="async" />
                <span>
                  <strong>{experience.title}</strong>
                  <small>{experience.region} · {formatWon(experience.price)}</small>
                </span>
              </label>
            ))}
          </div>
          <AdminEditorActions backHref={backHref} primaryLabel={primaryLabel} />
        </article>
        <aside className="admin-creation-side">
          <article className="admin-preview-stack">
            <span>기획전 미리보기</span>
            <img alt="" src={previewImage} loading="lazy" decoding="async" />
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
          <h2>본문과 SEO를 분리해서 작성합니다.</h2>
          <p>저널 상세페이지는 블로그형 본문으로 노출되므로 제목, 요약, 커버 이미지, 연관 상품을 함께 관리합니다.</p>
        </div>
        <AdminField label="제목" wide>
          <input defaultValue={data.journals[0]?.title} />
        </AdminField>
        <AdminField label="요약" wide>
          <textarea defaultValue={data.journals[0]?.excerpt} />
        </AdminField>
        <AdminField label="본문" wide>
          <textarea className="admin-journal-body-input" defaultValue={"제주 로컬 호스트를 만나는 방법과 체험 전 확인할 내용을 정리합니다.\n\n소제목, 이미지, 인용문, 연관 상품 영역을 순서대로 구성할 수 있습니다."} />
        </AdminField>
        <AdminEditorActions backHref={backHref} primaryLabel={primaryLabel} />
      </article>
      <aside className="admin-journal-side">
        <article className="admin-preview-stack">
          <span>커버 이미지</span>
          <img alt="" src={previewImage} loading="lazy" decoding="async" />
          <button className="admin-action-button ghost" type="button">이미지 교체</button>
        </article>
        <article className="admin-preview-stack">
          <span>SEO</span>
          <input defaultValue="제주 로컬체험, 로컬 호스트, 이더라운드" />
          <textarea defaultValue="로컬 호스트와 함께하는 제주 체험을 소개합니다." />
        </article>
        <article className="admin-preview-stack">
          <span>연관 상품</span>
          {data.experiences.slice(0, 2).map((experience) => (
            <small key={experience.slug}>{experience.title}</small>
          ))}
        </article>
      </aside>
    </section>
  );
}
