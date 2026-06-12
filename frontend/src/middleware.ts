import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { handleRefreshTokenError, runGuards } from "@/core/lib/guards";

export async function middleware(req: NextRequest) {
  const session = await auth();
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  // Xử lý lỗi Refresh Token
  const refreshError = handleRefreshTokenError(session, nextUrl, pathname);
  if (refreshError) return refreshError;

  // Chạy tất cả guard rules
  const guardResponse = runGuards({
    pathname,
    isLoggedIn: !!session,
    userRole: (session?.user as any)?.role,
    nextUrl,
  });
  if (guardResponse) return guardResponse;

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
