"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  RiCheckboxCircleLine,
  RiCloseLine,
  RiExternalLinkLine,
  RiLogoutBoxRLine,
  RiMenuLine,
  RiNotification3Line,
  RiSearchLine,
} from "@remixicon/react";
import { CommandPalette } from "@/components/admin/CommandPalette";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { NotificationPanel, type AdminNotification } from "@/components/admin/NotificationPanel";
import { adminApi } from "@/lib/admin/api";
import { adminNavItems, getCurrentAdminNavItem } from "@/lib/admin";
import { withBasePath } from "@/lib/paths";

type AdminToast = {
  id: number;
  message: string;
  tone: "success" | "error" | "warning" | "info";
};

export function AdminShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [commandQuery, setCommandQuery] = useState("");
  const [searchCount, setSearchCount] = useState<number | null>(null);
  const [toasts, setToasts] = useState<AdminToast[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [confirmAction, setConfirmAction] = useState<{ label: string; run: () => void } | null>(null);
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
    setIsCommandOpen(false);
    setIsNotificationOpen(false);
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
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsCommandOpen(true);
        return;
      }
      if (event.key !== "Escape") return;
      setIsSidebarOpen(false);
      setIsCommandOpen(false);
      setIsNotificationOpen(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    adminApi.notifications
      .list()
      .then(setNotifications)
      .catch(() => setNotifications([]));
  }, []);

  useEffect(() => {
    window.setTimeout(() => {
      document.querySelectorAll<HTMLElement>("[data-admin-pagination]").forEach((pagination) => {
        applyTablePagination(pagination, 1);
      });
    }, 0);
  }, [pathname]);

  function showToast(message: string, tone: AdminToast["tone"] = "success") {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current.slice(-2), { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 5000);
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

    const tableWrap = table.closest<HTMLElement>(".admin-table-wrap");
    if (tableWrap) {
      tableWrap.dataset.selectedCount = String(selectedCount);
      const counter = tableWrap.querySelector<HTMLElement>("[data-admin-selected-count]");
      if (counter) counter.textContent = `${selectedCount}개 선택`;
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

  function sortTable(headerButton: HTMLButtonElement) {
    const th = headerButton.closest("th");
    const table = headerButton.closest("table");
    const tbody = table?.querySelector("tbody");
    if (!th || !table || !tbody) return;

    const columnIndex = Array.from(th.parentElement?.children ?? []).indexOf(th);
    const direction = headerButton.dataset.sortDirection === "asc" ? "desc" : "asc";
    table.querySelectorAll<HTMLButtonElement>("[data-admin-sort]").forEach((button) => {
      if (button !== headerButton) delete button.dataset.sortDirection;
    });
    headerButton.dataset.sortDirection = direction;

    const rows = Array.from(tbody.querySelectorAll<HTMLTableRowElement>("tr")).filter((row) => !row.querySelector(".admin-table-empty"));
    rows
      .sort((a, b) => {
        const aText = a.children[columnIndex]?.textContent?.trim() ?? "";
        const bText = b.children[columnIndex]?.textContent?.trim() ?? "";
        return direction === "asc" ? aText.localeCompare(bText, "ko") : bText.localeCompare(aText, "ko");
      })
      .forEach((row) => tbody.appendChild(row));

    const pagination = table.closest<HTMLElement>(".admin-list-shell")?.querySelector<HTMLElement>("[data-admin-pagination]");
    if (pagination) applyTablePagination(pagination);
  }

  function applyTablePagination(pagination: HTMLElement, requestedPage?: number) {
    const shell = pagination.closest<HTMLElement>(".admin-list-shell");
    const table = shell?.querySelector<HTMLTableElement>(".admin-data-table");
    const tbody = table?.querySelector("tbody");
    if (!table || !tbody) return;

    const rows = Array.from(tbody.querySelectorAll<HTMLTableRowElement>("tr")).filter((row) => !row.querySelector(".admin-table-empty"));
    const pageSizeInput = pagination.querySelector<HTMLSelectElement>("[data-admin-page-size]");
    const pageSize = Math.max(1, Number(pageSizeInput?.value || pagination.dataset.pageSize || 20));
    const availableRows = rows.filter((row) => row.dataset.filterHidden !== "true");
    const pageCount = Math.max(1, Math.ceil(availableRows.length / pageSize));
    const page = Math.min(Math.max(requestedPage ?? Number(pagination.dataset.page || 1), 1), pageCount);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    pagination.dataset.page = String(page);
    pagination.dataset.pageSize = String(pageSize);

    rows.forEach((row) => {
      if (row.dataset.filterHidden === "true") {
        row.hidden = true;
        return;
      }
      const visibleIndex = availableRows.indexOf(row);
      row.hidden = visibleIndex < start || visibleIndex >= end;
    });

    const summary = pagination.querySelector<HTMLElement>("[data-admin-pagination-summary]");
    if (summary) {
      const rangeStart = availableRows.length ? start + 1 : 0;
      const rangeEnd = Math.min(end, availableRows.length);
      summary.textContent = `총 ${availableRows.length.toLocaleString("ko-KR")}건 중 ${rangeStart}-${rangeEnd}번째 표시`;
    }

    pagination.querySelectorAll<HTMLButtonElement>("[data-admin-page]").forEach((button) => {
      const buttonPage = Number(button.dataset.adminPage);
      button.dataset.active = String(buttonPage === page);
      button.disabled = buttonPage > pageCount;
    });

    const prevButton = pagination.querySelector<HTMLButtonElement>("[data-admin-prev-page]");
    const nextButton = pagination.querySelector<HTMLButtonElement>("[data-admin-next-page]");
    if (prevButton) prevButton.disabled = page <= 1;
    if (nextButton) nextButton.disabled = page >= pageCount;
    syncTableSelection(table);
  }

  async function runAdminAction(label: string) {
    try {
      const result = await adminApi.actions.execute(label);
      showToast(result.message || `${label} 작업을 완료했습니다.`, "success");
    } catch {
      showToast(`${label} 작업 중 오류가 발생했습니다.`, "error");
    }
  }

  function applySectionFilters(button: HTMLButtonElement) {
    const form = button.closest<HTMLFormElement>(".admin-filter-grid");
    const shell = button.closest<HTMLElement>(".admin-list-shell, .admin-schedule-shell");
    const rows = Array.from(shell?.querySelectorAll<HTMLTableRowElement>(".admin-data-table tbody tr") ?? []);
    if (!form || !rows.length) {
      showToast("현재 화면에 적용할 표 데이터가 없습니다.", "warning");
      return;
    }

    const values = Array.from(new FormData(form).values())
      .map((value) => String(value).trim().toLowerCase())
      .filter(Boolean);

    if (!values.length) {
      rows.forEach((row) => {
        delete row.dataset.filterHidden;
      });
      const pagination = shell?.querySelector<HTMLElement>("[data-admin-pagination]");
      if (pagination) applyTablePagination(pagination, 1);
      showToast("필터 조건을 초기화했습니다.", "info");
      return;
    }

    let visibleCount = 0;
    rows.forEach((row) => {
      const text = (row.textContent ?? "").toLowerCase();
      const visible = values.every((value) => text.includes(value));
      row.dataset.filterHidden = String(!visible);
      if (visible) visibleCount += 1;
    });
    const pagination = shell?.querySelector<HTMLElement>("[data-admin-pagination]");
    if (pagination) applyTablePagination(pagination, 1);
    showToast(`필터를 적용했습니다. ${visibleCount}개 항목 표시`, "info");
  }

  async function handleShellClick(event: React.MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    const topbarAction = target.closest<HTMLButtonElement>("[data-admin-topbar-action]");
    if (topbarAction) {
      const action = topbarAction.dataset.adminTopbarAction;
      if (action === "notifications") {
        setIsNotificationOpen((value) => !value);
        return;
      }
      if (action === "logout") {
        await fetch(withBasePath("/api/auth/logout"), { method: "POST" }).catch(() => null);
        document.cookie = "session=; path=/; max-age=0; SameSite=Lax";
        router.push("/admin/login");
        showToast("로그아웃은 실제 인증 연동 후 처리됩니다.");
        return;
      }
    }

    const paginationButton = target.closest<HTMLButtonElement>("[data-admin-prev-page], [data-admin-next-page], [data-admin-page]");
    if (paginationButton) {
      const pagination = paginationButton.closest<HTMLElement>("[data-admin-pagination]");
      if (!pagination) return;
      const currentPage = Number(pagination.dataset.page || 1);
      const requestedPage = paginationButton.dataset.adminPrevPage !== undefined
        ? currentPage - 1
        : paginationButton.dataset.adminNextPage !== undefined
          ? currentPage + 1
          : Number(paginationButton.dataset.adminPage || 1);
      applyTablePagination(pagination, requestedPage);
      showToast("페이지 표시를 변경했습니다.", "info");
      return;
    }

    const sortButton = target.closest<HTMLButtonElement>("[data-admin-sort]");
    if (sortButton) {
      sortTable(sortButton);
      showToast("테이블 정렬을 변경했습니다.", "info");
      return;
    }

    const filterApplyButton = target.closest<HTMLButtonElement>("[data-admin-filter-apply]");
    if (filterApplyButton) {
      applySectionFilters(filterApplyButton);
      return;
    }

    const filterResetButton = target.closest<HTMLButtonElement>("[data-admin-filter-reset]");
    if (filterResetButton) {
      window.setTimeout(() => {
        const shell = filterResetButton.closest<HTMLElement>(".admin-list-shell, .admin-schedule-shell");
        shell?.querySelectorAll<HTMLTableRowElement>(".admin-data-table tbody tr").forEach((row) => {
          delete row.dataset.filterHidden;
        });
        const pagination = shell?.querySelector<HTMLElement>("[data-admin-pagination]");
        if (pagination) applyTablePagination(pagination, 1);
      }, 0);
      showToast("필터를 초기화했습니다.", "info");
      return;
    }

    const closeSlideoverButton = target.closest<HTMLButtonElement>("[data-admin-close-slideover]");
    if (closeSlideoverButton) {
      closeSlideoverButton.closest<HTMLDetailsElement>(".admin-row-slideover")?.removeAttribute("open");
      return;
    }

    const slideoverBackdrop = target.closest<HTMLElement>(".admin-row-slideover-backdrop");
    if (slideoverBackdrop) {
      slideoverBackdrop.closest<HTMLDetailsElement>(".admin-row-slideover")?.removeAttribute("open");
      return;
    }

    const densityButton = target.closest<HTMLButtonElement>("[data-admin-density]");
    if (densityButton) {
      const tableWrap = densityButton.closest<HTMLElement>(".admin-table-wrap");
      if (tableWrap) tableWrap.dataset.density = densityButton.dataset.adminDensity ?? "default";
      showToast("테이블 밀도를 변경했습니다.", "info");
      return;
    }

    const clearSelectionButton = target.closest<HTMLButtonElement>("[data-admin-clear-selection]");
    if (clearSelectionButton) {
      const tableWrap = clearSelectionButton.closest<HTMLElement>(".admin-table-wrap");
      const table = tableWrap?.querySelector("table");
      table?.querySelectorAll<HTMLInputElement>(".admin-table-check input").forEach((input) => {
        input.checked = false;
        input.indeterminate = false;
      });
      if (table) syncTableSelection(table);
      showToast("선택을 해제했습니다.", "info");
      return;
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
    if (action.classList.contains("danger")) {
      setConfirmAction({
        label,
        run: () => runAdminAction(label),
      });
      return;
    }
    await runAdminAction(label);
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

    if (target.matches("[data-admin-column-toggle]")) {
      const input = target as HTMLInputElement;
      const index = Number(input.dataset.adminColumnToggle);
      const tableWrap = input.closest(".admin-table-wrap");
      tableWrap?.querySelectorAll<HTMLTableCellElement>(`table tr > *:nth-child(${index})`).forEach((cell) => {
        cell.hidden = !input.checked;
      });
      showToast("표시 컬럼을 변경했습니다.", "info");
      return;
    }

    if (target.matches("[data-admin-page-size]")) {
      const pagination = target.closest<HTMLElement>("[data-admin-pagination]");
      if (pagination) applyTablePagination(pagination, 1);
      showToast("페이지당 표시 개수를 변경했습니다.", "info");
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
            <NotificationPanel
              isOpen={isNotificationOpen}
              items={notifications}
              onClose={() => setIsNotificationOpen(false)}
              onReadAll={async () => {
                const previousItems = notifications;
                setNotifications((items) => items.map((item) => ({ ...item, unread: false })));
                const result = await adminApi.notifications.readAll().catch(() => null);
                if (!result?.ok) {
                  setNotifications(previousItems);
                  showToast("알림 상태를 변경하지 못했습니다.", "error");
                  return;
                }
                showToast("알림을 모두 읽음 처리했습니다.", "info");
              }}
            />
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

      <CommandPalette isOpen={isCommandOpen} query={commandQuery} onClose={() => setIsCommandOpen(false)} onQueryChange={setCommandQuery} />
      <ConfirmDialog
        isOpen={Boolean(confirmAction)}
        title={`${confirmAction?.label ?? "작업"} 처리`}
        description="이 작업은 운영 데이터에 영향을 줄 수 있습니다. 계속 진행할까요?"
        confirmLabel="진행"
        tone="danger"
        onCancel={() => setConfirmAction(null)}
        onConfirm={() => {
          confirmAction?.run();
          setConfirmAction(null);
        }}
      />

      <div className="admin-toast-stack" aria-live="polite">
        {toasts.map((toast) => (
          <div className="admin-toast" data-open="true" data-tone={toast.tone} role="status" key={toast.id}>
            <RiCheckboxCircleLine size={18} />
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
