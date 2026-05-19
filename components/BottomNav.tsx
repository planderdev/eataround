"use client";

import Link from "next/link";
import { RiBuilding2Line, RiHome5Line, RiMap2Line, RiSearchLine, RiUser3Line } from "@remixicon/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { userRoutes } from "@/lib/routes";

const navItems = [
  { label: "홈", href: "/", icon: RiHome5Line },
  { label: "체험", href: userRoutes.experiences, icon: RiMap2Line },
  { label: "검색", href: userRoutes.search, icon: RiSearchLine, primary: true },
  { label: "패키지", href: userRoutes.b2b, icon: RiBuilding2Line },
  { label: "마이", href: userRoutes.me, icon: RiUser3Line },
];

export function BottomNav() {
  const pathname = usePathname();
  const lastScrollYRef = useRef(0);
  const tickingRef = useRef(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;
    setHidden(false);
  }, [pathname]);

  useEffect(() => {
    function updateVisibility() {
      const currentScrollY = Math.max(window.scrollY, 0);
      const distance = currentScrollY - lastScrollYRef.current;

      if (currentScrollY < 20) {
        setHidden(false);
      } else if (distance > 8) {
        setHidden(true);
      } else if (distance < -8) {
        setHidden(false);
      }

      lastScrollYRef.current = currentScrollY;
      tickingRef.current = false;
    }

    function handleScroll() {
      if (tickingRef.current) return;
      tickingRef.current = true;
      window.requestAnimationFrame(updateVisibility);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav className="bottom-nav" data-hidden={hidden ? "true" : "false"} aria-label="모바일 하단 메뉴">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href.split("?")[0]));
        return (
          <Link
            className={item.primary ? "bottom-nav-item bottom-nav-primary" : "bottom-nav-item"}
            data-active={isActive}
            href={item.href}
            key={item.label}
          >
            <span className="bottom-nav-icon">
              <Icon size={20} />
            </span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
