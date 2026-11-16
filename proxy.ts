import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/session-token";

const PROTECTED_PATHS = ["/me", "/checkout", "/b2b/quote"];

export function proxy(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_USE_MOCK !== "false") {
    return NextResponse.next();
  }

  const pathname = request.nextUrl.pathname;
  const isProtected = PROTECTED_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  if (!isProtected) {
    return NextResponse.next();
  }

  // 쿠키가 있는지만 보지 않고 서명과 만료까지 확인한다.
  if (verifySessionToken(request.cookies.get("session")?.value)) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/auth/login";
  loginUrl.searchParams.set("redirect", `${pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/me/:path*", "/checkout/:path*", "/b2b/quote/:path*"],
};
