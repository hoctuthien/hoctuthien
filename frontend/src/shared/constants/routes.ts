// ============================================================
// CẤU HÌNH ROUTE TẬP TRUNG
// Dùng chung cho middleware, sidebar, navbar, guard logic...
// Khi thêm route mới, chỉ cần sửa file này.
// ============================================================

export type UserRole = "admin" | "mentor" | "mentee";

/** Routes chỉ admin mới được truy cập */
export const ADMIN_ROUTES = ["/admin"] as const;

/** Routes chỉ mentee/mentor mới được truy cập (cần đăng nhập) */
export const DASHBOARD_ROUTES = [
  "/profile",
  "/dashboard",
  "/calendar",
  "/my-courses",
  "/mentor",
  "/activation",
] as const;

/** Routes công khai cho user, nhưng admin không được vào */
export const PUBLIC_USER_ROUTES = ["/", "/courses", "/posts", "/homepage", "/mentorship"] as const;

/** Routes xác thực (login, register) */
export const AUTH_ROUTES = ["/login", "/register"] as const;

/** Trang mặc định theo role sau khi đăng nhập */
export const DEFAULT_REDIRECT: Record<UserRole, string> = {
  admin: "/admin/dashboard",
  mentor: "/",
  mentee: "/",
};
