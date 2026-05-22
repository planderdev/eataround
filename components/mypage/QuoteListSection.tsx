"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { MetaItem, SectionError, SectionSkeleton } from "@/components/mypage/MypageCommon";
import { fetchMyQuotes } from "@/lib/api/me";
import { userRoutes } from "@/lib/routes";
import type { Quote } from "@/types/api";

export function QuoteListSection() {
  const [items, setItems] = useState<Quote[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  function load() {
    setStatus("loading");
    fetchMyQuotes()
      .then((quotes) => {
        setItems(quotes);
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
        title="견적 내역이 없습니다."
        description="기업·기관 패키지 요청을 남기면 담당자 검토 상태를 확인할 수 있어요."
        action={
          <Link className="primary-button" href={userRoutes.b2bQuote}>
            견적 요청하기
          </Link>
        }
      />
    );
  }

  return items.map((card) => (
    <article className="me-history-card" data-tone={card.statusTone} key={card.id}>
      <header>
        <div>
          <small>{card.id}</small>
          <strong>{card.title}</strong>
        </div>
        <StatusBadge tone={card.statusTone}>{card.status}</StatusBadge>
      </header>
      <dl className="me-history-meta">
        <MetaItem label="프로그램" value={card.program} />
        <MetaItem label="기간" value={card.period} />
        <MetaItem label="인원" value={card.people} />
        <MetaItem label="예상견적" value={card.estimatedTotal} />
      </dl>
      <p className="me-history-note">
        {card.manager} · {card.lastUpdated}
      </p>
      <div className="me-history-actions">
        <Link className="secondary-button" href={`${userRoutes.me}/quotes/${card.id}`}>
          상세보기
        </Link>
        <Link className="primary-button" href={userRoutes.b2bQuote}>
          견적 수정 요청
        </Link>
      </div>
    </article>
  ));
}
