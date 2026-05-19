"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DatePicker } from "@/components/DatePicker";
import { withBasePath } from "@/lib/paths";

type SubmitState = {
  tone: "idle" | "success" | "error";
  message: string;
};

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
