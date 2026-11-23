import "server-only";
import { connection } from "next/server";
import { withStrictDatabase } from "@/lib/db-strict";
import {
  getAdminMembers,
  getAdminQuoteRequests,
  getAdminReservations,
  getCategories,
  getCollections,
  getDiscountTiers,
  getEvents,
  getExperiences,
  getHeroSlides,
  getJournals,
  getPackageCtas,
  getPackageOptions,
  getPackagePrograms,
  getProductReviews,
} from "@/lib/content";
import {
  getAdminBanners,
  getAdminCategories,
  getAdminCollections,
  getAdminJournals,
  getAdminEvents,
  getAdminProducts,
  getAdminReviews,
  getAdminSchedules,
} from "@/lib/admin/content";

export async function loadAdminData() {
  // 관리자 화면은 빌드 시점 결과를 굳히지 않고 요청마다 최신 데이터를 읽는다.
  await connection();
  const [
    experiences,
    events,
    journals,
    reservations,
    quoteRequests,
    members,
    programs,
    packageOptions,
    discountTiers,
    heroSlides,
    packageCtas,
    collections,
    categories,
    adminProducts,
    adminSchedules,
    adminBanners,
    adminCollections,
    adminEvents,
    adminReviews,
    adminJournals,
    adminCategories,
  ] = await withStrictDatabase(() => Promise.all([
    getExperiences(),
    getEvents(),
    getJournals(),
    getAdminReservations(),
    getAdminQuoteRequests(),
    getAdminMembers(),
    getPackagePrograms(),
    getPackageOptions(),
    getDiscountTiers(),
    getHeroSlides(),
    getPackageCtas(),
    getCollections(),
    getCategories(),
    getAdminProducts(),
    getAdminSchedules(),
    getAdminBanners(),
    getAdminCollections(),
    getAdminEvents(),
    getAdminReviews(),
    getAdminJournals(),
    getAdminCategories(),
  ]));
  const productReviews = await withStrictDatabase(() =>
    Promise.all(experiences.slice(0, 4).map((experience) => getProductReviews(experience.slug))),
  );

  return {
    // 관리자 목록 전용(비노출·마감 포함, DB 행 id 포함)
    adminBanners,
    adminCategories,
    adminCollections,
    adminEvents,
    adminJournals,
    adminProducts,
    adminReviews,
    adminSchedules,
    categories,
    collections,
    discountTiers,
    events,
    experiences,
    flatReviews: productReviews.flat(),
    heroSlides,
    journals,
    members,
    packageCtas,
    packageOptions,
    programs,
    quoteRequests,
    reservations,
  };
}

export type AdminData = Awaited<ReturnType<typeof loadAdminData>>;
