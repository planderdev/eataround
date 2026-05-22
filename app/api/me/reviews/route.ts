import { NextResponse } from "next/server";
import { reviewHistory } from "@/lib/mypage-data";
import type { Review, ReviewPayload } from "@/types/api";

export async function GET() {
  return NextResponse.json(reviewHistory);
}

async function upsertReview(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as ReviewPayload;

  if (!payload.text || payload.text.trim().length < 20 || !payload.rating) {
    return NextResponse.json({ ok: false, message: "별점과 20자 이상의 후기를 입력해 주세요." }, { status: 400 });
  }

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

export async function POST(request: Request) {
  return upsertReview(request);
}

export async function PATCH(request: Request) {
  return upsertReview(request);
}
