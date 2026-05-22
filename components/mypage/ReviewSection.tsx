"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";
import { MyReviewList, type MyReviewItem } from "@/components/MyReviewList";
import { SectionError, SectionSkeleton } from "@/components/mypage/MypageCommon";
import { fetchMyReviews } from "@/lib/api/me";
import type { Experience } from "@/lib/data";
import { experiencePath, userRoutes } from "@/lib/routes";
import type { Review } from "@/types/api";

export function ReviewSection({ experiences }: { experiences: Experience[] }) {
  const [items, setItems] = useState<Review[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  function load() {
    setStatus("loading");
    fetchMyReviews()
      .then((reviews) => {
        setItems(reviews);
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
        title="후기 내역이 없습니다."
        description="체험 완료 후 후기를 작성하면 이곳에서 관리할 수 있어요."
        action={
          <Link className="primary-button" href={`${userRoutes.me}/reservations`}>
            예약 내역 보기
          </Link>
        }
      />
    );
  }

  const reviewItems: MyReviewItem[] = items.map((item) => {
    const product = findReviewProduct(experiences, item);
    const productHref = product ? experiencePath(product.slug) : item.href;

    return {
      ...item,
      product: product
        ? {
            href: productHref,
            image: product.image,
            title: product.title,
          }
        : undefined,
      productHref,
    };
  });

  return <MyReviewList items={reviewItems} />;
}

function findReviewProduct(experiences: Experience[], item: Review) {
  const slug = item.href.split("?")[0].split("/").filter(Boolean).at(-1);

  return (
    experiences.find((experience) => experience.slug === slug) ??
    experiences.find((experience) => experience.title === item.title) ??
    experiences.find((experience) => experience.title.includes(item.title) || item.title.includes(experience.title))
  );
}
