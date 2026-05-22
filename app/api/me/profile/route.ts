import { NextResponse } from "next/server";
import { myProfile } from "@/lib/mypage-data";
import type { ProfilePayload } from "@/types/api";

export async function GET() {
  return NextResponse.json({ ...myProfile, marketing: true });
}

export async function PATCH(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as ProfilePayload;
  const { password: _password, ...profilePayload } = payload;

  return NextResponse.json({
    ...myProfile,
    ...profilePayload,
    marketing: profilePayload.marketing ?? true,
  });
}
