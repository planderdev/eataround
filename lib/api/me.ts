import {
  getMockQuote,
  getMockQuotes,
  getMockProfile,
  getMockReservation,
  getMockReservations,
  getMockReviews,
  getMockWishlist,
  submitMockReview,
  toggleMockWishlist,
  updateMockProfile,
} from "@/lib/mock/me";
import { withBasePath } from "@/lib/paths";
import type { ApiSuccess, Profile, ProfilePayload, Quote, Reservation, Review, ReviewPayload, WishlistItem } from "@/types/api";

const useMock = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(withBasePath(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchMyReservations(): Promise<Reservation[]> {
  if (useMock) return getMockReservations();
  return fetchJson<Reservation[]>("/api/me/reservations");
}

export async function fetchMyReservation(id: string): Promise<Reservation> {
  if (useMock) return getMockReservation(id);
  return fetchJson<Reservation>(`/api/me/reservations/${id}`);
}

export async function fetchMyQuotes(): Promise<Quote[]> {
  if (useMock) return getMockQuotes();
  return fetchJson<Quote[]>("/api/me/quotes");
}

export async function fetchMyQuote(id: string): Promise<Quote> {
  if (useMock) return getMockQuote(id);
  return fetchJson<Quote>(`/api/me/quotes/${id}`);
}

export async function fetchMyWishlist(): Promise<WishlistItem[]> {
  if (useMock) return getMockWishlist();
  return fetchJson<WishlistItem[]>("/api/me/wishlist");
}

export async function toggleWishlist(slug: string): Promise<{ saved: boolean }> {
  if (useMock) return toggleMockWishlist(slug);
  const current = readWishlistCache().has(slug);
  return fetchJson<{ saved: boolean }>(`/api/me/wishlist/${slug}`, {
    method: current ? "DELETE" : "POST",
  });
}

export async function fetchMyReviews(): Promise<Review[]> {
  if (useMock) return getMockReviews();
  return fetchJson<Review[]>("/api/me/reviews");
}

export async function fetchMyProfile(): Promise<Profile> {
  if (useMock) return getMockProfile();
  return fetchJson<Profile>("/api/me/profile");
}

export async function submitReview(payload: ReviewPayload): Promise<Review> {
  if (useMock) return submitMockReview(payload);
  return fetchJson<Review>("/api/me/reviews", {
    method: payload.reviewId ? "PATCH" : "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateProfile(payload: ProfilePayload): Promise<Profile> {
  if (useMock) return updateMockProfile(payload);
  return fetchJson<Profile>("/api/me/profile", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function updatePassword(payload: NonNullable<ProfilePayload["password"]>): Promise<ApiSuccess> {
  if (useMock) {
    await updateMockProfile({ password: payload });
    return { ok: true, message: "비밀번호 변경 요청이 접수되었습니다." };
  }

  return fetchJson<ApiSuccess>("/api/me/password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function confirmReservation(id: string): Promise<Reservation> {
  if (useMock) {
    const reservation = await getMockReservation(id);
    return { ...reservation, status: "예약 신청 완료", statusTone: "confirmed" };
  }
  return fetchJson<Reservation>(`/api/me/reservations/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "requested" }),
  });
}

export function readWishlistCache() {
  if (typeof window === "undefined") return new Set<string>();
  try {
    return new Set(JSON.parse(window.localStorage.getItem("wishlist:slugs") ?? "[]") as string[]);
  } catch {
    return new Set<string>();
  }
}
