import type { Metadata } from "next";
import Link from "next/link";
import { Pagination } from "@/components/Pagination";
import { SectionHeader } from "@/components/SectionHeader";
import { getJournals } from "@/lib/content";

export const metadata: Metadata = {
  title: "저널",
};

type SearchParams = Record<string, string | string[] | undefined>;

const pageSize = 6;

function valueOf(params: SearchParams, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function parsePage(value?: string) {
  const parsed = Number(value ?? 1);
  return Number.isFinite(parsed) ? Math.max(1, Math.floor(parsed)) : 1;
}

export default async function JournalPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const params = searchParams ? await searchParams : {};
  const journals = await getJournals();
  const requestedPage = parsePage(valueOf(params, "page"));
  const totalPages = Math.max(1, Math.ceil(journals.length / pageSize));
  const currentPage = Math.min(requestedPage, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const paginatedJournals = journals.slice(pageStart, pageStart + pageSize);

  return (
    <section className="page-section">
      <SectionHeader
        eyebrow="Journal"
        title="저널"
        description="로컬 경험을 고르기 전 읽을 수 있는 콘텐츠 리스트입니다."
        level="h1"
      />
      <div className="journal-grid">
        {paginatedJournals.map((item) => (
          <Link className="journal-card" href={`/journal/${item.slug}`} key={item.slug}>
            <img src={item.image} alt={item.title} loading="lazy" />
            <span>
              <small>
                {item.category} · {item.date}
              </small>
              <strong>{item.title}</strong>
              <p>{item.excerpt}</p>
            </span>
          </Link>
        ))}
      </div>
      <Pagination basePath="/journal" currentPage={currentPage} pageSize={pageSize} searchParams={params} totalItems={journals.length} />
    </section>
  );
}
