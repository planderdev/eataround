import type { Metadata } from "next";
import Link from "next/link";
import { RiCheckboxCircleLine, RiFileList3Line, RiShieldCheckLine } from "@remixicon/react";
import { SectionHeader } from "@/components/SectionHeader";

type PageProps = {
  params: Promise<{ reservationId: string }>;
};

export const metadata: Metadata = {
  title: "예약 확인",
};

export function generateStaticParams() {
  return [{ reservationId: "preview" }];
}

export default async function CheckoutPage({ params }: PageProps) {
  const { reservationId } = await params;

  return (
    <section className="page-section checkout-page">
      <SectionHeader eyebrow="Checkout" title="예약 확인" description="예약 신청 전 일정과 약관을 확인해 주세요." level="h1" />
      <div className="checkout-layout">
        <main className="checkout-card">
          <h2>예약 요약</h2>
          <dl>
            <div>
              <dt>예약번호</dt>
              <dd>{reservationId}</dd>
            </div>
            <div>
              <dt>상품</dt>
              <dd>제주 로컬체험</dd>
            </div>
            <div>
              <dt>상태</dt>
              <dd>예약 신청 대기</dd>
            </div>
          </dl>
          <label className="checkout-agree">
            <input type="checkbox" />
            <span>
              <RiShieldCheckLine size={18} />
              취소·환불 정책과 예약 유의사항을 확인했습니다.
            </span>
          </label>
        </main>
        <aside className="checkout-card checkout-payment">
          <RiFileList3Line size={24} />
          <h2>결제 안내</h2>
          <p>예약 신청으로 접수되며, 담당자가 가능 여부와 결제 안내를 별도로 전달합니다.</p>
          <Link className="primary-button full" href={`/booking/complete/${reservationId}`}>
            <RiCheckboxCircleLine size={18} />
            예약 신청 완료
          </Link>
        </aside>
      </div>
    </section>
  );
}
