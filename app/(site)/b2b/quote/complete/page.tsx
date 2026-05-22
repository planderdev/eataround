import type { Metadata } from "next";
import { RiFileList3Line, RiHome5Line, RiInboxArchiveLine } from "@remixicon/react";
import { CompletionPage } from "@/components/CompletionPage";
import { userRoutes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "견적 요청 완료",
};

export default function QuoteCompletePage() {
  return (
    <CompletionPage
      actions={[
        { href: `${userRoutes.me}/quotes`, icon: <RiFileList3Line size={18} />, label: "견적내역 보기" },
        { href: userRoutes.b2bPackages, label: "패키지 더 보기", variant: "secondary" },
        { href: userRoutes.home, icon: <RiHome5Line size={18} />, label: "홈으로", variant: "secondary" },
      ]}
      description="단체 견적 요청이 접수되었습니다. 운영팀이 기간, 인원, 선택 프로그램과 옵션을 검토한 뒤 운영 가능 구성과 최종 견적을 안내드립니다."
      eyebrow="Quote Complete"
      icon={<RiInboxArchiveLine size={32} />}
      note={<p>일정이 촉박하거나 50명 이상 단체인 경우 운영 가능 여부 확인에 시간이 더 필요할 수 있습니다.</p>}
      steps={[
        { title: "요청 내용 검토", description: "기간, 인원, 예산, 요청사항을 기준으로 구성 가능 여부를 확인합니다." },
        { title: "프로그램 조합", description: "선택한 체험과 식사·숙박·이동 옵션을 단체 조건에 맞게 조정합니다." },
        { title: "최종 견적 안내", description: "담당자가 견적서와 진행 가능 일정을 연락처로 안내합니다." },
      ]}
      summary={[
        { label: "처리상태", value: "견적 요청 접수" },
        { label: "담당부서", value: "기업·기관 운영팀" },
        { label: "확인 위치", value: "마이페이지 견적내역" },
      ]}
      title="견적 요청이 접수되었습니다"
    />
  );
}
