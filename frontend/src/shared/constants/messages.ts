export const MESSAGES = {
  ERROR: {
    DEFAULT: 'Đã có lỗi xảy ra. Vui lòng thử lại sau.',
    NETWORK: 'Không thể kết nối đến máy chủ.',
    UNAUTHORIZED: 'Bạn không có quyền truy cập vào tài nguyên này.',
    FORBIDDEN: 'Phiên làm việc đã hết hạn.',
    VALIDATION: 'Dữ liệu không hợp lệ.',
  },
  SUCCESS: {
    DEFAULT: 'Thao tác thành công.',
    CREATED: 'Đã tạo thành công.',
    UPDATED: 'Đã cập nhật thành công.',
    DELETED: 'Đã xóa thành công.',
  },
} as const;
