import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ ok: true, message: "로그아웃되었습니다." });
  response.cookies.set("session", "", { path: "/", maxAge: 0 });
  return response;
}
