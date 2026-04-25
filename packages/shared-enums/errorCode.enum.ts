export enum ErrorCode {
  // Auth Error Codes
  AUTH_REGISTER_SUCCESS = 'AUTH_REGISTER_SUCCESS',
  AUTH_LOGIN_SUCCESS = 'AUTH_LOGIN_SUCCESS',
  AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  AUTH_EMPTY_EMAIL = 'AUTH_EMPTY_EMAIL',
  AUTH_EMPTY_PASSWORD = 'AUTH_EMPTY_PASSWORD',
  AUTH_INVALID_EMAIL = 'AUTH_INVALID_EMAIL',
  AUTH_INVALID_PASSWORD = 'AUTH_INVALID_PASSWORD',
  AUTH_EMAIL_ALREADY_EXISTS = 'AUTH_EMAIL_ALREADY_EXISTS',
  AUTH_LOGOUT_SUCCESS = 'AUTH_LOGOUT_SUCCESS',
  AUTH_DEVICE_INVALID = 'AUTH_DEVICE_INVALID',
  AUTH_ID_REQUIRED = 'AUTH_ID_REQUIRED',
  AUTH_GET_SUCCESS = 'AUTH_GET_SUCCESS',

  // Course Error Codes
  COURSE_BOOKING_SUCCESS = 'COURSE_BOOKING_SUCCESS',
  COURSE_NOT_FOUND = 'COURSE_NOT_FOUND',
  ALREADY_ENROLLED = 'ALREADY_ENROLLED',
  COURSE_BOOKING_FAILED = 'COURSE_BOOKING_FAILED',
  COURSE_UNBOOKING_SUCCESS = 'COURSE_UNBOOKING_SUCCESS',
  COURSE_UNBOOKING_FAILED = 'COURSE_UNBOOKING_FAILED',

  // Application Error Codes
  APPLICATION_SUCCESS = 'APPLICATION_SUCCESS',
  APPLICATION_ALREADY_EXISTS = 'APPLICATION_ALREADY_EXISTS',
  APPLICATION_FAILED = 'APPLICATION_FAILED',
}

export const ErrorMessage: Record<ErrorCode, string> = {
  [ErrorCode.AUTH_REGISTER_SUCCESS]: 'Đăng ký tài khoản thành công.',
  [ErrorCode.AUTH_LOGIN_SUCCESS]: 'Đăng nhập thành công.',
  [ErrorCode.AUTH_INVALID_CREDENTIALS]: 'Email hoặc mật khẩu không đúng.',
  [ErrorCode.AUTH_EMPTY_EMAIL]: 'Email không được để trống.',
  [ErrorCode.AUTH_EMPTY_PASSWORD]: 'Mật khẩu không được để trống.',
  [ErrorCode.AUTH_INVALID_EMAIL]: 'Email không đúng định dạng.',
  [ErrorCode.AUTH_INVALID_PASSWORD]: 'Mật khẩu phải ít nhất 6 ký tự.',
  [ErrorCode.AUTH_EMAIL_ALREADY_EXISTS]: 'Email này đã được sử dụng.',
  [ErrorCode.AUTH_LOGOUT_SUCCESS]: 'Đăng xuất thành công.',
  [ErrorCode.AUTH_DEVICE_INVALID]: 'Thiết bị không hợp lệ cho phiên này.',
  [ErrorCode.AUTH_ID_REQUIRED]: 'ID người dùng không được để trống.',
  [ErrorCode.AUTH_GET_SUCCESS]: 'Truy xuất thông tin thành công',

  [ErrorCode.COURSE_BOOKING_SUCCESS]: 'Đăng ký khóa học thành công.',
  [ErrorCode.COURSE_NOT_FOUND]: 'Không tìm thấy khóa học này.',
  [ErrorCode.ALREADY_ENROLLED]: 'Bạn đã đăng ký khóa học này rồi.',
  [ErrorCode.COURSE_BOOKING_FAILED]: 'Đăng ký khóa học thất bại.',
  [ErrorCode.COURSE_UNBOOKING_SUCCESS]: 'Hủy đăng ký khóa học thành công.',
  [ErrorCode.COURSE_UNBOOKING_FAILED]: 'Hủy đăng ký khóa học thất bại.',

  [ErrorCode.APPLICATION_SUCCESS]: 'Gửi đơn đăng ký mentor thành công.',
  [ErrorCode.APPLICATION_ALREADY_EXISTS]: 'Bạn đã có một đơn đăng ký đang chờ duyệt.',
  [ErrorCode.APPLICATION_FAILED]: 'Gửi đơn đăng ký mentor thất bại.',
};
