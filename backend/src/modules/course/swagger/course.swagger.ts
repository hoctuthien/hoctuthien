import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { CourseStatus } from '../enums/course-status.enum';
import { CreateCourseDto, UpdateCourseDto } from '../dtos/course.dto';

export const ApiCreateCourseDoc = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Tạo khóa học mới' }),
    ApiBody({ type: CreateCourseDto }),
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
    ApiBody({ type: UpdateCourseDto }),
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
