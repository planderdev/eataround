"use client";

import Link from "next/link";
import {
  RiBuilding4Line,
  RiCalendarCheckLine,
  RiCloseLine,
  RiMapPinLine,
  RiMenuLine,
  RiNewspaperLine,
  RiQuestionAnswerLine,
  RiSparkling2Line,
} from "@remixicon/react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useModal } from "@/lib/useModal";
import { withBasePath } from "@/lib/paths";
import { userRoutes } from "@/lib/routes";

const menuItems = [
  { label: "로컬체험", href: userRoutes.experiences, icon: RiMapPinLine },
  { label: "기획전", href: userRoutes.curations, icon: RiSparkling2Line },
  { label: "진행중인 행사", href: userRoutes.events, icon: RiCalendarCheckLine },
  { label: "기업·기관 패키지", href: userRoutes.b2b, icon: RiBuilding4Line },
  { label: "이더라운드 저널", href: userRoutes.journal, icon: RiNewspaperLine },
  { label: "고객센터", href: userRoutes.help, icon: RiQuestionAnswerLine },
];

export function MobileMenu() {
  const { isOpen, open, close } = useModal();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const menuLayer = (
    <div className="mobile-menu-layer" data-open={isOpen}>
      <button className="mobile-menu-backdrop" onClick={close} tabIndex={isOpen ? 0 : -1} type="button">
        <span className="sr-only">메뉴 닫기</span>
      </button>

      <aside aria-hidden={!isOpen} aria-label="모바일 메뉴" className="mobile-menu-panel" id="mobile-menu-panel">
        <div className="mobile-menu-top">
          <Link className="quick-reserve" href={userRoutes.experiences} onClick={close}>
            로컬체험 보기
          </Link>
          <button aria-label="메뉴 닫기" className="mobile-menu-close" onClick={close} type="button">
            <RiCloseLine size={22} />
          </button>
        </div>

        <div className="mobile-menu-profile">
          <span className="mobile-menu-avatar">
            <img src={withBasePath("/assets/images/symbol.png")} alt="이더라운드" loading="lazy" decoding="async" />
          </span>
          <span>
            <small>이더라운드 멤버</small>
            <strong>
              로그인하고 예약을 관리하세요
              <Link href={userRoutes.login} onClick={close}>
                로그인
              </Link>
            </strong> 
          </span>
        </div>

        <Link className="mobile-menu-mypage" href={userRoutes.me} onClick={close}>
          마이페이지
        </Link>

        <nav className="mobile-menu-links" aria-label="모바일 주요 메뉴">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link href={item.href} key={item.label} onClick={close}>
                <Icon size={21} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mobile-menu-promos">
          <Link className="mobile-menu-promo help" href={userRoutes.b2bQuote} onClick={close}>
            <span>
              <strong>단체·기업 프로그램이 필요하다면</strong>
              <small>B2B 견적 요청하기</small>
            </span>
            <RiCalendarCheckLine size={42} />
          </Link>
        </div>

        <div className="mobile-menu-footer">
          <p>
            <Link href={userRoutes.terms} onClick={close}>
              이용약관
            </Link>
            <span />
            <Link href={userRoutes.privacy} onClick={close}>
              개인정보 처리방침
            </Link>
          </p>
          <small>
            이더라운드
            <br />
            제주 로컬체험 큐레이션 플랫폼
            <br />
            예약, 견적, 행사는 고객센터에서 안내받을 수 있습니다.
          </small>
        </div>
      </aside>
    </div>
  );

  return (
    <>
      <button
        aria-controls="mobile-menu-panel"
        aria-expanded={isOpen}
        aria-label="메뉴 열기"
        className="icon-button mobile-only"
        onClick={open}
        type="button"
      >
        <RiMenuLine size={20} />
      </button>

      {isMounted ? createPortal(menuLayer, document.body) : null}
    </>
  );
}
