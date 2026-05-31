"use server";

import { auth } from "@/auth";
import { operations } from "@/core/types/api.generated";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5050";

export type QrResponseData = NonNullable<
  operations['PaymentController_generateActivationQr']['responses'][200]['content']['application/json']['data']
>[number];

export type VerifyResponseData = NonNullable<
  operations['PaymentController_verifyActivationPayment']['responses'][200]['content']['application/json']['data']
>[number];

/**
 * Server Action: Tạo QR code kích hoạt hoặc lấy mã QR còn hạn
 */
export async function generateQrAction(): Promise<QrResponseData> {
  console.log('[Server Action] generateQrAction() called');
  const session = await auth();
  const token = (session as any)?.accessToken;

  if (!token) {
    throw new Error("Unauthorized");
  }

  const res = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/api/v1/payments/activation/generate-qr`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store', // Always fetch fresh
  });

  if (!res.ok) {
    const errorText = await res.text();
    let errorJson = {};
    try {
      errorJson = JSON.parse(errorText);
    } catch (e) {}
    const backendMessage = (errorJson as any)?.error?.message || (errorJson as any)?.message;
    throw new Error(backendMessage || `Failed to generate QR (Status ${res.status})`);
  }

  const result = await res.json();
  return (result.data?.[0] || result) as QrResponseData;
}

/**
 * Server Action: Xác minh thanh toán kích hoạt
 */
export async function verifyPaymentAction(paymentId: string): Promise<VerifyResponseData> {
  console.log(`[Server Action] verifyPaymentAction() called for paymentId=${paymentId}`);
  const session = await auth();
  const token = (session as any)?.accessToken;

  if (!token) {
    throw new Error("Unauthorized");
  }

  const res = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/api/v1/payments/activation/verify`, {
    method: "POST",
    body: JSON.stringify({ paymentId }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    let errorJson = {};
    try {
      errorJson = JSON.parse(errorText);
    } catch (e) {}
    const backendMessage = (errorJson as any)?.error?.message || (errorJson as any)?.message;
    throw new Error(backendMessage || `Failed to verify payment (Status ${res.status})`);
  }

  const result = await res.json();
  return (result.data?.[0] || result) as VerifyResponseData;
}
