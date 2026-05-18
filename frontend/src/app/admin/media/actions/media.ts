"use server";

import { auth } from "@/auth";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5050";

async function getAuthHeaders(): Promise<Record<string, string>> {
  const session = await auth();
  const token = (session as any)?.accessToken;
  if (!token) return {};
  return {
    Cookie: `access_token=${token}`,
    Authorization: `Bearer ${token}`,
  };
}

export async function getMediaAction(): Promise<any[]> {
  try {
    const headers = await getAuthHeaders();
    if (Object.keys(headers).length === 0) return [];

    const res = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/api/v1/media`, {
      cache: "no-store",
      headers,
    });

    if (!res.ok) return [];
    const result = await res.json();
    // NestJS ResponseTransformInterceptor wraps data as { data: [...] }
    const data = result.data || [];
    console.log("\x1b[35m[getMediaAction] Server Response Data:\x1b[0m", JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error("Failed to fetch media library:", error);
    return [];
  }
}

export async function deleteMediaAction(id: string): Promise<any> {
  try {
    const headers = await getAuthHeaders();
    if (Object.keys(headers).length === 0) throw new Error("Unauthorized");

    const res = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/api/v1/media/${id}`, {
      method: "DELETE",
      headers,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Failed to delete media record");
    }

    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete media:", error);
    throw error;
  }
}
