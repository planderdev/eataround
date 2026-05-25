import { Fragment, type ReactNode, type SelectHTMLAttributes } from "react";
import {
  RiArrowDownSLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiArrowUpDownLine,
  RiFilter3Line,
  RiLayoutColumnLine,
  RiRefreshLine,
  RiSearchLine,
} from "@remixicon/react";
import { DatePicker } from "@/components/DatePicker";

export type AdminTone = "success" | "warning" | "danger" | "info" | "neutral";

export type AdminTableColumn<T> = {
  key: string;
  label: string;
  align?: "left" | "right" | "center";
  render: (row: T) => ReactNode;
};

type FilterField = {
  label: string;
  name: string;
  type?: "search" | "select" | "date";
  placeholder?: string;
  defaultValue?: string;
  options?: string[];
};

export function AdminStatusBadge({ children, tone = "neutral" }: { children: ReactNode; tone?: AdminTone }) {
  return (
    <span className="admin-status-badge" data-tone={tone}>
      {children}
    </span>
  );
}

export function AdminSelect({ children, className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className="admin-select-wrap">
      <select className={["admin-select", className].filter(Boolean).join(" ")} {...props}>
        {children}
      </select>
      <RiArrowDownSLine size={16} aria-hidden />
    </span>
  );
}

export function AdminFilterBar({ fields, resultLabel }: { fields: FilterField[]; resultLabel: string }) {
  return (
    <section className="admin-filter-card" aria-label="필터">
      <div className="admin-filter-card-head">
        <span>
          <RiFilter3Line size={16} />
          필터
        </span>
        <b>{resultLabel}</b>
      </div>
      <form className="admin-filter-grid">
        <div className="admin-filter-fields">
          {fields.map((field) => (
            <label className="admin-filter-field" data-type={field.type ?? "search"} key={field.name}>
              <span>{field.label}</span>
              {field.type === "select" ? (
                <AdminSelect aria-label={field.label} defaultValue={field.defaultValue ?? ""} name={field.name}>
                  <option value="">전체</option>
                  {field.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </AdminSelect>
              ) : field.type === "date" ? (
                <DatePicker className="admin-date-picker" defaultValue={field.defaultValue} label={field.label} name={field.name} />
              ) : (
                <span className="admin-filter-input-wrap" data-type={field.type ?? "search"}>
                  {(field.type ?? "search") === "search" ? <RiSearchLine size={16} /> : null}
                  <input defaultValue={field.defaultValue} name={field.name} placeholder={field.placeholder} type="search" />
                </span>
              )}
            </label>
          ))}
        </div>
        <div className="admin-filter-actions">
          <button className="admin-action-button ghost" type="reset" data-admin-filter-reset>
            <RiRefreshLine size={15} />
            초기화
          </button>
          <button className="admin-action-button secondary" type="button" data-admin-filter-apply>
            적용
          </button>
        </div>
      </form>
    </section>
  );
}

export function AdminDataTable<T>({
  actions,
  columns,
  detail,
  emptyLabel = "표시할 데이터가 없습니다.",
  rows,
  rowKey,
}: {
  actions?: (row: T) => ReactNode;
  columns: AdminTableColumn<T>[];
  detail?: (row: T) => ReactNode;
  emptyLabel?: string;
  rows: T[];
  rowKey: (row: T) => string;
}) {
  const hasDetail = Boolean(detail || actions);

  return (
    <div className="admin-table-wrap">
      <div className="admin-table-toolbar">
        <details className="admin-table-column-menu">
          <summary>
            <RiLayoutColumnLine size={15} />
            컬럼
          </summary>
          <div>
            {columns.map((column, index) => (
              <label key={column.key}>
                <input defaultChecked data-admin-column-toggle={index + 2} type="checkbox" />
                {column.label}
              </label>
            ))}
          </div>
        </details>
        <div className="admin-selection-actionbar" aria-live="polite">
          <strong data-admin-selected-count>0개 선택</strong>
          <button className="admin-action-button secondary" type="button">
            선택 적용
          </button>
          <button className="admin-action-button ghost" data-admin-clear-selection type="button">
            해제
          </button>
        </div>
      </div>
      <table className="admin-table admin-data-table">
        <thead>
          <tr>
            <th aria-label="선택">
              <label className="admin-table-check">
                <input aria-label="전체 선택" type="checkbox" />
                <span />
              </label>
            </th>
            {columns.map((column) => (
              <th data-align={column.align ?? "left"} key={column.key}>
                <button data-admin-sort="true" type="button">
                  {column.label}
                  <RiArrowUpDownLine size={13} />
                </button>
              </th>
            ))}
            {hasDetail ? <th data-align="right">상세</th> : null}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row) => (
              <Fragment key={rowKey(row)}>
                <tr tabIndex={0}>
                  <td>
                    <label className="admin-table-check">
                      <input aria-label={`${rowKey(row)} 선택`} type="checkbox" />
                      <span />
                    </label>
                  </td>
                  {columns.map((column) => (
                    <td data-align={column.align ?? "left"} key={column.key}>
                      {column.render(row)}
                    </td>
                  ))}
                  {hasDetail ? (
                    <td data-align="right">
                      <details className="admin-row-slideover">
                        <summary>상세보기</summary>
                        <div className="admin-row-slideover-backdrop" aria-hidden />
                        <div className="admin-row-slideover-panel" role="dialog" aria-label={`${rowKey(row)} 상세`}>
                          <header>
                            <div>
                              <span>Detail</span>
                              <strong>{rowKey(row)}</strong>
                            </div>
                            <button data-admin-close-slideover type="button">
                              닫기
                            </button>
                          </header>
                          {detail ? (
                            <div className="admin-row-details-body">{detail(row)}</div>
                          ) : (
                            <div className="admin-row-details-body">
                              {columns.map((column) => (
                                <dl key={column.key}>
                                  <dt>{column.label}</dt>
                                  <dd>{column.render(row)}</dd>
                                </dl>
                              ))}
                            </div>
                          )}
                          {actions ? <div className="admin-row-details-actions">{actions(row)}</div> : null}
                        </div>
                      </details>
                    </td>
                  ) : null}
                </tr>
              </Fragment>
            ))
          ) : (
            <tr>
              <td className="admin-table-empty" colSpan={columns.length + (hasDetail ? 2 : 1)}>
                {emptyLabel}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function AdminPagination({ total }: { total: number }) {
  const pageSize = 20;
  const end = Math.min(total, pageSize);
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const visiblePages = pages <= 5 ? Array.from({ length: pages }, (_, index) => index + 1) : [1, 2, 3, pages];

  return (
    <div className="admin-pagination" data-admin-pagination data-page-size={pageSize} data-total={total}>
      <span data-admin-pagination-summary>
        총 {total.toLocaleString("ko-KR")}건 중 {total ? `1-${end}` : "0"}번째 표시
      </span>
      <label>
        페이지당
        <AdminSelect aria-label="페이지당 항목 수" defaultValue="20" data-admin-page-size>
          <option value="20">20</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </AdminSelect>
      </label>
      <div>
        <button className="admin-icon-button" type="button" aria-label="이전 페이지" data-admin-prev-page disabled>
          <RiArrowLeftSLine size={18} />
        </button>
        {visiblePages.map((page, index) => (
          <Fragment key={page}>
            {index > 0 && page - visiblePages[index - 1] > 1 ? <span>...</span> : null}
            <button className="admin-pagination-page" data-active={page === 1} data-admin-page={page} type="button">
              {page}
            </button>
          </Fragment>
        ))}
        <button className="admin-icon-button" type="button" aria-label="다음 페이지" data-admin-next-page disabled={pages <= 1}>
          <RiArrowRightSLine size={18} />
        </button>
      </div>
    </div>
  );
}

export function AdminResultSummary({ children }: { children: ReactNode }) {
  return <div className="admin-result-summary">{children}</div>;
}
