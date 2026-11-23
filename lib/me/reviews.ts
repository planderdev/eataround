import "server-only";
import type { RowDataPacket } from "@/lib/db";
import { getPool } from "@/lib/db";
import { formatReservationId, isCompleted, listMyReservations, todayInSeoul } from "@/lib/me/reservations";
import { experiencePath, userRoutes } from "@/lib/routes";
import type { ApiTone, Review } from "@/types/api";

// 내 리뷰: 이용을 마친 예약에만 후기를 받고, 관리자가 검수(승인)한 뒤 상품 상세에 노출한다.

type MyReviewRow = RowDataPacket & {
  id: number;
  reservation_id: number | null;
  rating: number;
  body: string;
  status: "pending" | "approved" | "hidden";
  created_at: Date;
  updated_at: Date;
  title: string | null;
  slug: string | null;
};

const REVIEW_STATUS: Record<MyReviewRow["status"], { label: string; tone: ApiTone }> = {
  pending: { label: "검수 중", tone: "pending" },
  approved: { label: "작성 완료", tone: "done" },
  hidden: { label: "비공개", tone: "cancelled" },
};

export const REVIEW_MIN_LENGTH = 20;
export const REVIEW_MAX_LENGTH = 500;

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" })
    .format(value)
    .replace(/\.\s?/g, ".")
    .replace(/\.$/, "");
}

export function formatReviewId(id: number) {
  return `V-${id.toString().padStart(6, "0")}`;
}

export function parseReviewId(value: unknown) {
  const match = /^(?:V-)?0*(\d{1,12})$/.exec(String(value ?? "").trim());
  return match ? Number(match[1]) : null;
}

function rowToReview(row: MyReviewRow): Review {
  const status = REVIEW_STATUS[row.status] ?? REVIEW_STATUS.pending;
  const edited = row.updated_at.getTime() - row.created_at.getTime() > 1000;
  return {
    title: row.title ?? "삭제된 상품",
    status: status.label,
    statusTone: status.tone,
    date: `${formatDate(edited ? row.updated_at : row.created_at)} ${edited ? "수정" : "작성"}`,
    rating: row.rating,
    text: row.body,
    href: row.slug ? experiencePath(row.slug) : `${userRoutes.me}/reviews`,
    reviewId: formatReviewId(row.id),
    reservationId: row.reservation_id ? formatReservationId(row.reservation_id) : undefined,
  };
}

async function readMyReview(userId: number, reviewId: number) {
  const [rows] = await getPool().query<MyReviewRow[]>(
    `select pr.id, pr.reservation_id, pr.rating, pr.body, pr.status, pr.created_at, pr.updated_at, p.title, p.slug
       from product_reviews pr
       left join products p on p.id = pr.product_id
      where pr.user_id = ? and pr.id = ?
      limit 1`,
    [userId, reviewId],
  );
  return rows[0] ? rowToReview(rows[0]) : null;
}

/** 작성할 수 있는 후기(이용 완료·후기 없음)와 내가 쓴 후기를 함께 돌려준다. */
export async function listMyReviews(userId: number): Promise<Review[]> {
  const today = todayInSeoul();
  const [reservations, [written]] = await Promise.all([
    listMyReservations(userId),
    getPool().query<MyReviewRow[]>(
      `select pr.id, pr.reservation_id, pr.rating, pr.body, pr.status, pr.created_at, pr.updated_at, p.title, p.slug
         from product_reviews pr
         left join products p on p.id = pr.product_id
        where pr.user_id = ?
        order by pr.created_at desc
        limit 200`,
      [userId],
    ),
  ]);

  const writable: Review[] = reservations
    .filter((row) => isCompleted(row, today) && !row.review_id && (row.slug ?? row.product_slug))
    .map((row) => ({
      title: row.title ?? "로컬체험",
      status: "작성 가능",
      statusTone: "pending",
      date: `${(row.schedule_date ?? "").replaceAll("-", ".")} 이용 완료`,
      rating: null,
      text: "체험은 어떠셨나요? 후기를 남기면 운영팀 검수 후 상품 상세에 보입니다.",
      href: experiencePath((row.slug ?? row.product_slug) as string),
      reservationId: formatReservationId(row.id),
    }));

  return [...writable, ...written.map(rowToReview)];
}

type ReviewResult = { ok: true; review: Review } | { ok: false; status: number; message: string };

export function validateReviewInput(rating: unknown, text: unknown) {
  const score = Number(rating);
  const body = typeof text === "string" ? text.trim() : "";
  if (!Number.isInteger(score) || score < 1 || score > 5) return { error: "별점은 1~5점으로 골라 주세요." } as const;
  if (body.length < REVIEW_MIN_LENGTH || body.length > REVIEW_MAX_LENGTH) {
    return { error: `후기는 ${REVIEW_MIN_LENGTH}~${REVIEW_MAX_LENGTH}자로 입력해 주세요.` } as const;
  }
  return { rating: score, body } as const;
}

/** 이용을 마친 내 예약에 후기를 등록한다. 예약 한 건에 후기 한 개. */
export async function createMyReview(userId: number, reservationId: number, rating: number, body: string): Promise<ReviewResult> {
  const pool = getPool();
  const [rows] = await pool.query<(RowDataPacket & { id: number; product_id: number | null; status: string; schedule_date: string | null })[]>(
    `select r.id, coalesce(r.product_id, p.id) as product_id, r.status, r.schedule_date
       from reservations r
       left join products p on r.product_id is null and p.slug = r.product_slug
      where r.id = ? and r.user_id = ?
      limit 1`,
    [reservationId, userId],
  );
  const reservation = rows[0];
  if (!reservation) return { ok: false, status: 404, message: "예약 내역을 찾을 수 없습니다." };
  if (!isCompleted({ status: reservation.status as "confirmed", schedule_date: reservation.schedule_date })) {
    return { ok: false, status: 409, message: "체험을 마친 예약에만 후기를 남길 수 있습니다." };
  }
  if (!reservation.product_id) return { ok: false, status: 409, message: "상품 정보가 없어 후기를 남길 수 없습니다." };

  try {
    const [inserted] = await pool.query<(RowDataPacket & { id: number })[]>(
      `insert into product_reviews (product_id, user_id, reservation_id, rating, body, status)
       values (?, ?, ?, ?, ?, 'pending')
       returning id`,
      [reservation.product_id, userId, reservationId, rating, body],
    );
    const review = await readMyReview(userId, inserted[0].id);
    return review ? { ok: true, review } : { ok: false, status: 500, message: "후기를 저장하지 못했습니다." };
  } catch (error) {
    // lib/db.ts가 Postgres 중복 오류(23505)를 ER_DUP_ENTRY로 바꿔 준다.
    const code = (error as { code?: string }).code;
    if (code === "ER_DUP_ENTRY" || code === "23505") {
      return { ok: false, status: 409, message: "이미 후기를 남긴 예약입니다. 내 리뷰에서 수정해 주세요." };
    }
    throw error;
  }
}

/** 내 후기를 고친다. 고친 후기는 다시 검수를 거친다(숨김 처리된 후기는 고칠 수 없다). */
export async function updateMyReview(userId: number, reviewId: number, rating: number, body: string): Promise<ReviewResult> {
  const pool = getPool();
  const [rows] = await pool.query<(RowDataPacket & { status: string })[]>(
    "select status from product_reviews where id = ? and user_id = ? limit 1",
    [reviewId, userId],
  );
  if (!rows[0]) return { ok: false, status: 404, message: "후기를 찾을 수 없습니다." };
  if (rows[0].status === "hidden") return { ok: false, status: 409, message: "운영팀이 비공개 처리한 후기는 고칠 수 없습니다." };

  await pool.execute("update product_reviews set rating = ?, body = ?, status = 'pending' where id = ? and user_id = ?", [
    rating,
    body,
    reviewId,
    userId,
  ]);
  const review = await readMyReview(userId, reviewId);
  return review ? { ok: true, review } : { ok: false, status: 404, message: "후기를 찾을 수 없습니다." };
}
