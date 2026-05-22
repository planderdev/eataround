import {
  adminMembers,
  adminQuoteRequests,
  adminReservations,
  collections,
  events,
  experiences,
  heroSlides,
  journals,
  packageCtas,
  productReviews,
} from "@/lib/data";
import type { AdminListResult, AdminMutationResult } from "@/types/api";

const wait = () => new Promise((resolve) => setTimeout(resolve, 220));

function list<T>(items: T[], page = 1, pageSize = 20): AdminListResult<T> {
  return {
    items: items.slice((page - 1) * pageSize, page * pageSize),
    page,
    pageSize,
    total: items.length,
  };
}

function ok(message: string): AdminMutationResult {
  return { ok: true, message };
}

export const mockAdminApi = {
  reservations: {
    async list() {
      await wait();
      return list(adminReservations);
    },
    async update() {
      await wait();
      return ok("예약 상태를 업데이트했습니다.");
    },
    async cancel() {
      await wait();
      return ok("예약 취소 검토 상태로 변경했습니다.");
    },
  },
  members: {
    async list() {
      await wait();
      return list(adminMembers);
    },
    async update() {
      await wait();
      return ok("회원 정보를 업데이트했습니다.");
    },
  },
  products: {
    async list() {
      await wait();
      return list(experiences);
    },
    async update() {
      await wait();
      return ok("상품 운영 정보를 저장했습니다.");
    },
  },
  schedules: {
    async update() {
      await wait();
      return ok("회차·재고 정보를 반영했습니다.");
    },
  },
  events: {
    async list() {
      await wait();
      return list(events);
    },
    async update() {
      await wait();
      return ok("행사 정보를 업데이트했습니다.");
    },
  },
  quotes: {
    async list() {
      await wait();
      return list(adminQuoteRequests);
    },
    async update() {
      await wait();
      return ok("견적 상태를 업데이트했습니다.");
    },
    async send() {
      await wait();
      return ok("견적서 발송 요청을 완료했습니다.");
    },
  },
  banners: {
    async list() {
      await wait();
      return list([...heroSlides, ...packageCtas]);
    },
    async update() {
      await wait();
      return ok("배너 노출 정보를 저장했습니다.");
    },
  },
  curations: {
    async list() {
      await wait();
      return list(collections);
    },
    async update() {
      await wait();
      return ok("기획전 정보를 저장했습니다.");
    },
  },
  reviews: {
    async list() {
      await wait();
      return list(Object.values(productReviews).flat());
    },
    async update() {
      await wait();
      return ok("리뷰 노출 상태를 변경했습니다.");
    },
  },
  auth: {
    async login() {
      await wait();
      return ok("관리자 로그인에 성공했습니다.");
    },
  },
  notifications: {
    async list() {
      await wait();
      return [
        { id: "n1", category: "예약", title: "승인 대기 예약 3건", href: "/admin/reservations", unread: true },
        { id: "n2", category: "견적", title: "미검토 견적 2건", href: "/admin/quotes", unread: true },
        { id: "n3", category: "시스템", title: "상품 이미지 최적화 완료", href: "/admin/products", unread: false },
      ];
    },
  },
};
