/**
 * Tên sự kiện phát ra sau khi cron job xác nhận một giao dịch thanh toán thành công.
 * Các module nghiệp vụ (User, Course...) lắng nghe event này để xử lý logic riêng.
 */
export const PAYMENT_SUCCESS_EVENT = 'payment.success';

/**
 * Payload đính kèm theo event PAYMENT_SUCCESS_EVENT.
 * Chỉ chứa các ID cần thiết — không leak domain object của Payment ra bên ngoài.
 */
export interface PaymentSuccessPayload {
  paymentId: string;
  transactionId: string;
  userId: string;
}
