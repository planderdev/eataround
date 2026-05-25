import Link from "next/link";
import { RiArrowRightLine, RiCompass3Line, RiHome5Line } from "@remixicon/react";
import { userRoutes } from "@/lib/routes";

export default function SiteNotFound() {
  return (
    <section className="page-section status-page">
      <div className="status-page-inner">
        <span className="status-page-icon" aria-hidden="true">
          <RiCompass3Line size={32} />
        </span>
        <span className="eyebrow">404 · Page Not Found</span>
        <h1>찾으시는 페이지가 없습니다</h1>
        <p>
          URL이 잘못 입력되었거나 이미 종료된 페이지일 수 있습니다.
          <br />
          홈 또는 로컬체험 리스트에서 다시 시작해 보세요.
        </p>
        <div className="status-page-actions">
          <Link className="primary-button" href={userRoutes.home}>
            <RiHome5Line size={18} />
            홈으로
          </Link>
          <Link className="secondary-button" href={userRoutes.experiences}>
            로컬체험 보기
            <RiArrowRightLine size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
