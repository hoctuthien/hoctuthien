import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session;
  
  // 1. Định nghĩa các nhóm route
  const isProtectedRoute = nextUrl.pathname.startsWith("/profile") || nextUrl.pathname.startsWith("/dashboard");
  const isAuthRoute = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/register");

  // 2. Xử lý lỗi Refresh Token: Đá về trang login và xóa sạch session
  if (session?.error === "RefreshAccessTokenError") {
    // Ngăn chặn redirect loop nếu user đã văng ra trang login
    const response = nextUrl.pathname === "/login" 
      ? NextResponse.next() 
      : NextResponse.redirect(new URL("/login", nextUrl));

    response.cookies.delete("authjs.session-token");
    response.cookies.delete("__Secure-authjs.session-token");
    response.cookies.delete("next-auth.session-token");
    response.cookies.delete("__Secure-next-auth.session-token");
    
    return response;
  }

  // 3. Logic điều hướng
  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
