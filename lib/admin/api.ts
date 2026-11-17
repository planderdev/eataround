import { mockAdminApi } from "@/lib/mock/admin";
import { withBasePath } from "@/lib/paths";
import type {
  AdminBanner,
  AdminEvent,
  AdminListResult,
  AdminMember,
  AdminMutationResult,
  AdminNotification,
  AdminProduct,
  AdminQuote,
  AdminReservation,
  AdminReview,
  AuthLoginPayload,
  AuthUser,
} from "@/types/api";

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
    throw new Error(`Admin request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const adminApi = {
  reservations: {
    list: async () => (useMock ? mockAdminApi.reservations.list() : fetchJson<AdminListResult<AdminReservation>>("/api/admin/reservations")),
    update: async (id: string, payload: unknown) =>
      useMock ? mockAdminApi.reservations.update() : fetchJson<AdminMutationResult>(`/api/admin/reservations/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    cancel: async (id: string, reason: string) =>
      useMock ? mockAdminApi.reservations.cancel() : fetchJson<AdminMutationResult>(`/api/admin/reservations/${id}`, { method: "PATCH", body: JSON.stringify({ status: "cancelled", reason }) }),
  },
  members: {
    list: async () => (useMock ? mockAdminApi.members.list() : fetchJson<AdminListResult<AdminMember>>("/api/admin/members")),
    update: async (id: string, payload: unknown) =>
      useMock ? mockAdminApi.members.update() : fetchJson<AdminMutationResult>(`/api/admin/members/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  },
  products: {
    list: async () => (useMock ? mockAdminApi.products.list() : fetchJson<AdminListResult<AdminProduct>>("/api/admin/products")),
    update: async (id: string, payload: unknown) =>
      useMock ? mockAdminApi.products.update() : fetchJson<AdminMutationResult>(`/api/admin/products/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  },
  schedules: {
    update: async (id: string, payload: unknown) =>
      useMock ? mockAdminApi.schedules.update() : fetchJson<AdminMutationResult>(`/api/admin/schedules/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  },
  events: {
    list: async () => (useMock ? mockAdminApi.events.list() : fetchJson<AdminListResult<AdminEvent>>("/api/admin/events")),
    update: async (id: string, payload: unknown) =>
      useMock ? mockAdminApi.events.update() : fetchJson<AdminMutationResult>(`/api/admin/events/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  },
  quotes: {
    list: async () => (useMock ? mockAdminApi.quotes.list() : fetchJson<AdminListResult<AdminQuote>>("/api/admin/quotes")),
    update: async (id: string, payload: unknown) =>
      useMock ? mockAdminApi.quotes.update() : fetchJson<AdminMutationResult>(`/api/admin/quotes/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    send: async (id: string) =>
      useMock ? mockAdminApi.quotes.send() : fetchJson<AdminMutationResult>(`/api/admin/quotes/${id}/send`, { method: "POST" }),
  },
  banners: {
    list: async () => (useMock ? mockAdminApi.banners.list() : fetchJson<AdminListResult<AdminBanner>>("/api/admin/banners")),
    update: async (id: string, payload: unknown) =>
      useMock ? mockAdminApi.banners.update() : fetchJson<AdminMutationResult>(`/api/admin/banners/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  },
  curations: {
    list: async () => (useMock ? mockAdminApi.curations.list() : fetchJson<AdminListResult<AdminBanner>>("/api/admin/curations")),
    update: async (id: string, payload: unknown) =>
      useMock ? mockAdminApi.curations.update() : fetchJson<AdminMutationResult>(`/api/admin/curations/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  },
  reviews: {
    list: async () => (useMock ? mockAdminApi.reviews.list() : fetchJson<AdminListResult<AdminReview>>("/api/admin/reviews")),
    update: async (id: string, payload: unknown) =>
      useMock ? mockAdminApi.reviews.update() : fetchJson<AdminMutationResult>(`/api/admin/reviews/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  },
  notifications: {
    list: async () => (useMock ? mockAdminApi.notifications.list() : fetchJson<AdminNotification[]>("/api/admin/notifications")),
    readAll: async () =>
      useMock
        ? ({ ok: true, message: "알림을 모두 읽음 처리했습니다." } satisfies AdminMutationResult)
        : fetchJson<AdminMutationResult<AdminNotification[]>>("/api/admin/notifications", { method: "PATCH" }),
  },
  auth: {
    // 세션 쿠키는 서버만 발급하므로 목업 모드에서도 항상 서버에 요청한다.
    login: async (payload?: AuthLoginPayload) =>
      fetchJson<AdminMutationResult<{ user: AuthUser }>>("/api/admin/auth/login", {
        method: "POST",
        body: JSON.stringify(payload ?? {}),
      }),
  },
  actions: {
    /**
     * 자체 저장 처리가 없는 공용 버튼의 응답. 어떤 행을 바꿀지 알 수 없으므로 서버에 요청하지 않고,
     * 저장된 것처럼 보이지 않도록 "아직 연결되지 않음"을 돌려준다.
     * 실제 저장은 data-admin-own-action 영역(행 편집, 등록 폼, 일괄 처리)이 맡는다.
     */
    async execute(label: string, reason?: string): Promise<AdminMutationResult> {
      return { ok: false, message: `"${label}"은(는) 아직 연결되지 않았습니다.${reason ? ` ${reason}` : ""}` };
    },
  },
};
