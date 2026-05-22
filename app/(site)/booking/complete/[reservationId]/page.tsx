import type { Metadata } from "next";
import { RiCalendarCheckLine, RiHome5Line, RiListCheck3 } from "@remixicon/react";
import { CompletionPage } from "@/components/CompletionPage";
import { userRoutes } from "@/lib/routes";

type PageProps = {
  params: Promise<{ reservationId: string }>;
};

export const metadata: Metadata = {
  title: "예약 신청 완료",
};

export function generateStaticParams() {
  return [{ reservationId: "preview" }];
}

export default async function BookingCompletePage({ params }: PageProps) {
  const { reservationId } = await params;

  return (
    <CompletionPage
      actions={[
        { href: `${userRoutes.me}/reservations/${reservationId}`, icon: <RiListCheck3 size={18} />, label: "예약 상세 보기" },
        { href: userRoutes.experiences, label: "다른 체험 보기", variant: "secondary" },
        { href: userRoutes.home, icon: <RiHome5Line size={18} />, label: "홈으로", variant: "secondary" },
      ]}
      description={`예약번호 ${reservationId}의 신청 내역이 접수되었습니다. 운영팀이 회차 재고와 진행 가능 여부를 확인한 뒤 결제 및 확정 안내를 보내드립니다.`}
      eyebrow="Reservation Complete"
      icon={<RiCalendarCheckLine size={32} />}
      note={<p>승인예약 상품은 호스트 확인 후 최종 확정됩니다. 확정 전에는 결제가 완료되어도 일정이 변경될 수 있습니다.</p>}
      steps={[
        { title: "예약 내용 확인", description: "선택한 날짜, 시간, 인원, 옵션 정보를 운영팀이 확인합니다." },
        { title: "진행 가능 여부 안내", description: "팀 단위 재고와 호스트 일정을 확인해 문자 또는 이메일로 안내합니다." },
        { title: "결제 및 최종 확정", description: "결제 안내를 받은 뒤 결제가 완료되면 예약이 확정됩니다." },
      ]}
      summary={[
        { label: "예약번호", value: reservationId },
        { label: "처리상태", value: "예약 신청 접수" },
        { label: "확인 위치", value: "마이페이지 예약내역" },
      ]}
      title="예약 신청이 접수되었습니다"
    />
  );
}
