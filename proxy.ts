import { NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import { verifyAuthToken } from "@/lib/auth/jwt";
import { applySecurityHeaders } from "@/lib/api/security";

const protectedRoutes = ["/dashboard", "/patient", "/doctor", "/appointments"];

export async function proxy(request: NextRequest) {
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route),
  );

  if (!isProtectedRoute) {
    return applySecurityHeaders(NextResponse.next());
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const payload = token ? await verifyAuthToken(token) : null;

  if (!payload) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return applySecurityHeaders(NextResponse.redirect(loginUrl));
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/dashboard/:path*", "/patient/:path*", "/doctor/:path*", "/appointments/:path*"],
};
