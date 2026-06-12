/**
 * Event constants và payload types cho Payment module.
 *
 * Khi payment được xác nhận thành công (bởi API hoặc Cron),
 * service emit event này để các module khác (User, Notification, ...)
 * lắng nghe và xử lý nghiệp vụ riêng — KHÔNG coupling trực tiếp.
 */

export const PAYMENT_SUCCESS_EVENT = 'payment.success';

export interface PaymentSuccessPayload {
  /** ID của payment record vừa được xác nhận */
  paymentId: string;

  /** ID giao dịch từ TN App (unique) */
  transactionId: string;

  /** ID của user sở hữu payment */
  userId: string;

  /** Loại hình thanh toán (activation, course_booking, donation) */
  paymentMethod?: string;
}
