"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import {
  RiArrowRightSLine,
  RiCloseLine,
  RiStarFill,
  RiStarLine,
} from "@remixicon/react";
import { StatusBadge, type BadgeTone } from "@/components/Badge";
import { FormField } from "@/components/FormField";
import { Modal } from "@/components/Modal";

export type MyReviewItem = {
  date: string;
  href: string;
  product?: {
    href: string;
    image: string;
    title: string;
  };
  productHref: string;
  rating: number | null;
  status: string;
  statusTone: BadgeTone;
  text: string;
  title: string;
};

type SubmittedReview = {
  date: string;
  rating: number;
  text: string;
};

const ratingOptions = [1, 2, 3, 4, 5];

export function MyReviewList({ items }: { items: MyReviewItem[] }) {
  const [activeItem, setActiveItem] = useState<MyReviewItem | null>(null);
  const [draftRating, setDraftRating] = useState(5);
  const [draftText, setDraftText] = useState("");
  const [touched, setTouched] = useState(false);
  const [submittedReviews, setSubmittedReviews] = useState<Record<string, SubmittedReview>>({});
  const [message, setMessage] = useState("");
  const canSubmit = draftText.trim().length >= 10;

  function openModal(item: MyReviewItem) {
    setActiveItem(item);
    setDraftRating(5);
    setDraftText("");
    setTouched(false);
    setMessage("");
  }

  function closeModal() {
    setActiveItem(null);
    setTouched(false);
  }

  function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeItem) return;

    if (!canSubmit) {
      setTouched(true);
      return;
    }

    setSubmittedReviews((current) => ({
      ...current,
      [activeItem.title]: {
        date: "방금 작성",
        rating: draftRating,
        text: draftText.trim(),
      },
    }));
    setMessage(`${activeItem.title} 후기가 등록되었습니다.`);
    closeModal();
  }

  return (
    <>
      <div className="me-review-list">
        {message ? <p className="me-review-feedback">{message}</p> : null}
        {items.map((item) => {
          const submitted = submittedReviews[item.title];
          const displayRating = submitted?.rating ?? item.rating;
          const displayText = submitted?.text ?? item.text;
          const displayDate = submitted?.date ?? item.date;
          const displayStatus = submitted ? "작성 완료" : item.status;
          const displayTone: BadgeTone = submitted ? "done" : item.status === "작성 가능" ? "primary" : item.statusTone;

          return (
            <article className="me-review-card" key={item.title}>
              {item.product ? (
                <Link className="me-review-thumb" href={item.product.href} aria-label={`${item.product.title} 상세보기`}>
                  <img src={item.product.image} alt={item.product.title} loading="lazy" />
                </Link>
              ) : null}
              <div className="me-review-content">
                <header>
                  <div>
                    <small>{displayDate}</small>
                    <strong>{item.title}</strong>
                  </div>
                  <StatusBadge tone={displayTone}>{displayStatus}</StatusBadge>
                </header>
                <p>{displayText}</p>
                <div className="me-review-bottom">
                  <ReviewRating rating={displayRating} />
                  {displayRating ? (
                    <Link className="secondary-button " href={item.productHref}>
                      후기 보기
                      <RiArrowRightSLine size={16} />
                    </Link>
                  ) : (
                    <button className="primary-button" onClick={() => openModal(item)} type="button">
                      후기 작성
                      <RiArrowRightSLine size={16} />
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <Modal isOpen={Boolean(activeItem)} onClose={closeModal} label="후기 작성">
        <section className="review-write-modal" aria-modal="true" role="dialog" aria-labelledby="review-write-title">
          <header className="review-write-modal-header">
            <div> 
              <h2 id="review-write-title">후기 작성</h2>
            </div>
            <button className="review-write-modal-close" aria-label="후기 작성 닫기" onClick={closeModal} type="button">
              <RiCloseLine size={24} />
            </button>
          </header>

          {activeItem ? (
            <form className="review-write-form" onSubmit={submitReview}>
              <div className="review-write-product">
                {activeItem.product ? <img src={activeItem.product.image} alt={activeItem.product.title} /> : null}
                <span>
                  <small>{activeItem.date}</small>
                  <strong>{activeItem.title}</strong>
                  <Link href={activeItem.productHref}>상품 상세보기</Link>
                </span>
              </div>

              <div className="review-write-rating-control">
                <span>
                  <small>별점</small>
                  <strong>{draftRating}.0</strong>
                </span>
                <div className="review-write-stars" role="radiogroup" aria-label="별점 선택">
                  {ratingOptions.map((score) => {
                    const active = score <= draftRating;
                    const Icon = active ? RiStarFill : RiStarLine;

                    return (
                      <button
                        aria-checked={draftRating === score}
                        aria-label={`${score}점`}
                        className="review-write-star-button"
                        data-active={active}
                        key={score}
                        onClick={() => setDraftRating(score)}
                        role="radio"
                        type="button"
                      >
                        <Icon size={20} />
                      </button>
                    );
                  })}
                </div>
              </div>

              <FormField error={touched && !canSubmit ? "후기는 10자 이상 입력해 주세요." : undefined} label="후기 내용" required>
                <textarea
                  maxLength={500}
                  onChange={(event) => {
                    setDraftText(event.target.value);
                    if (touched) setTouched(false);
                  }}
                  placeholder="체험에서 좋았던 점, 호스트 응대, 추천하고 싶은 대상을 남겨주세요."
                  value={draftText}
                />
              </FormField>
              <p className="review-write-helper">{draftText.length}/500 · 최소 10자</p>

              <footer className="review-write-footer">
                <button className="secondary-button" onClick={closeModal} type="button">
                  취소
                </button>
                <button className="primary-button" disabled={!canSubmit} type="submit">
                  등록하기
                </button>
              </footer>
            </form>
          ) : null}
        </section>
      </Modal>
    </>
  );
}

function ReviewRating({ rating }: { rating: number | null }) {
  if (!rating) {
    return (
      <span className="me-review-rating is-empty">
        <RiStarLine size={16} />
        후기 작성 대기
      </span>
    );
  }

  return (
    <span className="me-review-rating" aria-label={`별점 ${rating}.0`}>
      {ratingOptions.map((score) =>
        score <= rating ? <RiStarFill aria-hidden key={score} size={16} /> : <RiStarLine aria-hidden key={score} size={16} />,
      )}
      <b>{rating}.0</b>
    </span>
  );
}
