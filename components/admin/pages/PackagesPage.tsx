import Link from "next/link";
import { RiAddLine } from "@remixicon/react";
import type { AdminData } from "@/lib/admin/data";
import { formatWon } from "@/lib/format";

export function PackagesPage({ data }: { data: AdminData }) {
  return (
    <section className="admin-b2b-layout">
      <article className="admin-card admin-package-builder">
        <div className="admin-card-header">
          <div>
            <span>패키지 구성</span>
            <h2>프로그램과 옵션을 견적 단위로 묶습니다.</h2>
          </div>
          <Link className="admin-action-button primary" href="/admin/packages/new">
            <RiAddLine size={16} />
            패키지 등록
          </Link>
        </div>
        <div className="admin-program-matrix">
          {data.programs.map((program) => (
            <article key={program.id}>
              <span>{program.type}</span>
              <strong>{program.title}</strong>
              <small>{program.duration}</small>
              <b>{formatWon(program.basePrice)}</b>
            </article>
          ))}
        </div>
      </article>
      <aside className="admin-b2b-side">
        <article className="admin-card">
          <span>인원 구간 할인</span>
          <strong>기관 견적 기준</strong>
          <div className="admin-tier-list">
            {data.discountTiers.map((tier) => (
              <p key={tier.min}>
                {tier.label}
                <b>{tier.rate ? `${Math.round(tier.rate * 100)}%` : "정상가"}</b>
              </p>
            ))}
          </div>
        </article>
        <article className="admin-card">
          <span>추가 옵션</span>
          <div className="admin-option-stack">
            {data.packageOptions.map((option) => (
              <p key={option.id}>
                <strong>{option.title}</strong>
                <small>{option.description}</small>
                <b>{formatWon(option.price)}</b>
              </p>
            ))}
          </div>
        </article>
      </aside>
    </section>
  );
}
