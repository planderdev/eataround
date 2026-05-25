import type { Metadata } from "next";
import { RiCalendarCheckLine, RiChat3Line, RiHome5Line, RiListCheck3 } from "@remixicon/react";
import { CompletionPage } from "@/components/CompletionPage";
import { userRoutes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "예약 신청 완료",
};

type SearchParams = Record<string, string | string[] | undefined>;

function valueOf(params: SearchParams, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function BookingCompleteIndexPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const params = searchParams ? await searchParams : {};
  const isInquiry = valueOf(params, "mode") === "inquiry";

  if (isInquiry) {
    return (
      <CompletionPage
        actions={[
          { href: `${userRoutes.me}/reservations`, icon: <RiListCheck3 size={18} />, label: "문의 내역 보기" },
          { href: userRoutes.experiences, label: "다른 체험 보기", variant: "secondary" },
          { href: userRoutes.home, icon: <RiHome5Line size={18} />, label: "홈으로", variant: "secondary" },
        ]}
        description="남겨주신 희망 일정과 인원을 기준으로 호스트가 진행 가능 여부를 확인합니다. 24시간 안에 문자 또는 이메일로 안내드립니다."
        eyebrow="Inquiry Submitted"
        icon={<RiChat3Line size={32} />}
        note={<p>희망 일정이 가까운 경우 운영팀이 빠른 회신을 위해 별도로 연락드릴 수 있습니다.</p>}
        steps={[
          { title: "호스트 일정 확인", description: "희망 일정·인원을 기준으로 호스트의 운영 가능 여부를 확인합니다." },
          { title: "예약 안내 회신", description: "회신 시점에는 가격, 진행 방식, 모일 장소가 함께 포함됩니다." },
          { title: "결제 및 확정", description: "회신에 포함된 결제 안내를 완료하면 최종 확정됩니다." },
        ]}
        summary={[
          { label: "처리상태", value: "문의 접수" },
          { label: "안내방식", value: "문자·이메일 안내" },
          { label: "확인 위치", value: "마이페이지 문의내역" },
        ]}
        title="문의가 접수되었습니다"
      />
    );
  }

  return (
    <CompletionPage
      actions={[
        { href: `${userRoutes.me}/reservations`, icon: <RiListCheck3 size={18} />, label: "예약내역 보기" },
        { href: userRoutes.experiences, label: "다른 체험 보기", variant: "secondary" },
        { href: userRoutes.home, icon: <RiHome5Line size={18} />, label: "홈으로", variant: "secondary" },
      ]}
      description="선택한 일정의 예약 신청이 접수되었습니다. 운영팀이 회차 재고와 진행 가능 여부를 확인한 뒤 결제 및 확정 안내를 보내드립니다."
      eyebrow="Reservation Complete"
      icon={<RiCalendarCheckLine size={32} />}
      note={<p>승인예약 상품은 호스트 확인 후 최종 확정됩니다. 확정 전에는 결제가 완료되어도 일정이 변경될 수 있습니다.</p>}
      steps={[
        { title: "예약 내용 확인", description: "선택한 날짜, 시간, 인원, 옵션 정보를 운영팀이 확인합니다." },
        { title: "진행 가능 여부 안내", description: "팀 단위 재고와 호스트 일정을 확인해 문자 또는 이메일로 안내합니다." },
        { title: "결제 및 최종 확정", description: "결제 안내를 받은 뒤 결제가 완료되면 예약이 확정됩니다." },
      ]}
      summary={[
        { label: "처리상태", value: "예약 신청 접수" },
        { label: "안내방식", value: "문자·이메일 안내" },
        { label: "확인 위치", value: "마이페이지 예약내역" },
      ]}
      title="예약 신청이 접수되었습니다"
    />
  );
}
