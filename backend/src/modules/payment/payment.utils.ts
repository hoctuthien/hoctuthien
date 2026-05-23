/**
 * Utility functions dùng chung trong Payment module.
 * Tách ra khỏi tn-app.service.ts để tránh circular dependency
 * và cho phép cả PaymentService lẫn PaymentVerificationService sử dụng.
 */

/**
 * Chuyển Date thành chuỗi ngày VN (UTC+7) dạng YYYY-MM-DD.
 * TN App API yêu cầu fromDate/toDate theo giờ VN, không có timezone info.
 */
export function toVNDateString(date: Date): string {
  const vnDate = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  return vnDate.toISOString().split('T')[0];
}

/**
 * Parse chuỗi thời gian VN (UTC+7) từ TN App thành Date object.
 * TN App trả transactionTime dạng "2026-05-19 14:30:00" — không có timezone.
 * Ta gắn +07:00 vào để JS parse đúng thành UTC.
 */
export function parseVNTime(vnTimeStr: string): Date {
  return new Date(vnTimeStr + '+07:00');
}
