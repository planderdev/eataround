export default function AdminLoading() {
  return (
    <div className="admin-page-loading" aria-busy="true" aria-live="polite">
      <div className="admin-page-loading-header">
        <span className="skeleton admin-page-loading-eyebrow" />
        <span className="skeleton admin-page-loading-title" />
        <span className="skeleton admin-page-loading-desc" />
      </div>
      <div className="admin-page-loading-stats">
        <span className="skeleton" />
        <span className="skeleton" />
        <span className="skeleton" />
        <span className="skeleton" />
      </div>
      <div className="admin-page-loading-body">
        <span className="skeleton" />
        <span className="skeleton" />
        <span className="skeleton" />
        <span className="skeleton" />
        <span className="skeleton" />
        <span className="skeleton" />
      </div>
    </div>
  );
}
