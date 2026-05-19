import type { Metadata } from "next";
import Link from "next/link";
import { RiCheckboxCircleLine } from "@remixicon/react";
import { SectionHeader } from "@/components/SectionHeader";
import { userRoutes } from "@/lib/routes";

type PageProps = {
  params: Promise<{ reservationId: string }>;
};

export const metadata: Metadata = {
  title: "예약 완료",
};

export function generateStaticParams() {
  return [{ reservationId: "preview" }];
}

export default async function BookingCompletePage({ params }: PageProps) {
  const { reservationId } = await params;

  return (
    <section className="page-section complete-page">
      <div className="complete-card">
        <RiCheckboxCircleLine size={44} />
        <SectionHeader
          eyebrow="Complete"
          title="예약 신청이 접수되었습니다"
          description={`예약번호 ${reservationId}의 확인 메일을 발송했습니다.`}
          level="h1"
        />
        <div className="complete-actions">
          <Link className="primary-button" href={`${userRoutes.me}/reservations/${reservationId}`}>
            예약 상세 보기
          </Link>
          <Link className="secondary-button" href={userRoutes.experiences}>
            다른 체험 보기
          </Link>
        </div>
      </div>
    </section>
  );
}
