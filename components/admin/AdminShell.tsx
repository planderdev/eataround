"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  RiArrowRightLine,
  RiCheckboxCircleLine,
  RiCloseLine,
  RiExternalLinkLine,
  RiLogoutBoxRLine,
  RiMenuLine,
  RiNotification3Line,
  RiSearchLine,
} from "@remixicon/react";
import { adminNavItems, getCurrentAdminNavItem } from "@/lib/admin";
import { withBasePath } from "@/lib/paths";

type DrawerState = {
  title: string;
  description: string;
};

export function AdminShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCount, setSearchCount] = useState<number | null>(null);
  const [toast, setToast] = useState("");
  const [drawer, setDrawer] = useState<DrawerState | null>(null);
  const groups = Array.from(new Set(adminNavItems.map((item) => item.group)));
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const currentNavItem = useMemo(() => getCurrentAdminNavItem(pathname), [pathname]);
  const currentPageLabel = useMemo(() => {
    return currentNavItem?.label ?? "관리자";
  }, [currentNavItem]);

  useEffect(() => {
    setIsSidebarOpen(false);
    setSearchQuery("");
    setSearchCount(null);
    setDrawer(null);
  }, [pathname]);

  useEffect(() => {
    const main = document.querySelector(".admin-main");
    if (!main) return;

    const targets = Array.from(
      main.querySelectorAll<HTMLElement>("tbody tr, .admin-control-item, .admin-task-list a, .admin-checklist label, .admin-quick-actions a"),
    );

    if (!normalizedSearch) {
      targets.forEach((target) => {
        target.hidden = false;
        target.dataset.searchMatch = "false";
      });
      setSearchCount(null);
      return;
    }

    let count = 0;
    targets.forEach((target) => {
      const matches = (target.textContent ?? "").toLowerCase().includes(normalizedSearch);
      target.hidden = !matches;
      target.dataset.searchMatch = String(matches);
      if (matches) count += 1;
    });
    setSearchCount(count);
  }, [normalizedSearch, pathname, children]);

  useEffect(() => {
    if (!isSidebarOpen && !drawer) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [drawer, isSidebarOpen]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setIsSidebarOpen(false);
      setDrawer(null);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function showToast(message: string) {
    setToast(message);
  }

  function openDrawer(title: string, description = "변경 사항을 확인하고 운영 메모를 남긴 뒤 저장할 수 있습니다.") {
    setDrawer({ title, description });
  }

  function handleShellClick(event: React.MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    const topbarAction = target.closest<HTMLButtonElement>("[data-admin-topbar-action]");
    if (topbarAction) {
      const action = topbarAction.dataset.adminTopbarAction;
      if (action === "notifications") {
        openDrawer("알림 센터", "미확정 예약, 견적 요청, 품절 임박 회차를 한 번에 확인합니다.");
        return;
      }
      if (action === "logout") {
        showToast("로그아웃은 실제 인증 연동 후 처리됩니다.");
        return;
      }
    }

    const action = target.closest<HTMLButtonElement>(".admin-main .admin-action-button, .admin-main .admin-inline-form button, .admin-main .admin-icon-button");
    if (!action) return;
    if (action.disabled) return;
    if (action.closest(".admin-product-form")) return;

    if (action.dataset.adminToast) {
      showToast(action.dataset.adminToast);
      return;
    }

    const label = action.getAttribute("aria-label") || action.textContent?.trim() || "관리 작업";
    openDrawer(action.dataset.adminPanel || label, action.dataset.adminDescription);
    showToast(`${label} 작업 패널을 열었습니다.`);
  }

  function handleShellChange(event: React.ChangeEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    if (target.matches(".admin-select, .admin-settings-grid input, .admin-table-check input")) {
      showToast("변경사항이 화면에 반영되었습니다.");
    }
  }

  if (pathname === "/admin/login") {
    return <main className="admin-login-screen">{children}</main>;
  }

  return (
    <div className="admin-shell" data-drawer-open={Boolean(drawer)} data-sidebar-open={isSidebarOpen} onChange={handleShellChange} onClick={handleShellClick}>
      <button
        className="admin-sidebar-backdrop"
        type="button"
        aria-label="관리자 메뉴 닫기"
        onClick={() => setIsSidebarOpen(false)}
      />
      <aside className="admin-sidebar" aria-label="관리자 메뉴">
        <div className="admin-sidebar-head">
          <Link className="admin-brand" href="/admin/dashboard" aria-label="eat.around 관리자">
            <img src={withBasePath("/assets/images/logo.png")} alt="" width={500} height={74} />
            <span>ADMIN · 1차 운영</span>
          </Link>
          <button className="admin-sidebar-close" type="button" aria-label="관리자 메뉴 닫기" onClick={() => setIsSidebarOpen(false)}>
            <RiCloseLine size={20} />
          </button>
        </div>

        <nav className="admin-sidebar-nav">
          {groups.map((group) => (
            <div className="admin-nav-group" key={group}>
              <span>{group}</span>
              {adminNavItems
                .filter((item) => item.group === group)
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = currentNavItem?.id === item.id;

                  return (
                    <Link data-active={isActive} href={item.href} key={item.id}>
                      <Icon size={18} />
                      <span>{item.label}</span>
                      {item.badge ? <em>{item.badge}</em> : null}
                    </Link>
                  );
                })}
            </div>
          ))}
        </nav>
      </aside>

      <div className="admin-workspace">
        <header className="admin-topbar">
          <button className="admin-topbar-icon mobile-only" type="button" aria-label="관리자 메뉴" onClick={() => setIsSidebarOpen(true)}>
            <RiMenuLine size={20} />
          </button>
          <label className="admin-search" data-active={Boolean(searchQuery)}>
            <RiSearchLine size={18} />
            <span className="sr-only">관리자 검색</span>
            <input
              placeholder={`${currentPageLabel}에서 검색`}
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            {searchQuery ? (
              <button className="admin-search-clear" type="button" aria-label="검색어 지우기" onClick={() => setSearchQuery("")}>
                <RiCloseLine size={16} />
              </button>
            ) : null}
          </label>
          {searchCount !== null ? <span className="admin-search-count">{searchCount}개 결과</span> : null}
          <div className="admin-topbar-actions">
            <span className="admin-user-chip">
              김선재
              <b>SUPER_ADMIN</b>
            </span>
            <Link className="admin-topbar-link" href="/" target="_blank">
              사이트 보기
              <RiExternalLinkLine size={16} />
            </Link>
            <button className="admin-topbar-icon" type="button" aria-label="알림" data-admin-topbar-action="notifications">
              <RiNotification3Line size={18} />
            </button>
            <button className="admin-topbar-icon" type="button" aria-label="로그아웃" data-admin-topbar-action="logout">
              <RiLogoutBoxRLine size={18} />
            </button>
          </div>
        </header>
        <main className="admin-main">
          {children}
          <div className="admin-search-empty" data-open={searchCount === 0 && Boolean(searchQuery)}>
            <strong>검색 결과가 없습니다.</strong>
            <span>검색어를 줄이거나 다른 필터 조건을 확인해보세요.</span>
          </div>
        </main>
      </div>

      <button className="admin-command-backdrop" type="button" aria-label="작업 패널 닫기" onClick={() => setDrawer(null)} />
      <aside className="admin-command-drawer" data-open={Boolean(drawer)} aria-hidden={!drawer}>
        <div className="admin-command-drawer-head">
          <div>
            <span>Quick Edit</span>
            <strong>{drawer?.title || "관리 작업"}</strong>
          </div>
          <button type="button" aria-label="작업 패널 닫기" onClick={() => setDrawer(null)}>
            <RiCloseLine size={20} />
          </button>
        </div>
        <div className="admin-command-form">
          <div className="admin-command-summary">
            <span>운영 플로우</span>
            <strong>{drawer?.description || "선택한 항목의 상태와 운영 메모를 빠르게 정리합니다."}</strong>
            <small>
              저장 전 변경 이력과 담당자 메모를 확인해 운영 기록을 남깁니다.
            </small>
          </div>
          <label>
            <span>담당자</span>
            <select defaultValue="kim">
              <option value="kim">김선재 · SUPER_ADMIN</option>
              <option value="operator">운영 담당자</option>
              <option value="content">콘텐츠 담당자</option>
            </select>
          </label>
          <label>
            <span>관리 메모</span>
            <textarea placeholder="담당자에게 남길 메모를 입력하세요." />
          </label>
          <label>
            <span>상태</span>
            <select defaultValue="active">
              <option value="active">진행중</option>
              <option value="pending">검토중</option>
              <option value="hidden">숨김</option>
            </select>
          </label>
          <button className="admin-drawer-secondary" type="button">
            상세 화면으로 이동
            <RiArrowRightLine size={16} />
          </button>
          <button
            type="button"
            onClick={() => {
              setDrawer(null);
              showToast("작업 내용이 임시 반영되었습니다.");
            }}
          >
            저장하기
          </button>
        </div>
      </aside>

      <div className="admin-toast" data-open={Boolean(toast)} role="status" aria-live="polite">
        <RiCheckboxCircleLine size={18} />
        {toast || "완료"}
      </div>
    </div>
  );
}
