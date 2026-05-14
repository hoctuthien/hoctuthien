/**
 * Hàm tiện ích để đọc cookie từ document.cookie
 * @param name Tên cookie cần lấy
 * @returns Giá trị cookie hoặc null nếu không tìm thấy
 */
export const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};
