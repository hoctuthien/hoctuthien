/**
 * TN App trả timestamp theo giờ VN (UTC+7) không có timezone info → cần xử lý thủ công.
 * Chuyển Date object sang chuỗi YYYY-MM-DD theo giờ Việt Nam.
 */
export function toVNDateString(date: Date): string {
  const vnDate = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  return vnDate.toISOString().split('T')[0];
}

/**
 * Parse chuỗi timestamp từ TN App (không có timezone) sang Date object.
 * Ví dụ: "2024-05-09 15:30:00" → Date với offset +07:00
 */
export function parseVNTime(vnTimeStr: string): Date {
  return new Date(vnTimeStr + '+07:00');
}
