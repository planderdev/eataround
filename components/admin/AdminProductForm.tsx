"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DatePicker } from "@/components/DatePicker";
import { withBasePath } from "@/lib/paths";

type SubmitState = {
  tone: "idle" | "success" | "error";
  message: string;
};

const productTabs = [
  { id: "basic", label: "기본 정보" },
  { id: "media", label: "미디어" },
  { id: "content", label: "상세 콘텐츠" },
  { id: "booking", label: "가격·예약" },
  { id: "schedules", label: "회차·재고" },
  { id: "relations", label: "연관 설정" },
] as const;

type ProductTab = (typeof productTabs)[number]["id"];

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function AdminProductForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [region, setRegion] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [startDate, setStartDate] = useState("2026-05-23");
  const [endDate, setEndDate] = useState("2026-06-30");
  const [activeTab, setActiveTab] = useState<ProductTab>("basic");
  const [submitting, setSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>({ tone: "idle", message: "" });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setSubmitState({ tone: "idle", message: "" });

    const productSlug = slug || slugify(title);

    try {
      const response = await fetch(withBasePath("/api/admin/products"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: productSlug,
          title,
          region,
          category,
          price: Number(price),
          duration: `${startDate} - ${endDate}`,
          badge: "신규",
        }),
      });
      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        setSubmitState({ tone: "error", message: data.message ?? "상품 등록 정보를 확인해주세요." });
        return;
      }

      setSubmitState({ tone: "success", message: data.message ?? "상품 등록 요청이 완료되었습니다." });
      setTitle("");
      setSlug("");
      setRegion("");
      setCategory("");
      setPrice("");
      router.refresh();
    } catch {
      setSubmitState({ tone: "error", message: "상품 등록 요청 중 오류가 발생했습니다." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="admin-inline-form admin-product-form" onSubmit={handleSubmit}>
      <div className="admin-product-form-tabs" role="tablist" aria-label="상품 등록 단계">
        {productTabs.map((tab) => (
          <button
            aria-selected={activeTab === tab.id}
            data-active={activeTab === tab.id}
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="admin-product-basic-fields" data-active={activeTab === "basic"}>
        <input aria-label="상품명" placeholder="상품명" required value={title} onChange={(event) => setTitle(event.target.value)} />
        <input
          aria-label="슬러그"
          placeholder="URL 슬러그"
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          onBlur={() => setSlug((current) => current || slugify(title))}
        />
        <input aria-label="지역" placeholder="지역" required value={region} onChange={(event) => setRegion(event.target.value)} />
        <input aria-label="카테고리" placeholder="카테고리" required value={category} onChange={(event) => setCategory(event.target.value)} />
        <input
          aria-label="가격"
          inputMode="numeric"
          placeholder="기본 가격"
          required
          value={price}
          onChange={(event) => setPrice(event.target.value.replace(/[^0-9]/g, ""))}
        />
        <DatePicker defaultValue={startDate} label="판매 시작일" name="productStartDate" onChange={setStartDate} />
        <DatePicker defaultValue={endDate} label="판매 종료일" name="productEndDate" onChange={setEndDate} />
      </div>
      <div className="admin-product-form-sections">
        <section data-active={activeTab === "media"}>
          <span>미디어</span>
          <div className="admin-upload-dropzone">
            대표 이미지를 드래그하거나 클릭해 업로드
            <small>세로형 썸네일, 상세 이미지, 후기 이미지에 공통 사용됩니다.</small>
          </div>
          <div className="admin-media-grid">
            {["대표", "상세 1", "상세 2"].map((item) => (
              <button key={item} type="button">
                <b>{item}</b>
                <small>이미지 슬롯</small>
              </button>
            ))}
          </div>
        </section>

        <section data-active={activeTab === "content"}>
          <span>상세 콘텐츠</span>
          <textarea aria-label="상품 소개" placeholder="상품 소개, 추천 대상, 일정, 포함/불포함, 장소, 호스트, 유의사항, 환불규정을 입력하세요." />
          <div className="admin-chip-options">
            {["상품 소개", "추천 대상", "일정", "포함/불포함", "장소", "호스트", "환불규정"].map((item) => (
              <label key={item}>
                <input defaultChecked type="checkbox" />
                {item}
              </label>
            ))}
          </div>
        </section>

        <section data-active={activeTab === "booking"}>
          <span>가격·예약</span>
          <div className="admin-radio-grid">
            {["즉시예약", "승인예약", "문의예약", "단체가능"].map((item) => (
              <label key={item}>
                <input name="bookingMode" type="radio" defaultChecked={item === "승인예약"} />
                {item}
              </label>
            ))}
          </div>
          <div className="admin-form-mini-grid">
            <input aria-label="최소 인원" placeholder="최소 인원" inputMode="numeric" />
            <input aria-label="최대 인원" placeholder="최대 인원" inputMode="numeric" />
            <input aria-label="팀당 인원" placeholder="팀당 인원" inputMode="numeric" />
          </div>
        </section>

        <section data-active={activeTab === "schedules"}>
          <span>회차·재고</span>
          <div className="admin-form-mini-grid">
            <input aria-label="회차 시간" placeholder="오전 10:30" />
            <input aria-label="팀 재고" placeholder="4팀" />
            <input aria-label="회차 가격" placeholder="회차 가격" inputMode="numeric" />
          </div>
        </section>

        <section data-active={activeTab === "relations"}>
          <span>연관 설정</span>
          <div className="admin-chip-options">
            {["마감임박", "1자리 남음", "가족 추천", "특가", "프리미엄", "웰니스"].map((item) => (
              <label key={item}>
                <input type="checkbox" />
                {item}
              </label>
            ))}
          </div>
        </section>
      </div>
      <button type="submit" disabled={submitting}>
        {submitting ? "저장중" : "상품 저장"}
      </button>
      {submitState.message ? (
        <p className="admin-form-message" data-tone={submitState.tone}>
          {submitState.message}
        </p>
      ) : null}
    </form>
  );
}
