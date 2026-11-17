import "server-only";
import { connection } from "next/server";
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
  ] = await Promise.all([
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
  ]);
  const productReviews = await Promise.all(experiences.slice(0, 4).map((experience) => getProductReviews(experience.slug)));

  return {
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
