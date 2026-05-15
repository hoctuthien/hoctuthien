"use server";

import { auth } from "@/auth";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5050";

export async function uploadFileAction(formData: FormData, folder?: string) {
  const session = await auth();
  const token = (session as any)?.accessToken;

  if (!token) {
    throw new Error("Unauthorized");
  }

  if (folder) {
    formData.append("folder", folder);
  }

  const res = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/api/v1/media/upload`, {
    method: "POST",
    body: formData,
    headers: {
      Cookie: `access_token=${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to upload file");
  }

  const result = await res.json();
  
  // Backend bọc response qua ResponseTransformInterceptor
  // Cấu trúc: { data: [{ success: true, files: [{ url: '...' }] }] }
  const uploadResult = result.data?.[0] || result;
  return uploadResult.files?.[0]?.url || uploadResult.url;
}
