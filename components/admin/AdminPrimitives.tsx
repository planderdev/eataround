import type { ReactNode } from "react";
import { RiArrowLeftSLine, RiArrowRightSLine, RiFilter3Line, RiSearchLine } from "@remixicon/react";

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
        {fields.map((field) => (
          <label className="admin-filter-field" key={field.name}>
            <span>{field.label}</span>
            {field.type === "select" ? (
              <select aria-label={field.label} className="admin-select" defaultValue={field.defaultValue ?? ""} name={field.name}>
                <option value="">전체</option>
                {field.options?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <span className="admin-filter-input-wrap" data-type={field.type ?? "search"}>
                {(field.type ?? "search") === "search" ? <RiSearchLine size={16} /> : null}
                <input
                  defaultValue={field.defaultValue}
                  name={field.name}
                  placeholder={field.placeholder}
                  type={field.type === "date" ? "date" : "search"}
                />
              </span>
            )}
          </label>
        ))}
        <button className="admin-action-button primary" type="button" data-admin-toast="필터 조건을 적용했습니다.">
          적용
        </button>
      </form>
    </section>
  );
}

export function AdminDataTable<T>({
  columns,
  rows,
  rowKey,
}: {
  columns: AdminTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
}) {
  return (
    <div className="admin-table-wrap">
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
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} tabIndex={0}>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AdminPagination({ total }: { total: number }) {
  return (
    <div className="admin-pagination">
      <span>총 {total.toLocaleString("ko-KR")}건 · 1 / 1 페이지</span>
      <label>
        페이지당
        <select aria-label="페이지당 항목 수" className="admin-select" defaultValue="20">
          <option value="20">20</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
      </label>
      <div>
        <button className="admin-icon-button" type="button" aria-label="이전 페이지" disabled>
          <RiArrowLeftSLine size={18} />
        </button>
        <button className="admin-icon-button" type="button" aria-label="다음 페이지" disabled>
          <RiArrowRightSLine size={18} />
        </button>
      </div>
    </div>
  );
}

export function AdminResultSummary({ children }: { children: ReactNode }) {
  return <div className="admin-result-summary">{children}</div>;
}
