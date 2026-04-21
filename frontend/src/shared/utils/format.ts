/**
 * Format number to currency string (VND)
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

/**
 * Format date to string (DD/MM/YYYY)
 */
export const formatDate = (date: Date | string | number): string => {
  const d = new Date(date);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
};

/**
 * Format date to verbose string (DD Month, YYYY)
 */
export const formatFullDate = (date: Date | string | number): string => {
  const d = new Date(date);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(d);
};
