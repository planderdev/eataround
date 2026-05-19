"use client";

import { useEffect, useState, type FocusEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  RiArticleLine,
  RiBookOpenLine,
  RiBuilding2Line,
  RiCalendarEventLine,
  RiDiscountPercentLine,
  RiFileList3Line,
  RiHomeSmile2Line,
  RiLeafLine,
  RiMapPinLine,
  RiQuestionAnswerLine,
  RiRestaurant2Line,
  RiSearchLine,
  RiSparkling2Line,
  RiTeamLine,
  RiUserAddLine,
  RiUser3Line,
} from "@remixicon/react";
import { MobileMenu } from "@/components/MobileMenu";
import { userRoutes } from "@/lib/routes";
import { withBasePath } from "@/lib/paths";

const navItems = [
  {
    label: "로컬체험",
    href: userRoutes.experiences,
    eyebrow: "Experience",
    title: "취향에 맞는 제주 로컬체험",
    description: "미식, 베이킹, 지역·전통, 웰니스까지 일정과 인원에 맞춰 빠르게 찾아보세요.",
    image: "https://cdn.imweb.me/thumbnail/20230831/5089900ac1a12.jpg",
    links: [
      { label: "전체 체험", description: "예약 가능한 상품 전체보기", href: userRoutes.experiences, icon: RiRestaurant2Line },
      { label: "지역별 체험", description: "제주시·서귀포·구좌 코스", href: `${userRoutes.experiences}?region=제주시`, icon: RiMapPinLine },
      { label: "원데이 클래스", description: "1자리 남은 클래스 포함", href: `${userRoutes.experiences}?seat=last`, icon: RiLeafLine },
      { label: "특가 상품", description: "마감임박 할인 체험", href: `${userRoutes.experiences}?badge=특가`, icon: RiDiscountPercentLine },
    ],
    featured: { label: "추천", title: "오늘 예약 가능한 로컬 체험", href: userRoutes.experiences },
  },
  {
    label: "기획전",
    href: userRoutes.curations,
    eyebrow: "Curations",
    title: "취향별 제주 로컬 큐레이션",
    description: "시즌, 지역, 목적에 맞춰 묶은 체험을 한 번에 둘러보세요.",
    image: "https://cdn.imweb.me/thumbnail/20230831/2ca78f5658b74.jpg",
    links: [
      { label: "기획전 전체", description: "테마별 컬렉션 모아보기", href: userRoutes.curations, icon: RiSparkling2Line },
      { label: "미식 여행", description: "제주 한 끼를 오래 기억하는 방법", href: `${userRoutes.curations}/jeju-local-food`, icon: RiRestaurant2Line },
      { label: "서귀포 코스", description: "양조장과 마을 산책", href: `${userRoutes.curations}/seogwipo-brewery`, icon: RiMapPinLine },
      { label: "기관 워크숍", description: "단체 인원에 맞춘 추천 코스", href: `${userRoutes.curations}/team-workshop`, icon: RiBuilding2Line },
    ],
    featured: { label: "Theme", title: "기획전과 포함 상품 확인", href: userRoutes.curations },
  },
  {
    label: "진행중인 행사",
    href: "/events",
    eyebrow: "Events",
    title: "지금 열리는 로컬 행사",
    description: "진행중인 행사와 종료된 포트폴리오를 구분해 행사 결과까지 확인할 수 있습니다.",
    image: "https://cdn.imweb.me/thumbnail/20230831/dca60ec8c7676.jpg",
    links: [
      { label: "진행중인 행사", description: "현재 신청 가능한 행사", href: "/events", icon: RiCalendarEventLine },
      { label: "종료된 행사", description: "이전 프로젝트 결과 보기", href: "/events/ended", icon: RiFileList3Line },
      { label: "로컬 PICK", description: "에디터가 고른 제철 행사", href: "/events", icon: RiHomeSmile2Line },
      { label: "단체 행사 문의", description: "기관·기업 맞춤 행사", href: userRoutes.b2bQuote, icon: RiQuestionAnswerLine },
    ],
    featured: { label: "Live", title: "행사 배너와 모집 상태 확인", href: "/events" },
  },
  {
    label: "기업·기관 패키지",
    href: userRoutes.b2b,
    eyebrow: "Business",
    title: "단체 워크숍과 교육 패키지",
    description: "기간, 인원, 프로그램을 선택해 기관 전용 견적을 확인하세요.",
    image: "https://cdn.imweb.me/thumbnail/20230831/c0504b329b735.jpg",
    links: [
      { label: "패키지 소개", description: "기업·기관 전용 프로그램", href: userRoutes.b2bPackages, icon: RiBuilding2Line },
      { label: "프로그램 선택", description: "체험·강의 조합하기", href: userRoutes.b2bQuote, icon: RiFileList3Line },
      { label: "견적 요청", description: "인원별 할인 견적", href: userRoutes.b2bQuote, icon: RiTeamLine },
      { label: "상담 문의", description: "hello@eataround.co.kr", href: userRoutes.b2b, icon: RiQuestionAnswerLine },
    ],
    featured: { label: "B2B", title: "10명·20명·30명 단위 견적 설계", href: userRoutes.b2bQuote },
  },
  {
    label: "저널",
    href: "/journal",
    eyebrow: "Journal",
    title: "체험 전 읽는 로컬 이야기",
    description: "호스트 인터뷰, 제주 생산자 이야기, 단체 워크숍 팁을 소개합니다.",
    image: "https://cdn.imweb.me/thumbnail/20230831/266f4e7d5ddb5.jpg",
    links: [
      { label: "콘텐츠 전체", description: "최신 저널 모아보기", href: "/journal", icon: RiBookOpenLine },
      { label: "호스트 이야기", description: "로컬 호스트 인터뷰", href: "/journal/how-to-meet-jeju-hosts", icon: RiUser3Line },
      { label: "미식 노트", description: "발효와 식재료 이야기", href: "/journal/jeju-fermentation-notes", icon: RiArticleLine },
      { label: "워크숍 가이드", description: "기관 담당자를 위한 팁", href: "/journal/team-workshop-checklist", icon: RiFileList3Line },
    ],
    featured: { label: "Read", title: "제주 로컬 경험을 더 깊게 이해하기", href: "/journal" },
  },
];

export function Header() {
  const pathname = usePathname();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    setOpenIndex(null);
  }, [pathname]);

  function closeMegaMenu() {
    setOpenIndex(null);
    window.requestAnimationFrame(() => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    });
  }

  function closeOnBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setOpenIndex(null);
    }
  }

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" href="/" aria-label="이더라운드 홈" onClick={closeMegaMenu}>
          <img className="brand-logo" src={withBasePath("/assets/images/logo.png")} alt="eat.around" width={500} height={74} />
        </Link>

        <nav className="desktop-nav" aria-label="주요 메뉴">
          {navItems.map((item, index) => (
            <div
              className="desktop-nav-item"
              data-open={openIndex === index ? "true" : "false"}
              key={item.href}
              onBlur={closeOnBlur}
              onFocus={() => setOpenIndex(index)}
              onMouseEnter={() => setOpenIndex(index)}
              onMouseLeave={() => setOpenIndex(null)}
            >
              <Link
                aria-expanded={openIndex === index}
                className="desktop-nav-trigger"
                href={item.href}
                onClick={closeMegaMenu}
              >
                {item.label}
              </Link>
              <div className="mega-menu" aria-label={`${item.label} 메가메뉴`}>
                <div className="mega-menu-inner">
                  <div
                    className="mega-menu-intro"
                    style={{
                      backgroundImage: `linear-gradient(135deg, rgba(5, 37, 27, 0.9), rgba(5, 37, 27, 0.42)), url(${item.image})`,
                    }}
                  >
                    <span>{item.eyebrow}</span>
                    <strong>{item.title}</strong>
                    <p>{item.description}</p>
                  </div>

                  <div className="mega-menu-links">
                    {item.links.map((link) => {
                      const Icon = link.icon;

                      return (
                        <Link className="mega-menu-link" href={link.href} key={link.label} onClick={closeMegaMenu}>
                          <span className="mega-menu-icon">
                            <Icon size={20} />
                          </span>
                          <span className="mega-menu-link-copy">
                            <strong>{link.label}</strong>
                            <small>{link.description}</small>
                          </span>
                        </Link>
                      );
                    })}
                  </div>

                </div>
              </div>
            </div>
          ))}
        </nav>

        <div className="header-actions">
          <Link className="icon-button" href={userRoutes.search} aria-label="검색" onClick={closeMegaMenu}>
            <RiSearchLine size={20} />
          </Link>
          <Link className="icon-button" href={userRoutes.signup} aria-label="회원가입" onClick={closeMegaMenu}>
            <RiUserAddLine size={20} />
          </Link>
          <Link className="icon-button" href={userRoutes.me} aria-label="마이페이지" onClick={closeMegaMenu}>
            <RiUser3Line size={20} />
          </Link>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
