"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RiAlarmWarningLine, RiHome5Line, RiRefreshLine } from "@remixicon/react";
import { userRoutes } from "@/lib/routes";

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      console.error("[site error]", error);
    }
  }, [error]);

  return (
    <section className="page-section status-page" data-tone="error">
      <div className="status-page-inner">
        <span className="status-page-icon" aria-hidden="true" data-tone="error">
          <RiAlarmWarningLine size={32} />
        </span>
        <span className="eyebrow">500 · Something went wrong</span>
        <h1>요청을 처리하지 못했습니다</h1>
        <p>
          일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.
          {error.digest ? <><br /><small>오류 코드: {error.digest}</small></> : null}
        </p>
        <div className="status-page-actions">
          <button className="primary-button" onClick={() => reset()} type="button">
            <RiRefreshLine size={18} />
            다시 시도
          </button>
          <Link className="secondary-button" href={userRoutes.home}>
            <RiHome5Line size={16} />
            홈으로
          </Link>
        </div>
      </div>
    </section>
  );
}
