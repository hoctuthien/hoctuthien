"use server";

import { auth } from "@/auth";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5050";

/**
 * Helper: Trích xuất mảng dữ liệu từ response của backend
 * Backend bọc qua ResponseTransformInterceptor:
 * - Array trực tiếp: { data: [...items], meta: {} }
 * - Service tự wrap pagination: { data: [{ data: [...], meta: {} }] }
 * - Single object: { data: [item] }
 */
function extractList(json: any): any[] {
  const d = json?.data;
  if (!d) return [];
  // Case: data[0] has its own 'data' array (double-wrapped pagination từ CategoryService/TagService)
  if (Array.isArray(d) && d.length === 1 && Array.isArray(d[0]?.data)) {
    return d[0].data;
  }
  if (Array.isArray(d)) return d;
  return [];
}

function extractOne(json: any): any {
  const d = json?.data;
  if (Array.isArray(d) && d.length > 0) return d[0];
  return d || json;
}

/**
 * Helper: Lấy access_token từ session và tạo Cookie header
 * Backend sử dụng cookie-based auth (đọc từ cookie 'access_token')
 */
async function getAuthCookie(): Promise<string | null> {
  const session = await auth();
  const token = (session as any)?.accessToken;
  return token ? `access_token=${token}` : null;
}

// ═══════════════════════════════════════════════
// POSTS
// ═══════════════════════════════════════════════

/**
 * Lấy danh sách bài viết → trả về any[]
 */
export async function getPostsAction(): Promise<any[]> {
  try {
    const cookie = await getAuthCookie();
    const headers: Record<string, string> = {};
    if (cookie) headers["Cookie"] = cookie;

    const res = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/api/v1/posts`, {
      cache: "no-store",
      headers,
    });

    if (!res.ok) return [];
    return extractList(await res.json());
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    return [];
  }
}

/**
 * Lấy chi tiết một bài viết → trả về single post object
 */
export async function getPostAction(id: string): Promise<any> {
  const cookie = await getAuthCookie();
  const headers: Record<string, string> = {};
  if (cookie) headers["Cookie"] = cookie;

  const res = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/api/v1/posts/${id}`, {
    cache: "no-store",
    headers,
  });

  if (!res.ok) throw new Error("Failed to fetch post");
  return extractOne(await res.json());
}

/**
 * Tạo bài viết mới → trả về post object
 */
export async function createPostAction(data: any): Promise<any> {
  const cookie = await getAuthCookie();
  if (!cookie) throw new Error("Unauthorized");

  const res = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/api/v1/posts`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to create post");
  }

  return extractOne(await res.json());
}

/**
 * Cập nhật bài viết → trả về updated post
 */
export async function updatePostAction(id: string, data: any): Promise<any> {
  const cookie = await getAuthCookie();
  if (!cookie) throw new Error("Unauthorized");

  const res = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/api/v1/posts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to update post");
  }

  return extractOne(await res.json());
}

/**
 * Xóa bài viết
 */
export async function deletePostAction(id: string): Promise<boolean> {
  const cookie = await getAuthCookie();
  if (!cookie) throw new Error("Unauthorized");

  const res = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/api/v1/posts/${id}`, {
    method: "DELETE",
    headers: {
      Cookie: cookie,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to delete post");
  }

  return true;
}

// ═══════════════════════════════════════════════
// CATEGORIES
// ═══════════════════════════════════════════════

/**
 * Lấy danh sách Categories → trả về any[] (đã extract)
 */
export async function getCategoriesAction(): Promise<any[]> {
  try {
    const cookie = await getAuthCookie();
    const headers: Record<string, string> = {};
    if (cookie) headers["Cookie"] = cookie;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/api/v1/categories`, {
      cache: "no-store",
      signal: controller.signal,
      headers,
    });

    clearTimeout(timeout);

    if (!res.ok) return [];
    return extractList(await res.json());
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

/**
 * Tạo Category mới → trả về category object
 */
export async function createCategoryAction(name: string): Promise<any> {
  const cookie = await getAuthCookie();
  if (!cookie) throw new Error("Unauthorized");

  const res = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/api/v1/categories`, {
    method: "POST",
    body: JSON.stringify({ name }),
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to create category");
  }

  return extractOne(await res.json());
}

// ═══════════════════════════════════════════════
// TAGS
// ═══════════════════════════════════════════════

/**
 * Lấy danh sách Tags → trả về any[] (đã extract)
 */
export async function getTagsAction(): Promise<any[]> {
  try {
    const cookie = await getAuthCookie();
    const headers: Record<string, string> = {};
    if (cookie) headers["Cookie"] = cookie;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/api/v1/tags`, {
      cache: "no-store",
      signal: controller.signal,
      headers,
    });

    clearTimeout(timeout);

    if (!res.ok) return [];
    return extractList(await res.json());
  } catch (error) {
    console.error("Failed to fetch tags:", error);
    return [];
  }
}

/**
 * Tạo Tag mới → trả về tag object
 */
export async function createTagAction(name: string): Promise<any> {
  const cookie = await getAuthCookie();
  if (!cookie) throw new Error("Unauthorized");

  const res = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/api/v1/tags`, {
    method: "POST",
    body: JSON.stringify({ name }),
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to create tag");
  }

  return extractOne(await res.json());
}
