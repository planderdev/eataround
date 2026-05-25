import Link from "next/link";
import { RiCompass3Line, RiHome5Line } from "@remixicon/react";

export default function AdminNotFound() {
  return (
    <section className="admin-status-page">
      <div className="admin-status-page-inner">
        <span className="admin-status-page-icon" aria-hidden="true">
          <RiCompass3Line size={32} />
        </span>
        <span className="admin-status-page-eyebrow">404 · Admin not found</span>
        <h1>존재하지 않는 관리자 페이지입니다</h1>
        <p>주소를 다시 확인하거나 사이드바 메뉴에서 다른 페이지로 이동해 주세요.</p>
        <div className="admin-status-page-actions">
          <Link className="admin-action-button primary" href="/admin/dashboard">
            <RiHome5Line size={16} />
            대시보드로
          </Link>
        </div>
      </div>
    </section>
  );
}
