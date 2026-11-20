import { NextResponse, type NextRequest } from "next/server";
import { hasDatabase, verifySessionToken } from "@/lib/session-token";

const PROTECTED_PATHS = ["/me", "/checkout", "/b2b/quote"];
const ADMIN_LOGIN_PAGE = "/admin/login";
const ADMIN_LOGIN_API = "/api/admin/auth/login";

function matches(pathname: string, base: string) {
  return pathname === base || pathname.startsWith(`${base}/`);
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const session = verifySessionToken(request.cookies.get("session")?.value);

  // 관리자 화면과 관리자 API: DB가 연결된 환경에서는 관리자 세션이 있어야 한다.
  // (관리자 화면은 실제 회원·예약·견적 데이터를 서버에서 읽어 그린다.)
  const isAdminPage = matches(pathname, "/admin") && pathname !== ADMIN_LOGIN_PAGE;
  const isAdminApi = matches(pathname, "/api/admin") && pathname !== ADMIN_LOGIN_API;

  if (hasDatabase() && (isAdminPage || isAdminApi) && session?.role !== "admin") {
    if (isAdminApi) {
      return NextResponse.json({ ok: false, message: "관리자 로그인이 필요합니다." }, { status: 401 });
    }
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = ADMIN_LOGIN_PAGE;
    loginUrl.search = "";
    loginUrl.searchParams.set("redirect", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  // 회원 전용 화면: DB가 연결된 환경이거나 샘플 모드를 끈 환경에서는 로그인이 있어야 한다.
  // (DB가 연결됐는데 NEXT_PUBLIC_USE_MOCK이 빠져 있어도 마이페이지가 로그인 없이 열리지 않게 한다.)
  if (!hasDatabase() && process.env.NEXT_PUBLIC_USE_MOCK !== "false") {
    return NextResponse.next();
  }

  const isProtected = PROTECTED_PATHS.some((path) => matches(pathname, path));
  if (!isProtected || session) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/auth/login";
  loginUrl.searchParams.set("redirect", `${pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/me/:path*", "/checkout/:path*", "/b2b/quote/:path*", "/admin/:path*", "/api/admin/:path*"],
};
