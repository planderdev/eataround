import "server-only";
import { hasDatabaseConfig } from "@/lib/db";
import { NextResponse } from "next/server";
import { getAdminSessionUser } from "@/lib/session";

/** DB에 쓰는 관리자 API에서 관리자 세션을 다시 확인한다. 통과하면 null을 돌려준다. */
export async function requireAdmin(request: Request) {
  if (await getAdminSessionUser(request)) return null;
  return NextResponse.json({ ok: false, message: "관리자 권한이 필요합니다." }, { status: 403 });
}

/**
 * DB가 연결된 환경에서만 관리자 권한을 DB에서 다시 확인한다.
 * proxy.ts는 쿠키에 적힌 역할만 보므로, 권한이 내려간 계정도 쿠키가 살아 있는 동안 목록을 볼 수 있었다.
 * DB가 없는 샘플 모드는 로그인 없이 화면을 보는 방식이라 그대로 둔다.
 */
export async function requireAdminWhenConnected(request: Request) {
  if (!hasDatabaseConfig()) return null;
  return requireAdmin(request);
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
