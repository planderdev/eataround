export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="admin-table-skeleton" aria-label="테이블 로딩 중">
      {Array.from({ length: rows }).map((_, index) => (
        <span key={index} />
      ))}
    </div>
  );
}
