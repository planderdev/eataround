import Link from "next/link";
import { RiRefreshLine, RiSearchLine } from "@remixicon/react";
import { EmptyState } from "@/components/EmptyState";
import { userRoutes } from "@/lib/routes";

type SearchEmptyStateProps = {
  keyword?: string;
  description?: string;
  primaryHref?: string;
  primaryLabel?: string;
  resetHref?: string;
};

export function SearchEmptyState({
  keyword,
  description,
  primaryHref = userRoutes.experiences,
  primaryLabel = "전체 체험 보기",
  resetHref,
}: SearchEmptyStateProps) {
  const title = keyword ? `"${keyword}" 검색 결과가 없습니다` : "검색 결과가 없습니다";

  return (
    <EmptyState
      icon={<RiSearchLine size={32} aria-hidden />}
      title={title}
      description={description ?? "검색어를 줄이거나 필터를 초기화해 다시 찾아보세요."}
      action={
        <div className="empty-state-actions">
          {resetHref ? (
            <Link className="secondary-button" href={resetHref}>
              <RiRefreshLine size={18} />
              필터 초기화
            </Link>
          ) : null}
          <Link className="primary-button" href={primaryHref}>
            {primaryLabel}
          </Link>
        </div>
      }
    />
  );
}
