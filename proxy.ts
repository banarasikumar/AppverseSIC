import { NextRequest, NextResponse } from "next/server";

const ADMIN_HOST = "admin.appverse.si";

export function proxy(request: NextRequest) {
  const hostname = (request.headers.get("host") || request.nextUrl.hostname)
    .split(":")[0]
    .toLowerCase();

  if (hostname !== ADMIN_HOST) return NextResponse.next();

  const pathname = request.nextUrl.pathname;
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname === "/favicon.ico" ||
    /\.[a-z0-9]{2,8}$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return NextResponse.next();
  }

  const destination = request.nextUrl.clone();
  destination.pathname = pathname === "/" ? "/admin" : "/admin" + pathname;
  return NextResponse.rewrite(destination);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
