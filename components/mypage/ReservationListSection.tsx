"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RiArrowRightSLine } from "@remixicon/react";
import { StatusBadge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { MetaItem, SectionError, SectionSkeleton } from "@/components/mypage/MypageCommon";
import { fetchMyReservations } from "@/lib/api/me";
import { userRoutes } from "@/lib/routes";
import type { Reservation } from "@/types/api";

export function ReservationListSection() {
  const [items, setItems] = useState<Reservation[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  function load() {
    setStatus("loading");
    fetchMyReservations()
      .then((reservations) => {
        setItems(reservations);
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
        title="예약 내역이 없습니다."
        description="관심 있는 로컬체험을 예약하면 이곳에서 진행 상태를 확인할 수 있어요."
        action={
          <Link className="primary-button" href={userRoutes.experiences}>
            체험 둘러보기
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
        <MetaItem label="일정" value={card.schedule} />
        <MetaItem label="인원" value={card.people} />
        <MetaItem label="예약방식" value={card.reservationType} />
        <MetaItem label="금액" value={card.amount} />
      </dl>
      <p className="me-history-note">{card.nextAction}</p>
      <div className="me-history-actions">
        <Link className="secondary-button" href={`${userRoutes.me}/reservations/${card.id}`}>
          상세보기
        </Link>
        <Link className="primary-button" href={card.href}>
          다시 보기
          <RiArrowRightSLine size={16} />
        </Link>
      </div>
    </article>
  ));
}
