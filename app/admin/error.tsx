"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RiAlarmWarningLine, RiHome5Line, RiRefreshLine } from "@remixicon/react";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      console.error("[admin error]", error);
    }
  }, [error]);

  return (
    <section className="admin-status-page" data-tone="error">
      <div className="admin-status-page-inner">
        <span className="admin-status-page-icon" aria-hidden="true">
          <RiAlarmWarningLine size={32} />
        </span>
        <span className="admin-status-page-eyebrow">500 · Admin error</span>
        <h1>관리자 화면을 불러오지 못했습니다</h1>
        <p>
          일시적인 오류가 발생했습니다. 잠시 후 다시 시도하거나 대시보드로 돌아가 주세요.
          {error.digest ? <><br /><small>오류 코드: {error.digest}</small></> : null}
        </p>
        <div className="admin-status-page-actions">
          <button className="admin-action-button primary" onClick={() => reset()} type="button">
            <RiRefreshLine size={16} />
            다시 시도
          </button>
          <Link className="admin-action-button ghost" href="/admin/dashboard">
            <RiHome5Line size={16} />
            대시보드로
          </Link>
        </div>
      </div>
    </section>
  );
}
