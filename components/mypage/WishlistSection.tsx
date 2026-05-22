"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";
import { ExperienceCard } from "@/components/ExperienceCard";
import { SectionError, SectionSkeleton } from "@/components/mypage/MypageCommon";
import { fetchMyWishlist } from "@/lib/api/me";
import type { Experience } from "@/lib/data";
import { userRoutes } from "@/lib/routes";
import type { WishlistItem } from "@/types/api";

export function WishlistSection({ experiences }: { experiences: Experience[] }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  function load() {
    setStatus("loading");
    fetchMyWishlist()
      .then((wishlist) => {
        setItems(wishlist);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }

  useEffect(load, []);

  if (status === "loading") return <SectionSkeleton />;
  if (status === "error") return <SectionError onRetry={load} />;
  if (!items.length) {
    return (
      <EmptyState
        title="찜한 체험이 없습니다."
        description="관심 있는 체험을 저장하면 다시 비교하기 쉬워요."
        action={
          <Link className="primary-button" href={userRoutes.experiences}>
            체험 둘러보기
          </Link>
        }
      />
    );
  }

  const products = items
    .map((item) => item.href.split("?")[0].split("/").filter(Boolean).at(-1))
    .map((slug) => experiences.find((experience) => experience.slug === slug))
    .filter((experience): experience is Experience => Boolean(experience));

  return (
    <div className="card-grid">
      {products.map((experience) => (
        <ExperienceCard experience={experience} key={experience.slug} />
      ))}
    </div>
  );
}
