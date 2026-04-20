export const ERROR_CODES = {
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const;

export const ERROR_MESSAGES = {
  VALIDATION_FAILED: 'Vui lòng kiểm tra lại thông tin nhập.',
  UNAUTHORIZED: 'Bạn không có quyền truy cập.',
  FORBIDDEN: 'Bạn không được phép thực hiện hành động này.',
  NOT_FOUND: 'Không tìm thấy dữ liệu.',
  CONFLICT: 'Dữ liệu đã tồn tại.',
  INTERNAL_SERVER_ERROR: 'Có lỗi xảy ra từ hệ thống.',
} as const;
