export default function SiteLoading() {
  return (
    <section className="page-section status-page" aria-busy="true" aria-live="polite">
      <div className="status-page-inner">
        <div className="status-page-skeleton">
          <span className="skeleton status-page-skeleton-eyebrow" />
          <span className="skeleton status-page-skeleton-title" />
          <span className="skeleton status-page-skeleton-text" />
          <span className="skeleton status-page-skeleton-text" />
          <span className="skeleton status-page-skeleton-text status-page-skeleton-text--short" />
        </div>
      </div>
    </section>
  );
}
