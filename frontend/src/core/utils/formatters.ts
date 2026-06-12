/**
 * Format a number as Vietnamese Dong (VND) currency string.
 * Uses Intl.NumberFormat for locale-aware formatting.
 *
 * @example
 * formatVND(150000) // "150.000 ₫"
 */
export function formatVND(value: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
}
