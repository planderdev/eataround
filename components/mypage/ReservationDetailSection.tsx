"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/Badge";
import { MetaItem, SectionError, SectionSkeleton, Timeline } from "@/components/mypage/MypageCommon";
import { fetchMyReservation } from "@/lib/api/me";
import { userRoutes } from "@/lib/routes";
import type { Reservation } from "@/types/api";

export function ReservationDetailSection({ id }: { id: string }) {
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  function load() {
    setStatus("loading");
    fetchMyReservation(id)
      .then((item) => {
        setReservation(item);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }

  useEffect(load, [id]);

  if (status === "loading") return <SectionSkeleton count={1} />;
  if (status === "error" || !reservation) return <SectionError onRetry={load} />;

  return (
    <article className="me-detail-card">
      <header>
        <div>
          <small>{reservation.id}</small>
          <h2>{reservation.title}</h2>
        </div>
        <StatusBadge tone={reservation.statusTone}>{reservation.status}</StatusBadge>
      </header>
      <dl className="me-detail-grid">
        <MetaItem label="일정" value={reservation.schedule} />
        <MetaItem label="인원" value={reservation.people} />
        <MetaItem label="장소" value={reservation.location} />
        <MetaItem label="호스트" value={reservation.host} />
        <MetaItem label="예약방식" value={reservation.reservationType} />
        <MetaItem label="결제" value={reservation.payment} />
        <MetaItem label="금액" value={reservation.amount} />
        <MetaItem label="다음 액션" value={reservation.nextAction} />
      </dl>
      <p className="me-detail-alert">{reservation.nextAction}</p>
      <Timeline items={reservation.timeline} activeIndex={reservation.statusTone === "pending" ? 1 : reservation.statusTone === "done" ? 3 : 2} />
      <div className="me-history-actions">
        <Link className="secondary-button" href={`${userRoutes.me}/reservations`}>
          목록으로
        </Link>
        <Link className="primary-button" href={reservation.href}>
          상품 보기
        </Link>
      </div>
    </article>
  );
}
