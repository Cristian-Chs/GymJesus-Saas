import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware — Role-based route protection
 *
 * Reads the `session` cookie (set by AuthContext after Google sign-in)
 * to decide if the user can access /admin or /dashboard routes.
 *
 * Cookie value is the user's Firestore role: "admin" | "client"
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = request.cookies.get("session")?.value;

  // ── /admin/** — only admins ─────────────────────────
  if (pathname.startsWith("/admin")) {
    if (role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = role ? "/dashboard" : "/login";
      return NextResponse.redirect(url);
    }
  }

  // ── /dashboard/** — any authenticated user ──────────
  if (pathname.startsWith("/dashboard")) {
    if (!role) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  // ── /login — redirect if already logged in ──────────
  if (pathname === "/login" && role) {
    const url = request.nextUrl.clone();
    url.pathname = role === "admin" ? "/admin" : "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/login"],
};
