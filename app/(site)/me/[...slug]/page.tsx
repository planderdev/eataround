import type { Metadata } from "next";
import Link from "next/link";
import { RiArrowLeftLine, RiCalendarCheckLine, RiFileTextLine, RiHeart3Line, RiStarLine, RiUserSettingsLine } from "@remixicon/react";
import { SectionHeader } from "@/components/SectionHeader";
import { userRoutes } from "@/lib/routes";

type PageProps = {
  params: Promise<{ slug: string[] }>;
};

const pageMap: Record<string, { title: string; description: string; icon: typeof RiCalendarCheckLine; rows: string[] }> = {
  reservations: {
    title: "예약 내역",
    description: "예약 대기, 확정, 완료, 취소 상태를 확인합니다.",
    icon: RiCalendarCheckLine,
    rows: ["제주 발효 밥상 클래스 · 승인 대기", "양조장과 마을 산책 · 예약 확정", "감귤 디저트 랩 · 리뷰 작성 가능"],
  },
  quotes: {
    title: "견적 내역",
    description: "기업·기관 견적 요청과 관리자 응답을 확인합니다.",
    icon: RiFileTextLine,
    rows: ["제주문화재단 워크숍 · 검토 중", "교육기관 미식 클래스 · 견적서 수신", "브랜드 팝업 프로그램 · 추가 문의"],
  },
  wishlist: {
    title: "찜",
    description: "관심 있는 로컬체험을 다시 확인합니다.",
    icon: RiHeart3Line,
    rows: ["해녀의 계절 바다 밥상", "제주 감귤 디저트 랩", "팜투마켓 피크닉"],
  },
  reviews: {
    title: "내 리뷰",
    description: "작성 가능한 리뷰와 작성한 리뷰를 관리합니다.",
    icon: RiStarLine,
    rows: ["이용 완료 체험 1건", "작성한 후기 2건", "호스트 답글 1건"],
  },
  profile: {
    title: "회원 정보 수정",
    description: "연락처, 비밀번호, 마케팅 수신 동의를 관리합니다.",
    icon: RiUserSettingsLine,
    rows: ["기본 정보", "비밀번호 변경", "마케팅 수신 동의", "회원 탈퇴"],
  },
};

export function generateStaticParams() {
  return Object.keys(pageMap).map((slug) => ({ slug: [slug] }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = pageMap[slug[0]] ?? pageMap.reservations;
  return { title: page.title, description: page.description };
}

export default async function MeSectionPage({ params }: PageProps) {
  const { slug } = await params;
  const page = pageMap[slug[0]] ?? pageMap.reservations;
  const Icon = page.icon;
  const detailId = slug[1];

  return (
    <section className="page-section">
      <Link className="journal-detail-back" href={userRoutes.me}>
        <RiArrowLeftLine size={18} />
        마이페이지 홈
      </Link>
      <SectionHeader
        eyebrow={detailId ? "Detail" : "My Page"}
        title={detailId ? `${page.title} 상세` : page.title}
        description={detailId ? `번호 ${detailId}의 상세 정보를 확인합니다.` : page.description}
        level="h1"
      />
      <div className="me-section-panel">
        <Icon size={26} />
        <div className="me-section-list">
          {page.rows.map((row) => (
            <article key={row}>
              <strong>{row}</strong>
              <span>{detailId ? "상세 상태와 변경 이력을 확인할 수 있습니다." : "상세 보기에서 다음 액션을 이어갈 수 있습니다."}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
