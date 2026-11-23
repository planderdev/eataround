import {
  getMockInquiries,
  getMockInquiry,
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
import type { ApiSuccess, Inquiry, Profile, ProfilePayload, Quote, Reservation, Review, ReviewPayload, WishlistItem } from "@/types/api";

const useMock = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

/** 서버가 거절한 요청. status로 로그인 필요(401)와 다른 실패를 가른다. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(withBasePath(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    // 서버가 알려 준 이유가 있으면 그 문구로 실패를 알린다.
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new ApiError(body?.message ?? `요청을 처리하지 못했습니다. (${response.status})`, response.status);
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

export async function fetchMyInquiries(): Promise<Inquiry[]> {
  if (useMock) return getMockInquiries();
  return fetchJson<Inquiry[]>("/api/me/inquiries");
}

export async function fetchMyInquiry(id: string): Promise<Inquiry> {
  if (useMock) return getMockInquiry(id);
  return fetchJson<Inquiry>(`/api/me/inquiries/${id}`);
}

export async function fetchMyWishlist(): Promise<WishlistItem[]> {
  if (useMock) return getMockWishlist();
  const items = await fetchJson<WishlistItem[]>("/api/me/wishlist");
  // 하트 표시는 브라우저 캐시를 보므로 서버 목록으로 맞춘다.
  writeWishlistCache(new Set(items.map((item) => item.slug).filter((slug): slug is string => Boolean(slug))));
  return items;
}

export async function toggleWishlist(slug: string): Promise<{ saved: boolean }> {
  if (useMock) return toggleMockWishlist(slug);
  const current = readWishlistCache().has(slug);
  const result = await fetchJson<{ saved: boolean }>(`/api/me/wishlist/${encodeURIComponent(slug)}`, {
    method: current ? "DELETE" : "POST",
  });
  const cache = readWishlistCache();
  if (result.saved) cache.add(slug);
  else cache.delete(slug);
  writeWishlistCache(cache);
  return result;
}

/** 로그인·로그아웃 때 이전 회원의 찜 표시가 남지 않게 서버 목록으로 다시 맞춘다. */
export async function syncWishlistCache(authenticated: boolean) {
  if (useMock || typeof window === "undefined") return;
  if (!authenticated) {
    writeWishlistCache(new Set());
    return;
  }
  await fetchMyWishlist().catch(() => undefined);
}

function writeWishlistCache(slugs: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem("wishlist:slugs", JSON.stringify(Array.from(slugs)));
  } catch {
    // 저장소를 쓸 수 없는 브라우저는 표시만 못 한다.
  }
  window.dispatchEvent(new Event("wishlist:changed"));
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

/** 회원이 자기 예약을 취소한다. DB 연결 환경에서는 회차 좌석도 되돌린다. */
export async function cancelMyReservation(id: string): Promise<Reservation> {
  if (useMock) {
    const reservation = await getMockReservation(id);
    return { ...reservation, status: "예약 취소", statusTone: "cancelled", canCancel: false };
  }
  return fetchJson<Reservation>(`/api/me/reservations/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "cancelled" }),
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
