import type { Metadata } from "next";
import Link from "next/link";
import { RiCalendarCheckLine, RiFileTextLine, RiMessage2Line, RiUser3Line } from "@remixicon/react";
import { SectionHeader } from "@/components/SectionHeader";
import { userRoutes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "마이페이지",
};

const mypageItems = [
  { title: "예약내역", description: "예약 상태, 일정, 인원 변경 요청", href: `${userRoutes.me}/reservations`, icon: RiCalendarCheckLine },
  { title: "견적내역", description: "단체 프로그램 문의와 견적 진행 상황", href: `${userRoutes.me}/quotes`, icon: RiFileTextLine },
  { title: "회원정보", description: "내 연락처와 회원 유형 관리", href: `${userRoutes.me}/profile`, icon: RiUser3Line },
  { title: "문의내역", description: "상품, 행사, 패키지 문의 기록", href: userRoutes.help, icon: RiMessage2Line },
];

export default function MyPage() {
  return (
    <section className="page-section">
      <SectionHeader
        eyebrow="My Page"
        title="마이페이지"
        description="예약과 문의, 견적 진행 상황을 편하게 확인하세요."
        level="h1"
      />
      <div className="mypage-layout">
        <aside className="mypage-panel">
          <span className="eyebrow">Account</span>
          <h2>단체 프로그램 상담</h2>
          <p>기업·기관 회원은 일정과 인원에 맞춘 프로그램 상담을 받을 수 있습니다.</p>
        </aside>
        <div className="card-grid">
          {mypageItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link className="admin-card" href={item.href} key={item.title}>
                <Icon size={24} />
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
