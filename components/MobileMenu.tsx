"use client";

import Link from "next/link";
import {
  RiArrowDownSLine,
  RiCalendarCheckLine,
  RiCloseLine,
  RiCursorLine,
  RiLeafLine,
  RiMapPinLine,
  RiMenuLine,
  RiQuestionAnswerLine,
  RiSparkling2Line,
} from "@remixicon/react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { withBasePath } from "@/lib/paths";
import { userRoutes } from "@/lib/routes";

const menuItems = [
  { label: "이더라운드 소개", href: "/journal/how-to-meet-jeju-hosts", icon: RiLeafLine },
  { label: "플레이스", href: `${userRoutes.experiences}?region=제주시`, icon: RiMapPinLine },
  { label: "로컬 PICK", href: userRoutes.experiences, icon: RiSparkling2Line },
  { label: "고객센터", href: userRoutes.help, icon: RiQuestionAnswerLine, hasMore: true },
];

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";

    function closeWithEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    window.addEventListener("keydown", closeWithEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeWithEscape);
    };
  }, [isOpen]);

  const menuLayer = (
    <div className="mobile-menu-layer" data-open={isOpen}>
      <button className="mobile-menu-backdrop" onClick={() => setIsOpen(false)} tabIndex={isOpen ? 0 : -1} type="button">
        <span className="sr-only">메뉴 닫기</span>
      </button>

      <aside aria-hidden={!isOpen} aria-label="모바일 메뉴" className="mobile-menu-panel" id="mobile-menu-panel">
        <div className="mobile-menu-top">
          <Link className="quick-reserve" href={userRoutes.experiences} onClick={() => setIsOpen(false)}>
            빠른 예약
          </Link>
          <button aria-label="메뉴 닫기" className="mobile-menu-close" onClick={() => setIsOpen(false)} type="button">
            <RiCloseLine size={22} />
          </button>
        </div>

        <div className="mobile-menu-profile">
          <span className="mobile-menu-avatar">
            <img src={withBasePath("/assets/images/symbol.png")} alt="이더라운드" />
          </span>
          <span>
            <small>로컬 탐험러</small>
            <strong>
              닉네임 1234
              <Link href={userRoutes.login} onClick={() => setIsOpen(false)}>
                로그인
              </Link>
            </strong>
            <span className="mobile-menu-coupon">사용 가능한 쿠폰 1개</span>
          </span>
        </div>

        <Link className="mobile-menu-mypage" href={userRoutes.me} onClick={() => setIsOpen(false)}>
          마이페이지
        </Link>

        <nav className="mobile-menu-links" aria-label="모바일 주요 메뉴">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link href={item.href} key={item.label} onClick={() => setIsOpen(false)}>
                <Icon size={21} />
                <span>{item.label}</span>
                {item.hasMore ? <RiArrowDownSLine size={18} /> : null}
              </Link>
            );
          })}
        </nav>

        <div className="mobile-menu-promos">
          <Link className="mobile-menu-promo host" href={userRoutes.b2b} onClick={() => setIsOpen(false)}>
            <span>
              <strong>당신의 공간을 공유의 공간으로,</strong>
              <small>호스트 신청하기</small>
            </span>
            <RiCursorLine size={46} />
          </Link>
          <Link className="mobile-menu-promo help" href={userRoutes.b2bQuote} onClick={() => setIsOpen(false)}>
            <span>
              <strong>궁금한 점이 있다면?</strong>
              <small>지금 바로 1:1 상담 문의하기</small>
            </span>
            <RiCalendarCheckLine size={42} />
          </Link>
        </div>

        <div className="mobile-menu-footer">
          <p>
            <Link href={userRoutes.terms} onClick={() => setIsOpen(false)}>
              이용약관
            </Link>
            <span />
            <Link href={userRoutes.privacy} onClick={() => setIsOpen(false)}>
              개인정보 처리방침
            </Link>
          </p>
          <small>
            지붕뚫은친구들 ㅣ 대표 : 김선재
            <br />
            고객센터 : 070-8825-0227
            <br />
            사업자등록번호 : 867-23-01167
            <br />
            통신판매업 신고번호 : 2024-제주대륜-30
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
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <RiMenuLine size={20} />
      </button>

      {isMounted ? createPortal(menuLayer, document.body) : null}
    </>
  );
}
