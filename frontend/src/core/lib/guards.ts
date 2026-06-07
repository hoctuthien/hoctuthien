import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ADMIN_ROUTES,
  AUTH_ROUTES,
  DASHBOARD_ROUTES,
  DEFAULT_REDIRECT,
  PUBLIC_USER_ROUTES,
  type UserRole,
} from "@/shared/constants/routes";

// ============================================================
// HELPERS
// ============================================================

/** Kiểm tra pathname có khớp với danh sách routes không */
export function matchRoutes(pathname: string, routes: readonly string[]): boolean {
  return routes.some((route) =>
    route === "/"
      ? pathname === "/"
      : pathname === route || pathname.startsWith(`${route}/`)
  );
}

/** Lấy redirect URL mặc định theo role */
export function getDefaultRedirect(role?: string): string {
  return DEFAULT_REDIRECT[(role as UserRole) ?? "mentee"] ?? "/";
}

// ============================================================
// GUARD FUNCTIONS
// Mỗi guard trả về NextResponse nếu cần redirect, hoặc null nếu pass.
// ============================================================

interface GuardContext {
  pathname: string;
  isLoggedIn: boolean;
  userRole?: string;
  nextUrl: NextRequest["nextUrl"];
}

/**
 * Xử lý lỗi Refresh Token → xóa session, đá về login.
 * Trả về response nếu có lỗi, null nếu không.
 */
export function handleRefreshTokenError(
  session: any,
  nextUrl: NextRequest["nextUrl"],
  pathname: string
): NextResponse | null {
  if (session?.error !== "RefreshAccessTokenError") return null;

  const response =
    pathname === "/login"
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/login", nextUrl));

  response.cookies.delete("authjs.session-token");
  response.cookies.delete("__Secure-authjs.session-token");
  response.cookies.delete("next-auth.session-token");
  response.cookies.delete("__Secure-next-auth.session-token");

  return response;
}

/**
 * Chạy tất cả guard rules theo thứ tự.
 * Trả về NextResponse nếu có guard chặn, null nếu pass hết.
 */
export function runGuards(ctx: GuardContext): NextResponse | null {
  const { pathname, isLoggedIn, userRole, nextUrl } = ctx;

  const isAdminRoute = matchRoutes(pathname, ADMIN_ROUTES);
  const isDashboardRoute = matchRoutes(pathname, DASHBOARD_ROUTES);
  const isPublicUserRoute = matchRoutes(pathname, PUBLIC_USER_ROUTES);
  const isAuthRoute = matchRoutes(pathname, AUTH_ROUTES);
  const isProtectedRoute = isDashboardRoute || isAdminRoute;

  // 1. Chưa đăng nhập → không được vào route protected
  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // 2. Mentee/Mentor → không được vào admin
  if (isAdminRoute && userRole !== "admin") {
    return NextResponse.redirect(new URL(getDefaultRedirect(userRole), nextUrl));
  }

  // 3. Admin → không được vào dashboard/public của mentee/mentor
  if ((isDashboardRoute || isPublicUserRoute) && isLoggedIn && userRole === "admin") {
    return NextResponse.redirect(new URL(getDefaultRedirect("admin"), nextUrl));
  }

  // 4. Đã đăng nhập → không cần vào login/register
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL(getDefaultRedirect(userRole), nextUrl));
  }

  return null;
}
