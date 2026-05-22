import {
  myProfile,
  quoteHistory,
  reservationHistory,
  reviewHistory,
  wishlistItems,
} from "@/lib/mypage-data";
import type { Profile, ProfilePayload, Quote, Reservation, Review, ReviewPayload, WishlistItem } from "@/types/api";

const wait = () => new Promise((resolve) => setTimeout(resolve, 180));

function readSavedWishlist() {
  if (typeof window === "undefined") return new Set<string>();
  try {
    return new Set(JSON.parse(window.localStorage.getItem("wishlist:slugs") ?? "[]") as string[]);
  } catch {
    return new Set<string>();
  }
}

function writeSavedWishlist(slugs: Set<string>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("wishlist:slugs", JSON.stringify(Array.from(slugs)));
}

export async function getMockReservations(): Promise<Reservation[]> {
  await wait();
  return reservationHistory;
}

export async function getMockReservation(id: string): Promise<Reservation> {
  await wait();
  return reservationHistory.find((reservation) => reservation.id === id) ?? reservationHistory[0];
}

export async function getMockQuotes(): Promise<Quote[]> {
  await wait();
  return quoteHistory;
}

export async function getMockQuote(id: string): Promise<Quote> {
  await wait();
  return quoteHistory.find((quote) => quote.id === id) ?? quoteHistory[0];
}

export async function getMockWishlist(): Promise<WishlistItem[]> {
  await wait();
  return wishlistItems;
}

export async function toggleMockWishlist(slug: string): Promise<{ saved: boolean }> {
  await wait();
  const slugs = readSavedWishlist();
  const saved = !slugs.has(slug);
  if (saved) slugs.add(slug);
  else slugs.delete(slug);
  writeSavedWishlist(slugs);
  return { saved };
}

export async function getMockReviews(): Promise<Review[]> {
  await wait();
  return reviewHistory;
}

export async function getMockProfile(): Promise<Profile> {
  await wait();
  return { ...myProfile, marketing: true };
}

export async function submitMockReview(payload: ReviewPayload): Promise<Review> {
  await wait();
  return {
    title: payload.reservationId ?? "체험 후기",
    status: "작성 완료",
    statusTone: "done",
    date: "방금 작성",
    rating: payload.rating,
    text: payload.text,
    href: "/me/reviews",
  };
}

export async function updateMockProfile(payload: ProfilePayload): Promise<Profile> {
  await wait();
  return {
    ...myProfile,
    ...payload,
  };
}
