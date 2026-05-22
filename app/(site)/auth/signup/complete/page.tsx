import type { Metadata } from "next";
import { RiHome5Line, RiLoginCircleLine, RiUserFollowLine } from "@remixicon/react";
import { CompletionPage } from "@/components/CompletionPage";
import { userRoutes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "회원가입 완료",
};

export default function SignupCompletePage() {
  return (
    <CompletionPage
      actions={[
        { href: userRoutes.login, icon: <RiLoginCircleLine size={18} />, label: "로그인하기" },
        { href: userRoutes.experiences, label: "로컬체험 둘러보기", variant: "secondary" },
        { href: userRoutes.home, icon: <RiHome5Line size={18} />, label: "홈으로", variant: "secondary" },
      ]}
      description="회원가입 정보가 접수되었습니다. 일반회원은 로그인 후 예약과 문의 내역을 확인할 수 있고, 기업·기관 회원은 운영팀 승인 후 단체 견적 기능을 이용할 수 있습니다."
      eyebrow="Join Complete"
      icon={<RiUserFollowLine size={32} />}
      note={<p>기업·기관 계정은 사업자 정보 확인이 필요할 수 있습니다. 승인 결과는 가입 시 입력한 연락처로 안내됩니다.</p>}
      steps={[
        { title: "가입 정보 확인", description: "입력한 기본 정보와 필수 약관 동의 여부를 확인합니다." },
        { title: "계정 이용 시작", description: "일반회원은 로그인 후 예약, 위시리스트, 문의 내역을 사용할 수 있습니다." },
        { title: "기업·기관 승인", description: "기업·기관 회원은 운영팀 확인 후 견적 요청과 기관 전용 상담이 열립니다." },
      ]}
      summary={[
        { label: "처리상태", value: "가입 접수 완료" },
        { label: "일반회원", value: "로그인 후 바로 이용" },
        { label: "기업·기관", value: "운영팀 승인 후 이용" },
      ]}
      title="회원가입이 완료되었습니다"
    />
  );
}
