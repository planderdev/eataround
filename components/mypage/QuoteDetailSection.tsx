"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/Badge";
import { MetaItem, SectionError, SectionSkeleton, Timeline } from "@/components/mypage/MypageCommon";
import { fetchMyQuote } from "@/lib/api/me";
import { userRoutes } from "@/lib/routes";
import type { Quote } from "@/types/api";

export function QuoteDetailSection({ id }: { id: string }) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  function load() {
    setStatus("loading");
    fetchMyQuote(id)
      .then((item) => {
        setQuote(item);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }

  useEffect(load, [id]);

  if (status === "loading") return <SectionSkeleton count={1} />;
  if (status === "error" || !quote) return <SectionError onRetry={load} />;

  return (
    <article className="me-detail-card">
      <header>
        <div>
          <small>{quote.id}</small>
          <h2>{quote.title}</h2>
        </div>
        <StatusBadge tone={quote.statusTone}>{quote.status}</StatusBadge>
      </header>
      <dl className="me-detail-grid">
        <MetaItem label="프로그램" value={quote.program} />
        <MetaItem label="기간" value={quote.period} />
        <MetaItem label="인원" value={quote.people} />
        <MetaItem label="예상견적" value={quote.estimatedTotal} />
        <MetaItem label="담당자" value={quote.manager} />
        <MetaItem label="최근 업데이트" value={quote.lastUpdated} />
      </dl>
      <p className="me-detail-alert">
        {quote.manager}가 최근 {quote.lastUpdated}에 상태를 업데이트했습니다.
      </p>
      <Timeline items={quote.timeline} activeIndex={quote.statusTone === "pending" ? 1 : quote.statusTone === "received" ? 2 : 2} />
      <div className="me-history-actions">
        <Link className="secondary-button" href={`${userRoutes.me}/quotes`}>
          목록으로
        </Link>
        <Link className="primary-button" href={userRoutes.b2bQuote}>
          새 견적 요청
        </Link>
      </div>
    </article>
  );
}
