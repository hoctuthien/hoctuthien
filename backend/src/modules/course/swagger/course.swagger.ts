import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { CourseStatus } from '../enums/course-status.enum';

export const ApiCreateCourseDoc = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Tạo khóa học mới' }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['title', 'price'],
        properties: {
          title: { type: 'string', maxLength: 255, example: 'Khóa học lập trình NestJS' },
          description: { type: 'string', nullable: true, example: 'Học NestJS từ cơ bản đến nâng cao' },
          thumbnailUrl: { type: 'string', maxLength: 500, nullable: true, example: 'https://example.com/image.jpg' },
          price: { type: 'number', example: 500000 },
          durationMinutes: { type: 'number', default: 60, example: 120 },
          prerequisites: { type: 'array', items: { type: 'string' }, example: ['Basic Javascript', 'Node.js'] },
          metadata: { type: 'object', example: { level: 'intermediate' } },
          status: { type: 'string', enum: Object.values(CourseStatus), default: CourseStatus.DRAFT, example: CourseStatus.DRAFT },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'Tạo khóa học thành công',
      schema: {
        type: 'object',
        properties: {
          data: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              mentorId: { type: 'string' },
              title: { type: 'string' },
              description: { type: 'string', nullable: true },
              thumbnailUrl: { type: 'string', nullable: true },
              price: { type: 'number' },
              durationMinutes: { type: 'number' },
              prerequisites: { type: 'array', items: { type: 'string' } },
              metadata: { type: 'object' },
              status: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
          meta: { type: 'object' },
          error: { type: 'string', nullable: true },
        },
      },
    }),
    ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' }),
    ApiResponse({ status: 401, description: 'Chưa đăng nhập hoặc token không hợp lệ' }),
  );
};

export const ApiFindAllCoursesDoc = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Lấy danh sách khóa học' }),
    ApiResponse({
      status: 200,
      description: 'Lấy danh sách khóa học thành công',
      schema: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                mentorId: { type: 'string' },
                title: { type: 'string' },
                description: { type: 'string', nullable: true },
                thumbnailUrl: { type: 'string', nullable: true },
                price: { type: 'number' },
                durationMinutes: { type: 'number' },
                status: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
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

export const ApiFindOneCourseDoc = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Lấy chi tiết khóa học theo id' }),
    ApiParam({
      name: 'id',
      description: 'ID của khóa học',
      example: '9a7d8e3f-1a2b-4c5d-9e0f-123456789abc',
    }),
    ApiResponse({
      status: 200,
      description: 'Lấy chi tiết khóa học thành công',
      schema: {
        type: 'object',
        properties: {
          data: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              mentorId: { type: 'string' },
              approvedBy: { type: 'string', nullable: true },
              title: { type: 'string' },
              description: { type: 'string', nullable: true },
              thumbnailUrl: { type: 'string', nullable: true },
              price: { type: 'number' },
              durationMinutes: { type: 'number' },
              prerequisites: { type: 'array', items: { type: 'string' } },
              metadata: { type: 'object' },
              status: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
          meta: { type: 'object' },
          error: { type: 'string', nullable: true },
        },
      },
    }),
    ApiResponse({ status: 404, description: 'Không tìm thấy khóa học' }),
  );
};

export const ApiUpdateCourseDoc = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Cập nhật khóa học theo id' }),
    ApiParam({
      name: 'id',
      description: 'ID của khóa học',
      example: '9a7d8e3f-1a2b-4c5d-9e0f-123456789abc',
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          title: { type: 'string', maxLength: 255 },
          description: { type: 'string', nullable: true },
          thumbnailUrl: { type: 'string', maxLength: 500, nullable: true },
          price: { type: 'number' },
          durationMinutes: { type: 'number' },
          prerequisites: { type: 'array', items: { type: 'string' } },
          metadata: { type: 'object' },
          status: { type: 'string', enum: Object.values(CourseStatus) },
          approvedBy: { type: 'string', nullable: true },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Cập nhật khóa học thành công',
      schema: {
        type: 'object',
        properties: {
          data: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              status: { type: 'string' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
          meta: { type: 'object' },
          error: { type: 'string', nullable: true },
        },
      },
    }),
    ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' }),
    ApiResponse({ status: 404, description: 'Không tìm thấy khóa học' }),
  );
};

export const ApiRemoveCourseDoc = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Xóa khóa học theo id' }),
    ApiParam({
      name: 'id',
      description: 'ID của khóa học',
      example: '9a7d8e3f-1a2b-4c5d-9e0f-123456789abc',
    }),
    ApiResponse({
      status: 200,
      description: 'Xóa khóa học thành công',
      schema: {
        type: 'object',
        properties: {
          data: { type: 'object', example: {} },
          meta: { type: 'object' },
          error: { type: 'string', nullable: true },
        },
      },
    }),
    ApiResponse({ status: 404, description: 'Không tìm thấy khóa học' }),
  );
};
