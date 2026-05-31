import { operations } from '../types/api.generated';
import { httpClient } from '../api/client';

export type QrResponseData = NonNullable<
  operations['PaymentController_generateActivationQr']['responses'][200]['content']['application/json']['data']
>[number];

export type VerifyResponseData = NonNullable<
  operations['PaymentController_verifyActivationPayment']['responses'][200]['content']['application/json']['data']
>[number];

export type PaymentDetails = any;

export const paymentGateway = {

  /**
   * Tạo QR code kích hoạt hoặc lấy lại mã QR cũ còn hạn
   */
  async generateActivationQr(): Promise<QrResponseData> {
    console.log('[paymentGateway] Executing generateActivationQr() calling POST /v1/payments/activation/generate-qr');
    const response = await httpClient.post<{ data: QrResponseData[] }>('/v1/payments/activation/generate-qr', {});
    return response.data[0];
  },

  /**
   * Xác minh giao dịch thanh toán kích hoạt
   */
  async verifyActivationPayment(paymentId: string): Promise<VerifyResponseData> {
    console.log(`[paymentGateway] Executing verifyActivationPayment() calling POST /v1/payments/activation/verify for paymentId=${paymentId}`);
    const response = await httpClient.post<{ data: VerifyResponseData[] }>('/v1/payments/activation/verify', {
      paymentId,
    });
    return response.data[0];
  },

  /**
   * Lấy thông tin chi tiết một payment record
   */
  async getPaymentDetails(id: string): Promise<PaymentDetails> {
    console.log(`[paymentGateway] Executing getPaymentDetails() calling GET /v1/payments/${id}`);
    const response = await httpClient.get<{ data: PaymentDetails[] }>(`/v1/payments/${id}`);
    return response.data[0];
  },
};
