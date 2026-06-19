import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { BugReportSeverity, BugReportStatus } from '../entities/bug-report.entity';

const bugReportProperties = {
  id: { type: 'string', example: 'd1981223-1c39-4d2b-aa90-b1836c1cf4c9' },
  userId: { type: 'string', nullable: true, example: 'user-uuid-123' },
  title: { type: 'string', example: 'Nút đăng nhập bị lỗi' },
  description: { type: 'string', example: 'Khi click vào nút đăng nhập, màn hình bị đơ.' },
  stepsToReproduce: { type: 'string', nullable: true, example: '1. Truy cập trang chủ\n2. Click Đăng nhập' },
  severity: { type: 'string', enum: Object.values(BugReportSeverity), example: BugReportSeverity.MEDIUM },
  status: { type: 'string', enum: Object.values(BugReportStatus), example: BugReportStatus.OPEN },
  deviceInfo: { type: 'object', nullable: true, example: { browser: 'Chrome', os: 'Windows 11' } },
  createdAt: { type: 'string', format: 'date-time' },
  updatedAt: { type: 'string', format: 'date-time' },
};

export const ApiCreateBugReportDoc = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Gửi báo cáo lỗi mới (Bất kỳ user đã đăng nhập)' }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['title', 'description'],
        properties: {
          title: { type: 'string', example: 'Nút đăng nhập bị lỗi' },
          description: { type: 'string', example: 'Khi click vào nút đăng nhập, màn hình bị đơ.' },
          stepsToReproduce: { type: 'string', example: '1. Truy cập trang chủ\n2. Click Đăng nhập' },
          severity: { type: 'string', enum: Object.values(BugReportSeverity), example: BugReportSeverity.MEDIUM },
          deviceInfo: { type: 'object', example: { browser: 'Chrome', os: 'Windows 11' } },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'Gửi báo cáo lỗi thành công',
      schema: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: bugReportProperties,
            },
          },
          message: { type: 'string', example: '' },
          meta: { type: 'object', example: {} },
        },
      },
    }),
    ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' }),
    ApiResponse({ status: 401, description: 'Chưa đăng nhập' }),
  );
};

export const ApiFindAllBugReportsDoc = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Lấy danh sách báo cáo lỗi',
      description: '- **ADMIN**: xem toàn bộ báo cáo lỗi của hệ thống.\n- **USER/MENTOR/MENTEE**: chỉ xem được các báo cáo lỗi của chính mình gửi.',
    }),
    ApiResponse({
      status: 200,
      description: 'Lấy danh sách báo cáo lỗi thành công',
      schema: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: bugReportProperties,
            },
          },
          message: { type: 'string', example: '' },
          meta: { type: 'object', example: {} },
        },
      },
    }),
    ApiResponse({ status: 401, description: 'Chưa đăng nhập' }),
  );
};

export const ApiFindOneBugReportDoc = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Xem chi tiết báo cáo lỗi (Admin hoặc người tạo)' }),
    ApiParam({
      name: 'id',
      description: 'ID của báo cáo lỗi',
      example: 'd1981223-1c39-4d2b-aa90-b1836c1cf4c9',
    }),
    ApiResponse({
      status: 200,
      description: 'Lấy chi tiết thành công',
      schema: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: bugReportProperties,
            },
          },
          message: { type: 'string', example: '' },
          meta: { type: 'object', example: {} },
        },
      },
    }),
    ApiResponse({ status: 401, description: 'Chưa đăng nhập' }),
    ApiResponse({ status: 403, description: 'Không có quyền truy cập báo cáo lỗi này' }),
    ApiResponse({ status: 404, description: 'Không tìm thấy báo cáo lỗi' }),
  );
};

export const ApiUpdateBugReportDoc = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Cập nhật trạng thái / mức độ nghiêm trọng của báo cáo lỗi (ADMIN)' }),
    ApiParam({
      name: 'id',
      description: 'ID của báo cáo lỗi',
      example: 'd1981223-1c39-4d2b-aa90-b1836c1cf4c9',
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: Object.values(BugReportStatus), example: BugReportStatus.IN_PROGRESS },
          severity: { type: 'string', enum: Object.values(BugReportSeverity), example: BugReportSeverity.CRITICAL },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Cập nhật thành công',
      schema: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: bugReportProperties,
            },
          },
          message: { type: 'string', example: '' },
          meta: { type: 'object', example: {} },
        },
      },
    }),
    ApiResponse({ status: 401, description: 'Chưa đăng nhập' }),
    ApiResponse({ status: 403, description: 'Không có quyền ADMIN' }),
    ApiResponse({ status: 404, description: 'Không tìm thấy báo cáo lỗi' }),
  );
};

export const ApiRemoveBugReportDoc = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Xóa mềm báo cáo lỗi (ADMIN)' }),
    ApiParam({
      name: 'id',
      description: 'ID của báo cáo lỗi',
      example: 'd1981223-1c39-4d2b-aa90-b1836c1cf4c9',
    }),
    ApiResponse({
      status: 200,
      description: 'Xóa báo cáo lỗi thành công',
      schema: {
        type: 'object',
        properties: {
          data: { type: 'array', items: { type: 'object' }, example: [] },
          message: { type: 'string', example: '' },
          meta: { type: 'object', example: {} },
        },
      },
    }),
    ApiResponse({ status: 401, description: 'Chưa đăng nhập' }),
    ApiResponse({ status: 403, description: 'Không có quyền ADMIN' }),
    ApiResponse({ status: 404, description: 'Không tìm thấy báo cáo lỗi' }),
  );
};
