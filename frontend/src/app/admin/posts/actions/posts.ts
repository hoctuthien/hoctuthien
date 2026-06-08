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
 * Helper: Lấy access_token từ session và tạo headers
 * Gửi cả Cookie và Authorization: Bearer để tương thích với mọi version của backend JwtStrategy
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  const session = await auth();
  const token = (session as any)?.accessToken;
  if (!token) return {};
  return {
    Cookie: `access_token=${token}`,
    Authorization: `Bearer ${token}`,
  };
}

// ═══════════════════════════════════════════════
// POSTS
// ═══════════════════════════════════════════════

/**
 * Lấy danh sách bài viết → trả về any[]
 * Hỗ trợ các tham số lọc: categoryId, tagId, search
 */
export async function getPostsAction(query?: { categoryId?: string, tagId?: string, search?: string }): Promise<any[]> {
  try {
    const headers = await getAuthHeaders();
    
    // Xây dựng URL với query parameters
    const url = new URL(`${BACKEND_URL.replace(/\/$/, "")}/api/v1/posts`);
    if (query?.categoryId) url.searchParams.append("categoryId", query.categoryId);
    if (query?.tagId) url.searchParams.append("tagId", query.tagId);
    if (query?.search) url.searchParams.append("search", query.search);

    const res = await fetch(url.toString(), {
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
  const headers = await getAuthHeaders();
  const url = `${BACKEND_URL.replace(/\/$/, "")}/api/v1/posts/${id}`;

  try {
    console.log(`[getPostAction] Fetching post from: ${url}`);
    const res = await fetch(url, {
      cache: "no-store",
      headers,
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "N/A");
      console.error(`[getPostAction] Failed to fetch post. URL: ${url}, Status: ${res.status} (${res.statusText}), Response: ${errorText}`);
      throw new Error(`Failed to fetch post. Status: ${res.status}`);
    }

    const data = await res.json();
    return extractOne(data);
  } catch (error: any) {
    console.error(`[getPostAction] Error in getPostAction for id/slug "${id}":`, error);
    throw error;
  }
}

/**
 * Tạo bài viết mới → trả về post object
 */
export async function createPostAction(data: any): Promise<any> {
  const headers = await getAuthHeaders();
  if (Object.keys(headers).length === 0) throw new Error("Unauthorized");

  const res = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/api/v1/posts`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      ...headers,
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
  const headers = await getAuthHeaders();
  if (Object.keys(headers).length === 0) throw new Error("Unauthorized");

  const res = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/api/v1/posts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      ...headers,
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
  const headers = await getAuthHeaders();
  if (Object.keys(headers).length === 0) throw new Error("Unauthorized");

  const res = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/api/v1/posts/${id}`, {
    method: "DELETE",
    headers,
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
    const headers = await getAuthHeaders();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/api/v1/categories`, {
      cache: "no-store",
      signal: controller.signal,
      headers,
    });

    clearTimeout(timeout);

    if (!res.ok) return [];
    const data = extractList(await res.json());
    console.log("\x1b[36m[getCategoriesAction] Server Response Data:\x1b[0m", JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

/**
 * Lấy danh sách Categories có phân trang
 */
export async function getCategoriesPaginatedAction(
  page = 1,
  limit = 10,
  search?: string,
): Promise<{ data: any[]; meta: any }> {
  try {
    const headers = await getAuthHeaders();
    let url = `${BACKEND_URL.replace(/\/$/, "")}/api/v1/categories?page=${page}&limit=${limit}`;
    if (search) {
      url += `&name=${encodeURIComponent(search)}`;
    }

    const res = await fetch(url, {
      cache: "no-store",
      headers,
    });

    if (!res.ok) return { data: [], meta: { total: 0, page, limit, totalPages: 0 } };
    const result = await res.json();
    
    if (result && Array.isArray(result.data) && result.meta) {
      console.log("\x1b[36m[getCategoriesPaginatedAction] Server Response:\x1b[0m", JSON.stringify(result, null, 2));
      return {
        data: result.data,
        meta: result.meta,
      };
    }

    return { data: [], meta: { total: 0, page, limit, totalPages: 0 } };
  } catch (error) {
    console.error("Failed to fetch paginated categories:", error);
    return { data: [], meta: { total: 0, page, limit, totalPages: 0 } };
  }
}

/**
 * Tạo Category mới → trả về category object
 */
export async function createCategoryAction(name: string, slug?: string, description?: string): Promise<any> {
  const headers = await getAuthHeaders();
  if (Object.keys(headers).length === 0) throw new Error("Unauthorized");

  const finalSlug = slug || name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") + "-" + Date.now();

  const payload: any = { name, slug: finalSlug };
  if (description) {
    payload.metadata = { description };
  }

  const res = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/api/v1/categories`, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to create category");
  }

  return extractOne(await res.json());
}

/**
 * Cập nhật Category
 */
export async function updateCategoryAction(
  id: string,
  name: string,
  slug?: string,
  description?: string,
): Promise<any> {
  const headers = await getAuthHeaders();
  if (Object.keys(headers).length === 0) throw new Error("Unauthorized");

  const payload: any = { name };
  if (slug) payload.slug = slug;
  if (description) {
    payload.metadata = { description };
  }

  const res = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/api/v1/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to update category");
  }

  return extractOne(await res.json());
}

/**
 * Xóa Category
 */
export async function deleteCategoryAction(id: string): Promise<any> {
  const headers = await getAuthHeaders();
  if (Object.keys(headers).length === 0) throw new Error("Unauthorized");

  const res = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/api/v1/categories/${id}`, {
    method: "DELETE",
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to delete category");
  }

  return { success: true };
}

// ═══════════════════════════════════════════════
// TAGS
// ═══════════════════════════════════════════════

/**
 * Lấy danh sách Tags → trả về any[] (đã extract)
 */
export async function getTagsAction(): Promise<any[]> {
  try {
    const headers = await getAuthHeaders();

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
  const headers = await getAuthHeaders();
  if (Object.keys(headers).length === 0) throw new Error("Unauthorized");

  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") + "-" + Date.now();

  const res = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/api/v1/tags`, {
    method: "POST",
    body: JSON.stringify({ name, slug }),
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });


  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to create tag");
  }

  return extractOne(await res.json());
}
