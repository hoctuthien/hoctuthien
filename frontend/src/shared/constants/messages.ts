export const MESSAGES = {
  ERROR: {
    DEFAULT: 'Đã có lỗi xảy ra. Vui lòng thử lại sau.',
    NETWORK: 'Không thể kết nối đến máy chủ.',
    UNAUTHORIZED: 'Bạn không có quyền truy cập vào tài nguyên này.',
    FORBIDDEN: 'Phiên làm việc đã hết hạn.',
    VALIDATION: 'Dữ liệu không hợp lệ.',
    AUTH: {
      INVALID_CREDENTIALS: 'Email hoặc mật khẩu không chính xác. Vui lòng thử lại.',
      EMAIL_REQUIRED: 'Vui lòng nhập địa chỉ email.',
      INVALID_EMAIL: 'Địa chỉ email không đúng định dạng.',
      PASSWORD_REQUIRED: 'Vui lòng nhập mật khẩu.',
      PASSWORD_MIN_LENGTH: 'Mật khẩu phải có ít nhất 8 ký tự.',
      FULL_NAME_REQUIRED: 'Vui lòng nhập họ và tên của bạn.',
      PASSWORD_CONFIRM_REQUIRED: 'Vui lòng xác nhận lại mật khẩu.',
      PASSWORDS_MUST_MATCH: 'Mật khẩu xác nhận không khớp.',
      GENERAL: 'Đã có lỗi xảy ra. Vui lòng thử lại sau.'
    }
  },
  SUCCESS: {
    DEFAULT: 'Thao tác thành công.',
    CREATED: 'Đã tạo thành công.',
    UPDATED: 'Đã cập nhật thành công.',
    DELETED: 'Đã xóa thành công.',
  },
} as const;
