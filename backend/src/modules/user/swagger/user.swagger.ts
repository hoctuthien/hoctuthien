import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';
import { CreateUserDto, UpdateUserDto } from '../dtos/user.dto';

export const ApiGetMeDoc = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Lấy thông tin user đang đăng nhập' }),
    ApiResponse({
      status: 200,
      description: 'Lấy thông tin user thành công',
      schema: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                message: { type: 'string', example: 'Lấy thông tin người dùng thành công.' },
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', example: '9a7d8e3f-1a2b-4c5d-9e0f-123456789abc' },
                    name: { type: 'string', example: 'Nguyen Van A' },
                    email: { type: 'string', example: 'a@gmail.com' },
                    phone: { type: 'string', nullable: true, example: '0987654321' },
                    avatarUrl: { type: 'string', nullable: true, example: 'https://example.com/avatar.jpg' },
                    dayOfBirth: { type: 'string', nullable: true, example: '2000-01-01' },
                    gender: { type: 'string', nullable: true, example: 'male' },
                    role: { type: 'string', enum: Object.values(UserRole), example: 'mentee' },
                    points: { type: 'number', example: 0 },
                    isVerified: { type: 'boolean', example: false },
                    status: { type: 'string', example: 'active' },
                    timezone: { type: 'string', example: 'UTC' },
                    preferences: { type: 'object', example: {} },
                    createdAt: { type: 'string', format: 'date-time', example: '2026-04-28T08:05:57.000Z' },
                  },
                },
              },
            },
          },
          meta: { type: 'object', example: {} },
          error: { type: 'string', nullable: true, example: null },
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Chưa đăng nhập hoặc token không hợp lệ',
    }),
    ApiResponse({
      status: 403,
      description: 'Tài khoản đã bị khóa bởi quản trị viên',
    }),
    ApiResponse({
      status: 404,
      description: 'Không tìm thấy user',
    }),
  );
};

export const ApiCreateUserDoc = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Tạo user mới' }),
    ApiBody({ type: CreateUserDto }),
    ApiResponse({
      status: 201,
      description: 'Tạo user thành công',
      schema: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                email: { type: 'string' },
                phone: { type: 'string', nullable: true },
                avatarUrl: { type: 'string', nullable: true },
                dayOfBirth: { type: 'string', nullable: true },
                gender: { type: 'string', nullable: true },
                timezone: { type: 'string' },
                role: { type: 'string' },
                points: { type: 'number' },
                isVerified: { type: 'boolean' },
                preferences: { type: 'object' },
                status: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
              },
            },
          },
          meta: { type: 'object' },
          error: { type: 'string', nullable: true },
        },
      },
    }),
    ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' }),
  );
};

export const ApiFindAllUsersDoc = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Lấy danh sách user' }),
    ApiResponse({
      status: 200,
      description: 'Lấy danh sách user thành công',
      schema: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                email: { type: 'string' },
                phone: { type: 'string', nullable: true },
                avatarUrl: { type: 'string', nullable: true },
                dayOfBirth: { type: 'string', nullable: true },
                gender: { type: 'string', nullable: true },
                timezone: { type: 'string' },
                role: { type: 'string' },
                points: { type: 'number' },
                isVerified: { type: 'boolean' },
                preferences: { type: 'object' },
                status: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
              },
            },
          },
          meta: { type: 'object' },
          error: { type: 'string', nullable: true },
        },
      },
    }),
  );
};

export const ApiFindOneUserDoc = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Lấy chi tiết user theo id' }),
    ApiParam({
      name: 'id',
      description: 'ID của user',
      example: '9a7d8e3f-1a2b-4c5d-9e0f-123456789abc',
    }),
    ApiResponse({
      status: 200,
      description: 'Lấy chi tiết user thành công',
      schema: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                email: { type: 'string' },
                phone: { type: 'string', nullable: true },
                avatarUrl: { type: 'string', nullable: true },
                dayOfBirth: { type: 'string', nullable: true },
                gender: { type: 'string', nullable: true },
                timezone: { type: 'string' },
                role: { type: 'string' },
                points: { type: 'number' },
                isVerified: { type: 'boolean' },
                preferences: { type: 'object' },
                status: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
              },
            },
          },
          meta: { type: 'object' },
          error: { type: 'string', nullable: true },
        },
      },
    }),
    ApiResponse({ status: 404, description: 'Không tìm thấy user' }),
  );
};

export const ApiUpdateUserDoc = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Cập nhật user theo id' }),
    ApiParam({
      name: 'id',
      description: 'ID của user',
      example: '9a7d8e3f-1a2b-4c5d-9e0f-123456789abc',
    }),
    ApiBody({ type: UpdateUserDto }),
    ApiResponse({
      status: 200,
      description: 'Cập nhật user thành công',
      schema: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                email: { type: 'string' },
                phone: { type: 'string', nullable: true },
                avatarUrl: { type: 'string', nullable: true },
                dayOfBirth: { type: 'string', nullable: true },
                gender: { type: 'string', nullable: true },
                timezone: { type: 'string' },
                role: { type: 'string' },
                points: { type: 'number' },
                isVerified: { type: 'boolean' },
                preferences: { type: 'object' },
                status: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
              },
            },
          },
          meta: { type: 'object' },
          error: { type: 'string', nullable: true },
        },
      },
    }),
    ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' }),
    ApiResponse({ status: 404, description: 'Không tìm thấy user' }),
  );
};

export const ApiRemoveUserDoc = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Xóa user theo id' }),
    ApiParam({
      name: 'id',
      description: 'ID của user',
      example: '9a7d8e3f-1a2b-4c5d-9e0f-123456789abc',
    }),
    ApiResponse({
      status: 200,
      description: 'Xóa user thành công',
      schema: {
        type: 'object',
        properties: {
          data: { type: 'array', items: {} },
          meta: { type: 'object' },
          error: { type: 'string', nullable: true },
        },
      },
    }),
    ApiResponse({ status: 404, description: 'Không tìm thấy user' }),
  );
};
