import type { Metadata } from "next";
import { EmptyState } from "@/components/EmptyState";
import { ExperienceCard } from "@/components/ExperienceCard";
import { ExperienceFilterModal } from "@/components/ExperienceFilterModal";
import { ListToolbar } from "@/components/ListToolbar";
import { Pagination } from "@/components/Pagination";
import { SectionHeader } from "@/components/SectionHeader";
import { SortSelect } from "@/components/SortSelect";
import { getExperiences } from "@/lib/content";
import type { Experience } from "@/lib/data";
import {
  applyExperienceFilters,
  countActiveFilters,
  createExperienceFilterTabs,
  getInitialFilterTabId,
  valueOf,
  type FilterSearchParams,
} from "@/lib/experience-filters";
import { userRoutes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "로컬체험",
};

const pageSize = 4;

const sortOptions = [
  { label: "추천순", value: "recommended" },
  { label: "예약 많은순", value: "popular" },
  { label: "낮은 가격순", value: "price-low" },
  { label: "리뷰 높은순", value: "review-high" },
];

function parsePage(value?: string) {
  const parsed = Number(value ?? 1);
  return Number.isFinite(parsed) ? Math.max(1, Math.floor(parsed)) : 1;
}

function normalizeSort(value?: string) {
  if (value && sortOptions.some((option) => option.value === value)) return value;
  return "recommended";
}

function sortExperiences(experiences: Experience[], sort: string) {
  const sorted = [...experiences];

  if (sort === "popular") {
    return sorted.sort((a, b) => b.reviewCount - a.reviewCount || b.rating - a.rating);
  }

  if (sort === "price-low") {
    return sorted.sort((a, b) => a.price - b.price);
  }

  if (sort === "review-high") {
    return sorted.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
  }

  return sorted;
}

export default async function ExperiencesPage({ searchParams }: { searchParams?: Promise<FilterSearchParams> }) {
  const params = searchParams ? await searchParams : {};
  const experiences = await getExperiences();
  const sort = normalizeSort(valueOf(params, "sort"));
  const requestedPage = parsePage(valueOf(params, "page"));

  const filtered = experiences.filter((experience) => applyExperienceFilters(experience, params));
  const sorted = sortExperiences(filtered, sort);
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(requestedPage, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const paginated = sorted.slice(pageStart, pageStart + pageSize);
  const activeCount = countActiveFilters(params);
  const initialTabId = getInitialFilterTabId(params);
  const filterTabs = createExperienceFilterTabs(params);

  return (
    <section className="page-section">
      <SectionHeader
        eyebrow="Local Experiences"
        title="로컬체험"
        description="제주의 식문화와 마을, 로컬 호스트를 가까이 만나는 여행을 찾아보세요."
        level="h1"
      />

      <div className="listing-layout">
        <div>
          <ListToolbar
            summary={
              <>
                <strong>{sorted.length}개 체험</strong>
                <ExperienceFilterModal
                  activeCount={activeCount}
                  initialTabId={initialTabId}
                  resultCount={sorted.length}
                  tabs={filterTabs}
                />
              </>
            }
          >
            <SortSelect label="정렬" options={sortOptions} value={sort} />
          </ListToolbar>

          {filtered.length ? (
            <div className="card-grid">
              {paginated.map((experience) => (
                <ExperienceCard experience={experience} key={experience.slug} />
              ))}
            </div>
          ) : (
            <EmptyState title="조건에 맞는 체험이 없습니다." description="필터를 다시 선택해 주세요." />
          )}
          <Pagination basePath={userRoutes.experiences} currentPage={currentPage} pageSize={pageSize} searchParams={params} totalItems={sorted.length} />
        </div>
      </div>
    </section>
  );
}
