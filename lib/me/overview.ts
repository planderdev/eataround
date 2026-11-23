import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import type { RowDataPacket } from "@/lib/db";
import { getPool, hasDatabaseConfig } from "@/lib/db";
import { readProfile } from "@/lib/me/profile";
import { listMyQuotes } from "@/lib/me/quotes";
import { listMyReservations, rowToReservation, todayInSeoul } from "@/lib/me/reservations";
import { listMyReviews } from "@/lib/me/reviews";
import { listMyWishlist } from "@/lib/me/wishlist";
import { inquiryHistory, myProfile, quoteHistory, reservationHistory, reviewHistory, wishlistItems } from "@/lib/mypage-data";
import { userRoutes } from "@/lib/routes";
import { getSessionUser } from "@/lib/session";
import type { Inquiry, Profile, Quote, Reservation, Review, WishlistItem } from "@/types/api";

// 마이페이지 첫 화면과 메뉴별 요약 숫자. DB가 연결되면 로그인한 회원의 실제 내역을, 아니면 예시 데이터를 쓴다.

export type MyPageData = {
  /** DB 실제 데이터인지(예시 데이터면 false). 쿠폰·포인트 같은 아직 없는 기능은 예시에서만 보여 준다. */
  live: boolean;
  profile: Profile;
  companyApproved: boolean;
  reservations: Reservation[];
  quotes: Quote[];
  inquiries: Pick<Inquiry, "statusTone">[];
  wishlist: WishlistItem[];
  reviews: Review[];
};

function sampleData(): MyPageData {
  return {
    live: false,
    profile: myProfile,
    companyApproved: true,
    reservations: reservationHistory,
    quotes: quoteHistory,
    inquiries: inquiryHistory,
    wishlist: wishlistItems,
    reviews: reviewHistory,
  };
}

async function countInquiries(userId: number) {
  const [rows] = await getPool().query<(RowDataPacket & { status: "open" | "answered" | "closed" })[]>(
    "select status from inquiries where user_id = ? order by created_at desc limit 200",
    [userId],
  );
  const tone = { open: "pending", answered: "received", closed: "done" } as const;
  return rows.map((row) => ({ statusTone: tone[row.status] ?? "pending" }));
}

export async function loadMyPageData(redirectPath: string = userRoutes.me): Promise<MyPageData> {
  if (!hasDatabaseConfig()) return sampleData();

  // 회원마다 내용이 다르므로 빌드 때 굳히지 않고 요청마다 읽는다.
  await connection();
  const user = await getSessionUser();
  if (!user) redirect(`${userRoutes.login}?redirect=${encodeURIComponent(redirectPath)}`);

  const today = todayInSeoul();
  const [profile, reservationRows, quotes, inquiries, wishlist, reviews] = await Promise.all([
    readProfile(user.id),
    listMyReservations(user.id),
    listMyQuotes(user.id),
    countInquiries(user.id),
    listMyWishlist(user.id),
    listMyReviews(user.id),
  ]);
  if (!profile) redirect(`${userRoutes.login}?redirect=${encodeURIComponent(redirectPath)}`);

  return {
    live: true,
    profile,
    companyApproved: user.companyApproved,
    reservations: reservationRows.map((row) => rowToReservation(row, today)),
    quotes,
    inquiries,
    wishlist,
    reviews,
  };
}

/** 체험일이 오늘 이후인 진행 중 예약(취소·이용 완료 제외). */
export function upcomingReservations(reservations: Reservation[]) {
  return reservations.filter((item) => item.statusTone === "pending" || item.statusTone === "confirmed");
}
