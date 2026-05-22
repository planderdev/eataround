"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RiCheckboxCircleLine, RiFileList3Line, RiShieldCheckLine } from "@remixicon/react";
import { SectionHeader } from "@/components/SectionHeader";
import { confirmReservation, fetchMyReservation } from "@/lib/api/me";
import { userRoutes } from "@/lib/routes";
import type { Reservation } from "@/types/api";

type CheckoutClientProps = {
  reservationId: string;
};

export function CheckoutClient({ reservationId }: CheckoutClientProps) {
  const router = useRouter();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchMyReservation(reservationId)
      .then((item) => {
        if (alive) setReservation(item);
      })
      .catch(() => {
        if (alive) setError("예약 정보를 불러오지 못했습니다.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [reservationId]);

  async function handleSubmit() {
    if (!agreed || submitting) return;
    setSubmitting(true);
    try {
      await confirmReservation(reservationId);
      router.push(`${userRoutes.bookingComplete}/${reservationId}`);
    } catch {
      setError("예약 신청 처리 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="page-section checkout-page">
      <SectionHeader eyebrow="Checkout" title="예약 확인" description="예약 신청 전 일정과 약관을 확인해 주세요." level="h1" />
      <div className="checkout-layout">
        <main className="checkout-card">
          <h2>예약 요약</h2>
          {loading ? (
            <div className="checkout-skeleton" aria-label="예약 정보 로딩 중" />
          ) : error ? (
            <p className="form-message error">{error}</p>
          ) : (
            <dl>
              <div>
                <dt>예약번호</dt>
                <dd>{reservation?.id ?? reservationId}</dd>
              </div>
              <div>
                <dt>상품</dt>
                <dd>{reservation?.title ?? "제주 로컬체험"}</dd>
              </div>
              <div>
                <dt>일정</dt>
                <dd>{reservation?.schedule ?? "-"}</dd>
              </div>
              <div>
                <dt>인원</dt>
                <dd>{reservation?.people ?? "-"}</dd>
              </div>
              <div>
                <dt>금액</dt>
                <dd>{reservation?.amount ?? "-"}</dd>
              </div>
              <div>
                <dt>상태</dt>
                <dd>{reservation?.status ?? "예약 신청 대기"}</dd>
              </div>
            </dl>
          )}
          <label className="checkout-agree">
            <input checked={agreed} type="checkbox" onChange={(event) => setAgreed(event.target.checked)} />
            <span>
              <RiShieldCheckLine size={18} />
              취소·환불 정책과 예약 유의사항을 확인했습니다.
            </span>
          </label>
          <button className="checkout-terms-toggle" type="button" onClick={() => setTermsOpen((value) => !value)}>
            약관 자세히 {termsOpen ? "닫기" : "보기"}
          </button>
          {termsOpen ? (
            <div className="checkout-terms-panel">
              예약 가능 여부는 호스트와 운영팀 확인 후 최종 확정됩니다. 일정 변경, 취소, 환불은 상품별 환불규정과 이용일 기준에 따라 처리되며,
              악천후나 현장 운영 상황에 따라 일부 코스가 조정될 수 있습니다.
            </div>
          ) : null}
        </main>
        <aside className="checkout-card checkout-payment">
          <RiFileList3Line size={24} />
          <h2>결제 안내</h2>
          <p>예약 신청으로 접수되며, 담당자가 가능 여부와 결제 안내를 별도로 전달합니다.</p>
          <button className="primary-button full" disabled={!agreed || loading || submitting} type="button" onClick={handleSubmit}>
            <RiCheckboxCircleLine size={18} />
            {submitting ? "처리 중" : "예약 신청 완료"}
          </button>
        </aside>
      </div>
    </section>
  );
}
