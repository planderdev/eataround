import "server-only";
import { NextResponse } from "next/server";
import { getAdminSessionUser } from "@/lib/session";

/** DB에 쓰는 관리자 API에서 관리자 세션을 다시 확인한다. 통과하면 null을 돌려준다. */
export async function requireAdmin(request: Request) {
  if (await getAdminSessionUser(request)) return null;
  return NextResponse.json({ ok: false, message: "관리자 권한이 필요합니다." }, { status: 403 });
}

/** URL의 id 조각을 DB 행 id(양의 정수)로 바꾼다. 아니면 null. */
export function parseRowId(raw: string) {
  const value = decodeURIComponent(raw);
  if (!/^[1-9]\d{0,15}$/.test(value)) return null;
  return Number(value);
}

export function adminError(message: string, status: number) {
  return NextResponse.json({ ok: false, message }, { status });
}

export function trimmed(value: unknown, maxLength: number) {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text ? text.slice(0, maxLength) : null;
}
