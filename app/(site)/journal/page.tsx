import type { Metadata } from "next";
import { JournalCard } from "@/components/JournalCard";
import { ListToolbar } from "@/components/ListToolbar";
import { Pagination } from "@/components/Pagination";
import { SectionHeader } from "@/components/SectionHeader";
import { SortSelect } from "@/components/SortSelect";
import { getJournals } from "@/lib/content";

export const metadata: Metadata = {
  title: "저널",
};

type SearchParams = Record<string, string | string[] | undefined>;
type JournalList = Awaited<ReturnType<typeof getJournals>>;

const pageSize = 6;

const sortOptions = [
  { label: "추천순", value: "recommended" },
  { label: "최신순", value: "latest" },
  { label: "카테고리순", value: "category" },
  { label: "제목순", value: "title" },
];

function valueOf(params: SearchParams, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function parsePage(value?: string) {
  const parsed = Number(value ?? 1);
  return Number.isFinite(parsed) ? Math.max(1, Math.floor(parsed)) : 1;
}

function normalizeSort(value?: string): string {
  if (value && sortOptions.some((option) => option.value === value)) return value;
  return "recommended";
}

function journalDateTimestamp(date: string) {
  const timestamp = Date.parse(date.replace(/\./g, "-"));
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function sortJournals(journals: JournalList, sort: string) {
  const sorted = [...journals];

  if (sort === "latest") {
    return sorted.sort((a, b) => journalDateTimestamp(b.date) - journalDateTimestamp(a.date));
  }

  if (sort === "category") {
    return sorted.sort((a, b) => a.category.localeCompare(b.category, "ko") || a.title.localeCompare(b.title, "ko"));
  }

  if (sort === "title") {
    return sorted.sort((a, b) => a.title.localeCompare(b.title, "ko"));
  }

  return sorted;
}

export default async function JournalPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const params = searchParams ? await searchParams : {};
  const journals = await getJournals();
  const sort = normalizeSort(valueOf(params, "sort"));
  const sortedJournals = sortJournals(journals, sort);
  const requestedPage = parsePage(valueOf(params, "page"));
  const totalPages = Math.max(1, Math.ceil(sortedJournals.length / pageSize));
  const currentPage = Math.min(requestedPage, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const paginatedJournals = sortedJournals.slice(pageStart, pageStart + pageSize);

  return (
    <section className="page-section">
      <SectionHeader
        eyebrow="Journal"
        title="저널"
        description="로컬 경험을 고르기 전 읽을 수 있는 콘텐츠 리스트입니다."
        level="h1"
      />

      <ListToolbar summary={<strong>{sortedJournals.length}개 저널</strong>}>
        <SortSelect label="저널 정렬" options={sortOptions} value={sort} />
      </ListToolbar>

      <div className="journal-grid">
        {paginatedJournals.map((item) => (
          <JournalCard item={item} key={item.slug} />
        ))}
      </div>
      <Pagination alwaysShow basePath="/journal" currentPage={currentPage} pageSize={pageSize} searchParams={params} totalItems={sortedJournals.length} />
    </section>
  );
}
