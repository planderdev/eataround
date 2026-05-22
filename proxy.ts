import { NextResponse, type NextRequest } from "next/server";

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

  const session = request.cookies.get("session")?.value;
  if (session) {
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
