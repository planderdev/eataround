import type { Metadata } from "next";
import Link from "next/link";
import { RiArrowRightLine } from "@remixicon/react";
import { Pagination } from "@/components/Pagination";
import { SectionHeader } from "@/components/SectionHeader";
import { SortSelect } from "@/components/SortSelect";
import { getCollections } from "@/lib/content";

export const metadata: Metadata = {
  title: "기획전",
  description: "제주 로컬체험을 취향과 일정별로 묶어 소개합니다.",
};

type SearchParams = Record<string, string | string[] | undefined>;
type CollectionList = Awaited<ReturnType<typeof getCollections>>;

const pageSize = 6;

const sortOptions = [
  { label: "추천순", value: "recommended" },
  { label: "테마순", value: "theme" },
  { label: "이름순", value: "title" },
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

function sortCollections(collections: CollectionList, sort: string) {
  const sorted = [...collections];

  if (sort === "theme") {
    return sorted.sort((a, b) => a.eyebrow.localeCompare(b.eyebrow, "ko") || a.title.localeCompare(b.title, "ko"));
  }

  if (sort === "title") {
    return sorted.sort((a, b) => a.title.localeCompare(b.title, "ko"));
  }

  return sorted;
}

export default async function CurationsPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const params = searchParams ? await searchParams : {};
  const collections = await getCollections();
  const sort = normalizeSort(valueOf(params, "sort"));
  const sortedCollections = sortCollections(collections, sort);
  const requestedPage = parsePage(valueOf(params, "page"));
  const totalPages = Math.max(1, Math.ceil(sortedCollections.length / pageSize));
  const currentPage = Math.min(requestedPage, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const paginatedCollections = sortedCollections.slice(pageStart, pageStart + pageSize);

  return (
    <section className="page-section">
      <SectionHeader
        eyebrow="Curations"
        title="기획전"
        description="제철, 지역, 목적에 맞춰 고른 로컬 체험 컬렉션입니다."
        level="h1"
      />

      <div className="list-toolbar">
        <div className="list-toolbar-main">
          <strong>{sortedCollections.length}개 기획전</strong>
        </div>
        <SortSelect label="기획전 정렬" options={sortOptions} value={sort} />
      </div>

      <div className="curation-grid">
        {paginatedCollections.map((collection) => (
          <Link className="curation-card" href={collection.href} key={collection.slug}>
            <img src={collection.image} alt={collection.title} loading="lazy" />
            <span>
              <small>{collection.eyebrow}</small>
              <strong>{collection.title}</strong>
              <p>{collection.description}</p>
              <b>
                자세히 보기
                <RiArrowRightLine size={16} />
              </b>
            </span>
          </Link>
        ))}
      </div>

      <Pagination alwaysShow basePath="/curations" currentPage={currentPage} pageSize={pageSize} searchParams={params} totalItems={sortedCollections.length} />
    </section>
  );
}
