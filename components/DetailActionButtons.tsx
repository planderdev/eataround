"use client";

import { useState } from "react";
import { RiCloseLine, RiQuestionAnswerLine, RiShareForwardLine } from "@remixicon/react";
import { Modal } from "@/components/Modal";
import { WishlistButton } from "@/components/WishlistButton";
import { withBasePath } from "@/lib/paths";

type DetailActionButtonsProps = {
  slug: string;
  title: string;
};

export function DetailActionButtons({ slug, title }: DetailActionButtonsProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleShare() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      window.dispatchEvent(new CustomEvent("site-toast", { detail: "링크가 복사되었습니다." }));
    } catch {
      window.dispatchEvent(new CustomEvent("site-toast", { detail: "공유를 완료하지 못했습니다." }));
    }
  }

  async function submitInquiry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch(withBasePath("/api/inquiry"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(formData.get("name") ?? ""),
          phone: String(formData.get("phone") ?? ""),
          message: String(formData.get("message") ?? ""),
          productSlug: slug,
        }),
      });
      const result = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) throw new Error(result?.message ?? "문의 접수에 실패했습니다.");
      setMessage(result?.message ?? "문의가 접수되었습니다.");
      window.setTimeout(() => setOpen(false), 900);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "문의 접수에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="experience-detail-actions" id="share">
        <WishlistButton slug={slug} label="저장" className="detail-wishlist-button" showLabel />
        <button type="button" onClick={() => setOpen(true)}>
          <RiQuestionAnswerLine size={18} />
          문의
        </button>
        <button type="button" onClick={handleShare}>
          <RiShareForwardLine size={18} />
          공유
        </button>
      </div>
      <Modal isOpen={open} onClose={() => setOpen(false)} label="상품 문의">
        <section className="detail-inquiry-modal" role="dialog" aria-modal="true" aria-labelledby="detail-inquiry-title">
          <header>
            <div>
              <span className="eyebrow">Inquiry</span>
              <h2 id="detail-inquiry-title">{title} 문의</h2>
            </div>
            <button type="button" aria-label="닫기" onClick={() => setOpen(false)}>
              <RiCloseLine size={22} />
            </button>
          </header>
          <form onSubmit={submitInquiry}>
            <label>
              이름
              <input name="name" required placeholder="이름을 입력하세요" />
            </label>
            <label>
              연락처
              <input name="phone" required placeholder="연락 가능한 번호" />
            </label>
            <label>
              문의 내용
              <textarea name="message" required placeholder="일정, 인원, 단체 이용 등 궁금한 점을 남겨주세요." />
            </label>
            {message ? <p>{message}</p> : null}
            <button className="primary-button full" disabled={isSubmitting} type="submit">
              {isSubmitting ? "접수 중" : "문의 접수"}
            </button>
          </form>
        </section>
      </Modal>
    </>
  );
}
