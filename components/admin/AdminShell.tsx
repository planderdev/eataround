"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
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

export function AdminShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCount, setSearchCount] = useState<number | null>(null);
  const [toast, setToast] = useState("");
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
    if (!isSidebarOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isSidebarOpen]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setIsSidebarOpen(false);
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

  function syncTableSelection(table: HTMLTableElement) {
    const rowChecks = Array.from(table.querySelectorAll<HTMLInputElement>("tbody .admin-table-check input"));
    const selectedCount = rowChecks.filter((input) => input.checked).length;
    const headerCheck = table.querySelector<HTMLInputElement>("thead .admin-table-check input");

    rowChecks.forEach((input) => {
      const row = input.closest("tr");
      if (row) row.dataset.selected = String(input.checked);
    });

    if (headerCheck) {
      headerCheck.checked = selectedCount > 0 && selectedCount === rowChecks.length;
      headerCheck.indeterminate = selectedCount > 0 && selectedCount < rowChecks.length;
    }

    return selectedCount;
  }

  function toggleTableRow(tableRow: HTMLTableRowElement) {
    const checkbox = tableRow.querySelector<HTMLInputElement>(".admin-table-check input");
    const table = tableRow.closest("table");
    if (!checkbox || !table) return;

    checkbox.checked = !checkbox.checked;
    const selectedCount = syncTableSelection(table);
    showToast(selectedCount > 0 ? `${selectedCount}개 항목을 선택했습니다.` : "선택을 해제했습니다.");
  }

  function handleShellClick(event: React.MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    const topbarAction = target.closest<HTMLButtonElement>("[data-admin-topbar-action]");
    if (topbarAction) {
      const action = topbarAction.dataset.adminTopbarAction;
      if (action === "notifications") {
        showToast("알림은 대시보드 우선순위와 각 상세 페이지에서 확인합니다.");
        return;
      }
      if (action === "logout") {
        showToast("로그아웃은 실제 인증 연동 후 처리됩니다.");
        return;
      }
    }

    const tableRow = target.closest<HTMLTableRowElement>(".admin-data-table tbody tr");
    if (tableRow && !target.closest("a, button, input, label, select, textarea, summary, details, .admin-row-details")) {
      toggleTableRow(tableRow);
      return;
    }

    const tab = target.closest<HTMLButtonElement>(".admin-tab");
    if (tab) {
      const tablist = tab.closest<HTMLElement>("[role='tablist']");
      const tabs = Array.from(tablist?.querySelectorAll<HTMLButtonElement>(".admin-tab") ?? []);
      tabs.forEach((item) => {
        const isSelected = item === tab;
        item.dataset.active = String(isSelected);
        item.setAttribute("aria-selected", String(isSelected));
        item.tabIndex = isSelected ? 0 : -1;
      });
      showToast(`${tab.textContent?.trim() || "선택한"} 탭으로 이동했습니다.`);
      return;
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
    showToast(`${label} 작업은 별도 상세 페이지에서 처리합니다.`);
  }

  function handleShellChange(event: React.ChangeEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    if (target.matches(".admin-table-check input")) {
      const input = target as HTMLInputElement;
      const table = input.closest("table");
      if (!table) return;

      if (input.closest("thead")) {
        table.querySelectorAll<HTMLInputElement>("tbody .admin-table-check input").forEach((rowInput) => {
          rowInput.checked = input.checked;
        });
      }

      const selectedCount = syncTableSelection(table);
      showToast(selectedCount > 0 ? `${selectedCount}개 항목을 선택했습니다.` : "선택을 해제했습니다.");
      return;
    }

    if (target.matches(".admin-select, .admin-settings-grid input")) {
      showToast("변경사항이 화면에 반영되었습니다.");
    }
  }

  function handleShellKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Enter" && event.key !== " ") return;

    const target = event.target as HTMLElement;
    const tableRow = target.closest<HTMLTableRowElement>(".admin-data-table tbody tr");
    if (!tableRow || target.closest("a, button, input, label, select, textarea")) return;

    event.preventDefault();
    toggleTableRow(tableRow);
  }

  if (pathname === "/admin/login") {
    return <main className="admin-login-screen">{children}</main>;
  }

  return (
    <div
      className="admin-shell"
      data-sidebar-open={isSidebarOpen}
      onChange={handleShellChange}
      onClick={handleShellClick}
      onKeyDown={handleShellKeyDown}
    >
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
            <span>ADMIN</span>
          </Link>
          <button className="admin-sidebar-close" type="button" aria-label="관리자 메뉴 닫기" onClick={() => setIsSidebarOpen(false)}>
            <RiCloseLine size={20} />
          </button>
        </div>

        <nav className="admin-sidebar-nav">
          {groups.map((group) => {
            const groupItems = adminNavItems.filter((item) => item.group === group);
            const isGroupActive = groupItems.some((item) => item.id === currentNavItem?.id);

            return (
              <div className="admin-nav-group" data-active={isGroupActive} key={group}>
                <span>{group}</span>
                {groupItems.map((item) => {
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
            );
          })}
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

      <div className="admin-toast" data-open={Boolean(toast)} role="status" aria-live="polite">
        <RiCheckboxCircleLine size={18} />
        {toast || "완료"}
      </div>
    </div>
  );
}
