export const MESSAGES = {
  ERROR: {
    DEFAULT: 'Đã có lỗi xảy ra. Vui lòng thử lại sau.',
    NETWORK: 'Không thể kết nối đến máy chủ.',
    UNAUTHORIZED: 'Bạn không có quyền truy cập vào tài nguyên này.',
    FORBIDDEN: 'Phiên làm việc đã hết hạn.',
    VALIDATION: 'Dữ liệu không hợp lệ.',
    AUTH: {
      INVALID_CREDENTIALS: 'Invalid email or password. Please try again.',
      EMAIL_REQUIRED: 'Email is required.',
      INVALID_EMAIL: 'Please enter a valid email address.',
      PASSWORD_REQUIRED: 'Password is required.',
      PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters.',
      GENERAL: 'Something went wrong. Please try again later.'
    }
  },
  SUCCESS: {
    DEFAULT: 'Thao tác thành công.',
    CREATED: 'Đã tạo thành công.',
    UPDATED: 'Đã cập nhật thành công.',
    DELETED: 'Đã xóa thành công.',
  },
} as const;
