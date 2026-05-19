import Link from "next/link";
import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react";

type SearchParams = Record<string, string | string[] | undefined>;

type PaginationProps = {
  basePath: string;
  currentPage: number;
  pageSize: number;
  searchParams?: SearchParams;
  totalItems: number;
};

function normalizeParams(searchParams: SearchParams = {}) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    const normalized = Array.isArray(value) ? value[0] : value;
    if (normalized && key !== "page") params.set(key, normalized);
  }

  return params;
}

function pageHref(basePath: string, searchParams: SearchParams | undefined, page: number) {
  const params = normalizeParams(searchParams);
  if (page > 1) params.set("page", String(page));

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

function pageNumbers(totalPages: number) {
  return Array.from({ length: totalPages }, (_, index) => index + 1);
}

export function Pagination({ basePath, currentPage, pageSize, searchParams, totalItems }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (totalPages <= 1) return null;

  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const pages = pageNumbers(totalPages);
  const previousPage = safePage - 1;
  const nextPage = safePage + 1;

  return (
    <nav className="pagination" aria-label="페이지네이션">
      {previousPage >= 1 ? (
        <Link className="pagination-arrow" href={pageHref(basePath, searchParams, previousPage)} aria-label="이전 페이지">
          <RiArrowLeftSLine size={18} />
        </Link>
      ) : (
        <span className="pagination-arrow" aria-disabled="true">
          <RiArrowLeftSLine size={18} />
        </span>
      )}

      <div className="pagination-pages">
        {pages.map((page) => (
          <Link aria-current={page === safePage ? "page" : undefined} data-active={page === safePage} href={pageHref(basePath, searchParams, page)} key={page}>
            {page}
          </Link>
        ))}
      </div>

      {nextPage <= totalPages ? (
        <Link className="pagination-arrow" href={pageHref(basePath, searchParams, nextPage)} aria-label="다음 페이지">
          <RiArrowRightSLine size={18} />
        </Link>
      ) : (
        <span className="pagination-arrow" aria-disabled="true">
          <RiArrowRightSLine size={18} />
        </span>
      )}
    </nav>
  );
}
