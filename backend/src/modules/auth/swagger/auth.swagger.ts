import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiHeader,
} from '@nestjs/swagger';
import { UserRole } from '../../user/entities/user.entity';
import { AUTH_MESSAGES } from 'src/common/constants/message.constant';
import { LoginDto, RegisterDto, GoogleTokenDto } from '../dtos/auth.dto';

export const ApiRegisterDoc = () => {
  return applyDecorators(
    ApiOperation({ 
      description: 'Tạo tài khoản người dùng mới. Sau khi đăng ký thành công, access_token và refresh_token sẽ được trả về trong response body.' 
    }),
    ApiBody({ type: RegisterDto }),
    ApiResponse({
      status: 201,
      description: 'Đăng ký thành công. Tokens được trả về và lưu trong Cookie.',
      schema: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string' },
              name: { type: 'string' },
              role: { type: 'string', enum: Object.values(UserRole) },
            },
          },
          access_token: { type: 'string' },
          refresh_token: { type: 'string' },
          message: { type: 'string', example: AUTH_MESSAGES.REGISTER_SUCCESS },
        },
      },
    }),
    ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' }),
    ApiResponse({ status: 409, description: 'Email đã tồn tại' }),
  );
};

export const ApiLoginDoc = () => {
  return applyDecorators(
    ApiOperation({ 
      description: 'Xác thực người dùng. Sau khi thành công, access_token và refresh_token sẽ được trả về trong response body.' 
    }),
    ApiHeader({
      name: 'x-device-id',
      description: 'ID của thiết bị (cũng có thể gửi qua Cookie: device_id)',
      required: false,
    }),
    ApiBody({ type: LoginDto }),
    ApiResponse({
      status: 201,
      description: 'Đăng nhập thành công. Tokens được trả về và lưu trong Cookie.',
      schema: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string' },
              name: { type: 'string' },
              role: { type: 'string', enum: Object.values(UserRole) },
            },
          },
          access_token: { type: 'string' },
          refresh_token: { type: 'string' },
          message: { type: 'string', example: AUTH_MESSAGES.LOGIN_SUCCESS },
        },
      },
    }),
    ApiResponse({ status: 401, description: 'Email hoặc mật khẩu không chính xác' }),
  );
};

export const ApiRefreshTokensDoc = () => {
  return applyDecorators(
    ApiOperation({ 
      description: 'Sử dụng refresh_token để lấy access_token mới. Tokens mới sẽ được trả về trong response body.' 
    }),
    ApiHeader({
      name: 'x-device-id',
      description: 'ID của thiết bị (cũng có thể gửi qua Cookie: device_id)',
      required: false,
    }),
    ApiResponse({
      status: 201,
      description: 'Refresh thành công. Tokens mới được lưu vào Cookie.',
      schema: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string' },
              name: { type: 'string' },
              role: { type: 'string', enum: Object.values(UserRole) },
            },
          },
          access_token: { type: 'string' },
          refresh_token: { type: 'string' },
        },
      },
    }),
    ApiResponse({ status: 401, description: 'Refresh token không hợp lệ hoặc hết hạn' }),
  );
};

export const ApiLogoutDoc = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Đăng xuất',
      description: 'Xóa tokens trong Cookie và vô hiệu hóa session trên server.' 
    }),
    ApiHeader({
      name: 'x-device-id',
      description: 'ID của thiết bị (cũng có thể gửi qua Cookie: device_id)',
      required: false,
    }),
    ApiResponse({
      status: 201,
      description: 'Đăng xuất thành công. Cookies sẽ bị xóa.',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: AUTH_MESSAGES.LOGOUT_SUCCESS },
        },
      },
    }),
  );
};

export const ApiTestRedisDoc = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Test kết nối Redis (Debug)' }),
    ApiResponse({ status: 200, description: 'Kết nối Redis thành công' }),
  );
};

export const ApiGoogleAuthDoc = () => {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Đăng nhập bằng Google',
      description: 'Chuyển hướng người dùng đến trang xác thực của Google.' 
    }),
    ApiResponse({ status: 302, description: 'Chuyển hướng sang Google' }),
  );
};

export const ApiGoogleAuthCallbackDoc = () => {
  return applyDecorators(
    ApiOperation({ 
      description: 'Endpoint nhận kết quả từ Google. Sau khi xác thực thành công, tokens sẽ được trả về trong response body.' 
    }),
    ApiResponse({
      status: 200,
      description: 'Đăng nhập Google thành công. Tokens lưu vào Cookie.',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string' },
              name: { type: 'string' },
              role: { type: 'string', enum: Object.values(UserRole) },
            },
          },
          access_token: { type: 'string' },
          refresh_token: { type: 'string' },
        },
      },
    }),
  );
};

export const ApiGoogleTokenLoginDoc = () => {
  return applyDecorators(
    ApiOperation({ 
      description: 'Xác thực idToken từ Google Frontend. Sau khi thành công, tokens sẽ được trả về trong response body.' 
    }),
    ApiHeader({
      name: 'x-device-id',
      description: 'ID của thiết bị (cũng có thể gửi qua Cookie: device_id)',
      required: false,
    }),
    ApiBody({ type: GoogleTokenDto }),
    ApiResponse({
      status: 201,
      description: 'Đăng nhập thành công. Tokens lưu vào Cookie.',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string' },
              name: { type: 'string' },
              role: { type: 'string', enum: Object.values(UserRole) },
            },
          },
          access_token: { type: 'string' },
          refresh_token: { type: 'string' },
        },
      },
    }),
    ApiResponse({ status: 401, description: 'Google Token không hợp lệ' }),
  );
};
