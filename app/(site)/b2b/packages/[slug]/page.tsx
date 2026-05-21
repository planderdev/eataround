import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RiArrowLeftLine, RiCalendarLine, RiFileList3Line, RiGroupLine } from "@remixicon/react";
import { getDiscountTiers, getPackageOptions, getPackagePrograms } from "@/lib/content";
import { formatWon } from "@/lib/format";
import { userRoutes } from "@/lib/routes";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const programs = await getPackagePrograms();
  return programs.map((program) => ({ slug: program.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const programs = await getPackagePrograms();
  const program = programs.find((item) => item.id === slug);
  if (!program) return {};

  return {
    title: program.title,
    description: `${program.title} 기업·기관 단체 프로그램 안내`,
  };
}

export default async function B2BPackageDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [programs, options, tiers] = await Promise.all([getPackagePrograms(), getPackageOptions(), getDiscountTiers()]);
  const program = programs.find((item) => item.id === slug);

  if (!program) notFound();

  return (
    <section className="page-section package-detail-page">
      <Link className="journal-detail-back" href={userRoutes.b2bPackages}>
        <RiArrowLeftLine size={18} />
        패키지 목록
      </Link>

      <header className="package-detail-hero">
        <span className="eyebrow">{program.type}</span>
        <h1>{program.title}</h1>
        <p>행사 목적과 참여 인원에 맞춰 일정, 식사, 이동 옵션을 조합할 수 있는 단체 프로그램입니다.</p>
        <div className="package-detail-facts">
          <span>
            <RiGroupLine size={18} />
            10명 이상 권장
          </span>
          <span>
            <RiCalendarLine size={18} />
            {program.duration}
          </span>
          <span>
            <RiFileList3Line size={18} />
            {formatWon(program.basePrice)}~
          </span>
        </div>
      </header>

      <div className="package-detail-layout">
        <main className="package-detail-main">
          <section className="detail-section">
            <h2>패키지 설명</h2>
            <p>워크숍, 연수, 고객 초청 행사 등 목적에 따라 진행 시간과 참여 난이도를 조정합니다.</p>
          </section>

          <section className="detail-section">
            <h2>포함 프로그램</h2>
            <div className="program-list">
              {programs.slice(0, 4).map((item) => (
                <article className="program-option" data-active={item.id === program.id} key={item.id}>
                  <span>
                    <b>{item.title}</b>
                    <small>
                      {item.type} · {item.duration}
                    </small>
                  </span>
                  <strong>{item.type === "강의" ? formatWon(item.basePrice) : `${formatWon(item.basePrice)} / 인`}</strong>
                </article>
              ))}
            </div>
          </section>

          <section className="detail-section">
            <h2>옵션 안내</h2>
            <div className="program-list">
              {options.map((option) => (
                <article className="program-option" key={option.id}>
                  <span>
                    <b>{option.title}</b>
                    <small>{option.description}</small>
                  </span>
                  <strong>{option.priceType === "flat" ? formatWon(option.price) : `${formatWon(option.price)} / 인`}</strong>
                </article>
              ))}
            </div>
          </section>
        </main>

        <aside className="quote-summary">
          <span className="eyebrow">견적 기준</span>
          <h2>단체 견적 기준</h2>
          <dl>
            <div>
              <dt>기준가</dt>
              <dd>{program.type === "강의" ? formatWon(program.basePrice) : `${formatWon(program.basePrice)} / 인`}</dd>
            </div>
            <div>
              <dt>권장 일정</dt>
              <dd>{program.duration}</dd>
            </div>
            <div>
              <dt>권장 인원</dt>
              <dd>10명 이상</dd>
            </div>
          </dl>
          <div className="b2b-discount-table compact">
            {tiers.slice(0, 4).map((tier) => (
              <div key={tier.min}>
                <span>{tier.label}</span>
                <strong>{tier.rate ? `${Math.round(tier.rate * 100)}%` : "기본"}</strong>
              </div>
            ))}
          </div>
          <Link className="primary-button full" href={`${userRoutes.b2bQuote}?packageId=${program.id}`}>
            단체 견적 요청
          </Link>
        </aside>
      </div>
    </section>
  );
}
