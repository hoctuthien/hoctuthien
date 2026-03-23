/**
 * Shared Constants: Status & Error Codes
 * PRIORITY: CAO (High)
 * Mục đích: Một nguồn duy nhất cho các mã lỗi (Error Codes) và trạng thái (Status).
 * Tránh việc lệch một chữ gây ra bug (ví dụ: 'PENDING' vs 'pending').
 */
export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED'
}
