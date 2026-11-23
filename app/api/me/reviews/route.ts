import { NextResponse } from "next/server";
import { hasDatabaseConfig } from "@/lib/db";
import { parseReservationId } from "@/lib/me/reservations";
import { createMyReview, listMyReviews, parseReviewId, updateMyReview, validateReviewInput } from "@/lib/me/reviews";
import { reviewHistory } from "@/lib/mypage-data";
import { getSessionUser } from "@/lib/session";
import type { Review, ReviewPayload } from "@/types/api";

export const runtime = "nodejs";

function fail(message: string, status: number) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function GET(request: Request) {
  if (!hasDatabaseConfig()) return NextResponse.json(reviewHistory);

  const user = await getSessionUser(request);
  if (!user) return fail("로그인이 필요합니다.", 401);
  return NextResponse.json(await listMyReviews(user.id));
}

/** DB가 없는 샘플 모드: 저장하지 않고 화면 확인용 응답만 돌려준다. */
function sampleReview(payload: ReviewPayload) {
  const review: Review = {
    title: payload.reservationId ?? "로컬체험 후기",
    status: "작성 완료",
    statusTone: "done",
    date: "방금 작성",
    rating: payload.rating,
    text: payload.text.trim(),
    href: "/me/reviews",
  };
  return NextResponse.json(review, { status: payload.reviewId ? 200 : 201 });
}

async function upsertReview(request: Request, mode: "create" | "update") {
  const payload = ((await request.json().catch(() => ({}))) ?? {}) as ReviewPayload;
  const input = validateReviewInput(payload.rating, payload.text);
  if ("error" in input) return fail(input.error ?? "후기를 다시 확인해 주세요.", 400);

  if (!hasDatabaseConfig()) return sampleReview(payload);

  const user = await getSessionUser(request);
  if (!user) return fail("로그인이 필요합니다.", 401);

  if (mode === "update" || payload.reviewId) {
    const reviewId = parseReviewId(payload.reviewId);
    if (!reviewId) return fail("고칠 후기를 찾을 수 없습니다.", 404);
    const result = await updateMyReview(user.id, reviewId, input.rating, input.body);
    return result.ok ? NextResponse.json(result.review) : fail(result.message, result.status);
  }

  const reservationId = parseReservationId(String(payload.reservationId ?? ""));
  if (!reservationId) return fail("후기를 남길 예약을 찾을 수 없습니다.", 404);
  const result = await createMyReview(user.id, reservationId, input.rating, input.body);
  return result.ok ? NextResponse.json(result.review, { status: 201 }) : fail(result.message, result.status);
}

export function POST(request: Request) {
  return upsertReview(request, "create");
}

export function PATCH(request: Request) {
  return upsertReview(request, "update");
}
