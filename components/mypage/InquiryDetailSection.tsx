"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/Badge";
import { MetaItem, SectionError, SectionSkeleton } from "@/components/mypage/MypageCommon";
import { fetchMyInquiry } from "@/lib/api/me";
import { userRoutes } from "@/lib/routes";
import type { Inquiry } from "@/types/api";

const TYPE_LABEL: Record<string, string> = {
  product: "상품 문의",
  event: "행사 문의",
  package: "패키지 문의",
  general: "일반 문의",
};

export function InquiryDetailSection({ id }: { id: string }) {
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  function load() {
    setStatus("loading");
    fetchMyInquiry(id)
      .then((item) => {
        setInquiry(item);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }

  useEffect(load, [id]);

  if (status === "loading") return <SectionSkeleton count={1} />;
  if (status === "error" || !inquiry) return <SectionError onRetry={load} />;

  return (
    <article className="me-detail-card">
      <header>
        <div>
          <small>{inquiry.id} · {TYPE_LABEL[inquiry.inquiryType] ?? "문의"}</small>
          <h2>{inquiry.title}</h2>
        </div>
        <StatusBadge tone={inquiry.statusTone}>{inquiry.status}</StatusBadge>
      </header>
      <p className="me-detail-alert">{inquiry.preview}</p>
      <dl className="me-detail-grid">
        <MetaItem label="접수일" value={inquiry.createdAt} />
        {inquiry.preferredDate ? <MetaItem label="희망 일정" value={inquiry.preferredDate} /> : null}
        {typeof inquiry.people === "number" ? <MetaItem label="인원" value={`${inquiry.people}명`} /> : null}
        {inquiry.productSlug ? <MetaItem label="연관 상품" value={inquiry.productSlug} /> : null}
      </dl>
      {inquiry.answer ? (
        <div className="me-inquiry-answer">
          <strong>호스트 답변</strong>
          <p>{inquiry.answer}</p>
        </div>
      ) : (
        <p className="me-detail-alert">호스트 답변을 준비 중입니다. 회신은 문자 또는 이메일로 함께 안내됩니다.</p>
      )}
      <div className="me-history-actions">
        <Link className="secondary-button" href={`${userRoutes.me}/inquiries`}>
          목록으로
        </Link>
        {inquiry.productSlug ? (
          <Link className="primary-button" href={`${userRoutes.experiences}/${inquiry.productSlug}`}>
            체험 다시보기
          </Link>
        ) : null}
      </div>
    </article>
  );
}
