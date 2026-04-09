/**
 * src/middleware.ts — Edge Middleware for Route Protection
 * ─────────────────────────────────────────────────────────
 * Runs on every request BEFORE the page renders.
 *
 * Strategy:
 *  1. Public paths (/login) → always allow.
 *  2. All other paths → check for `resort_session` cookie.
 *     If absent → redirect to /login.
 *  3. Admin-only paths (/admin/**) → check role in cookie.
 *     If role is "staff" → redirect to dashboard root.
 *
 * NOTE: The `resort_session` cookie is set by src/lib/auth.tsx
 * when the user logs in (alongside localStorage for SSR safety).
 */

import { NextRequest, NextResponse } from "next/server";

// Paths that don't require authentication
const PUBLIC_PATHS = ["/login"];

// Paths that require admin or manager role
const ADMIN_PATHS = ["/admin"];

// Paths accessible to manager and above (not plain staff)
const MANAGER_PATHS = ["/reports"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Always allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // 2. Check for session cookie
  const sessionCookie = request.cookies.get("resort_session");

  if (!sessionCookie?.value) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Parse role from cookie for path-level RBAC
  try {
    const session = JSON.parse(
      decodeURIComponent(sessionCookie.value)
    ) as { role?: string; id?: string };

    const role = session.role ?? "staff";

    // Admin-only paths — block plain staff and redirect to dashboard
    if (ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
      if (role === "staff") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    // Manager+ paths — block plain staff
    if (MANAGER_PATHS.some((p) => pathname.startsWith(p))) {
      if (role === "staff") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  } catch {
    // Malformed cookie → force re-login
    const res = NextResponse.redirect(new URL("/login", request.url));
    res.cookies.delete("resort_session");
    return res;
  }

  return NextResponse.next();
}

export const config = {
  // Run on all routes except Next.js internals and static assets
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|images).*)",
  ],
};
