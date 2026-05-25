import Link from "next/link";
import "./globals.css";
import "./styles/site.css";

export default function RootNotFound() {
  return (
    <html lang="ko">
      <body>
        <section className="page-section status-page">
          <div className="status-page-inner">
            <span className="eyebrow">404 · Page Not Found</span>
            <h1>찾으시는 페이지가 없습니다</h1>
            <p>홈에서 다시 시작하거나 검색을 이용해 주세요.</p>
            <div className="status-page-actions">
              <Link className="primary-button" href="/">홈으로</Link>
            </div>
          </div>
        </section>
      </body>
    </html>
  );
}
