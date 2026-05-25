"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { SectionError, SectionSkeleton } from "@/components/mypage/MypageCommon";
import { fetchMyInquiries } from "@/lib/api/me";
import { userRoutes } from "@/lib/routes";
import type { Inquiry } from "@/types/api";

const TYPE_LABEL: Record<string, string> = {
  product: "상품 문의",
  event: "행사 문의",
  package: "패키지 문의",
  general: "일반 문의",
};

export function InquiryListSection() {
  const [items, setItems] = useState<Inquiry[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  function load() {
    setStatus("loading");
    fetchMyInquiries()
      .then((rows) => {
        setItems(rows);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }

  useEffect(load, []);

  if (status === "loading") return <SectionSkeleton />;
  if (status === "error") return <SectionError onRetry={load} />;
  if (!items.length) {
    return (
      <EmptyState
        title="문의 내역이 없습니다."
        description="문의 예약 상품이나 단체 상담 요청을 남기면 답변 진행 상태를 이곳에서 확인할 수 있어요."
        action={
          <Link className="primary-button" href={userRoutes.experiences}>
            문의 가능한 체험 보기
          </Link>
        }
      />
    );
  }

  return items.map((card) => (
    <article className="me-history-card" data-tone={card.statusTone} key={card.id}>
      <header>
        <div>
          <small>
            {card.id} · {TYPE_LABEL[card.inquiryType] ?? "문의"}
          </small>
          <strong>{card.title}</strong>
        </div>
        <StatusBadge tone={card.statusTone}>{card.status}</StatusBadge>
      </header>
      <p className="me-history-preview">{card.preview}</p>
      <dl className="me-history-meta">
        {card.preferredDate ? (
          <div>
            <dt>희망 일정</dt>
            <dd>{card.preferredDate}</dd>
          </div>
        ) : null}
        {typeof card.people === "number" ? (
          <div>
            <dt>인원</dt>
            <dd>{card.people}명</dd>
          </div>
        ) : null}
        <div>
          <dt>접수일</dt>
          <dd>{card.createdAt}</dd>
        </div>
      </dl>
      {card.answer ? (
        <div className="me-inquiry-answer">
          <strong>호스트 답변</strong>
          <p>{card.answer}</p>
        </div>
      ) : null}
      <div className="me-history-actions">
        <Link className="secondary-button" href={card.href}>
          상세보기
        </Link>
        {card.productSlug ? (
          <Link className="primary-button" href={`${userRoutes.experiences}/${card.productSlug}`}>
            체험 다시보기
          </Link>
        ) : null}
      </div>
    </article>
  ));
}
