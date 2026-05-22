import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { BookingStatus } from '../entities/course-booking.entity';

const bookingProperties = {
  id: { type: 'string', example: '9a7d8e3f-1a2b-4c5d-9e0f-123456789abc' },
  courseId: { type: 'string', example: '123456789' },
  menteeId: { type: 'string', example: '987654321' },
  paymentId: { type: 'string', nullable: true, example: null },
  meetingTime: {
    type: 'string',
    format: 'date-time',
    example: '2026-06-01T09:00:00.000Z',
  },
  googleMeetUrl: {
    type: 'string',
    nullable: true,
    example: 'https://meet.google.com/abc-defg-hij',
  },
  calendarEventId: { type: 'string', nullable: true, example: null },
  notesForMentor: {
    type: 'string',
    nullable: true,
    example: 'Tôi muốn hỏi về NestJS Guards',
  },
  cancellationReason: { type: 'string', nullable: true, example: null },
  metadata: { type: 'object', example: {} },
  status: {
    type: 'string',
    enum: Object.values(BookingStatus),
    example: BookingStatus.PENDING,
  },
  createdAt: { type: 'string', format: 'date-time' },
  updatedAt: { type: 'string', format: 'date-time' },
};

export const ApiCreateCourseBookingDoc = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Tạo booking khóa học mới (MENTEE)' }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['courseId', 'meetingTime'],
        properties: {
          courseId: { type: 'string', example: '123456789' },
          meetingTime: {
            type: 'string',
            format: 'date-time',
            example: '2026-06-01T09:00:00.000Z',
            description: 'Thời gian buổi học mong muốn',
          },
          notesForMentor: {
            type: 'string',
            example: 'Tôi muốn hỏi về NestJS Guards',
            description: 'Ghi chú gửi cho mentor',
          },
          metadata: { type: 'object', example: {} },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'Tạo booking thành công',
      schema: {
        type: 'object',
        properties: {
          data: { type: 'object', properties: bookingProperties },
          meta: { type: 'object' },
          error: { type: 'string', nullable: true },
        },
      },
    }),
    ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' }),
    ApiResponse({ status: 401, description: 'Chưa đăng nhập' }),
    ApiResponse({ status: 403, description: 'Không có quyền MENTEE' }),
  );
};

export const ApiFindAllCourseBookingsDoc = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Lấy danh sách booking (phân quyền tự động theo role)',
      description:
        '- **MENTEE**: chỉ thấy booking của chính mình\n' +
        '- **MENTOR**: chỉ thấy booking thuộc các course của mình\n' +
        '- **ADMIN**: thấy tất cả, hỗ trợ filter đầy đủ',
    }),
    ApiQuery({
      name: 'courseId',
      required: false,
      type: String,
      description: 'Lọc theo courseId (MENTOR/ADMIN)',
      example: '123',
    }),
    ApiQuery({
      name: 'menteeId',
      required: false,
      type: String,
      description: 'Lọc theo menteeId (ADMIN)',
      example: '456',
    }),
    ApiQuery({
      name: 'status',
      required: false,
      enum: BookingStatus,
      description: 'Lọc theo trạng thái',
    }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Trang hiện tại (mặc định: 1)',
      example: 1,
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Số bản ghi/trang (mặc định: 20, tối đa: 100)',
      example: 20,
    }),
    ApiResponse({
      status: 200,
      description: 'Lấy danh sách booking thành công',
      schema: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: { type: 'object', properties: bookingProperties },
          },
          meta: {
            type: 'object',
            properties: {
              total: { type: 'number', example: 10 },
              page: { type: 'number', example: 1 },
              limit: { type: 'number', example: 20 },
              totalPages: { type: 'number', example: 1 },
            },
          },
        },
      },
    }),
    ApiResponse({ status: 401, description: 'Chưa đăng nhập' }),
  );
};

export const ApiFindOneCourseBookingDoc = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Lấy chi tiết booking theo id' }),
    ApiParam({
      name: 'id',
      description: 'ID của booking',
      example: '9a7d8e3f-1a2b-4c5d-9e0f-123456789abc',
    }),
    ApiResponse({
      status: 200,
      description: 'Lấy chi tiết booking thành công',
      schema: {
        type: 'object',
        properties: {
          data: { type: 'object', properties: bookingProperties },
          meta: { type: 'object' },
          error: { type: 'string', nullable: true },
        },
      },
    }),
    ApiResponse({ status: 401, description: 'Chưa đăng nhập' }),
    ApiResponse({ status: 403, description: 'Không có quyền xem booking này' }),
    ApiResponse({ status: 404, description: 'Không tìm thấy booking' }),
  );
};

export const ApiUpdateCourseBookingByMenteeDoc = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'MENTEE cập nhật booking của mình (notes / huỷ)' }),
    ApiParam({
      name: 'id',
      description: 'ID của booking',
      example: '9a7d8e3f-1a2b-4c5d-9e0f-123456789abc',
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          notesForMentor: {
            type: 'string',
            example: 'Tôi cần hỏi thêm về Interceptor',
          },
          cancellationReason: { type: 'string', example: 'Bận đột xuất' },
          status: {
            type: 'string',
            enum: [BookingStatus.CANCELLED],
            example: BookingStatus.CANCELLED,
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Cập nhật booking thành công',
      schema: {
        type: 'object',
        properties: {
          data: { type: 'object', properties: bookingProperties },
          meta: { type: 'object' },
          error: { type: 'string', nullable: true },
        },
      },
    }),
    ApiResponse({ status: 401, description: 'Chưa đăng nhập' }),
    ApiResponse({
      status: 403,
      description: 'Không có quyền cập nhật booking này',
    }),
    ApiResponse({ status: 404, description: 'Không tìm thấy booking' }),
  );
};

export const ApiUpdateCourseBookingDoc = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'MENTOR / ADMIN cập nhật booking (status, meet link, lịch...)',
    }),
    ApiParam({
      name: 'id',
      description: 'ID của booking',
      example: '9a7d8e3f-1a2b-4c5d-9e0f-123456789abc',
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          meetingTime: {
            type: 'string',
            format: 'date-time',
            example: '2026-06-01T10:00:00.000Z',
          },
          googleMeetUrl: {
            type: 'string',
            example: 'https://meet.google.com/abc-defg-hij',
          },
          calendarEventId: {
            type: 'string',
            example: 'google-calendar-event-id',
          },
          notesForMentor: { type: 'string' },
          cancellationReason: { type: 'string' },
          paymentId: { type: 'string' },
          metadata: { type: 'object' },
          status: {
            type: 'string',
            enum: Object.values(BookingStatus),
            example: BookingStatus.CONFIRMED,
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Cập nhật booking thành công',
      schema: {
        type: 'object',
        properties: {
          data: { type: 'object', properties: bookingProperties },
          meta: { type: 'object' },
          error: { type: 'string', nullable: true },
        },
      },
    }),
    ApiResponse({ status: 401, description: 'Chưa đăng nhập' }),
    ApiResponse({
      status: 403,
      description: 'Không có quyền cập nhật booking này',
    }),
    ApiResponse({ status: 404, description: 'Không tìm thấy booking' }),
  );
};

export const ApiRemoveCourseBookingDoc = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Xóa mềm booking (MENTEE xóa của mình / ADMIN xóa bất kỳ)',
    }),
    ApiParam({
      name: 'id',
      description: 'ID của booking',
      example: '9a7d8e3f-1a2b-4c5d-9e0f-123456789abc',
    }),
    ApiResponse({
      status: 200,
      description: 'Xóa booking thành công',
      schema: {
        type: 'object',
        properties: {
          data: { type: 'object', example: {} },
          meta: { type: 'object' },
          error: { type: 'string', nullable: true },
        },
      },
    }),
    ApiResponse({ status: 401, description: 'Chưa đăng nhập' }),
    ApiResponse({ status: 403, description: 'Không có quyền xóa booking này' }),
    ApiResponse({ status: 404, description: 'Không tìm thấy booking' }),
  );
};
