import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';

export const ApiCreateCourseCategoryDoc = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Tạo liên kết khóa học và danh mục' }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['courseId', 'categoryId'],
        properties: {
          courseId: { type: 'string', example: '123456789' },
          categoryId: { type: 'string', example: '987654321' },
          status: { type: 'string', default: 'active', example: 'active' },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'Tạo liên kết thành công',
      schema: {
        type: 'object',
        properties: {
          data: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              courseId: { type: 'string' },
              categoryId: { type: 'string' },
              status: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
          meta: { type: 'object' },
          error: { type: 'string', nullable: true },
        },
      },
    }),
  );
};

export const ApiFindAllCourseCategoriesDoc = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Lấy danh sách liên kết khóa học - danh mục' }),
    ApiResponse({
      status: 200,
      description: 'Lấy danh sách thành công',
      schema: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                courseId: { type: 'string' },
                categoryId: { type: 'string' },
                status: { type: 'string' },
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

export const ApiFindOneCourseCategoryDoc = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Lấy chi tiết liên kết theo id' }),
    ApiParam({
      name: 'id',
      description: 'ID của liên kết',
      example: '9a7d8e3f-1a2b-4c5d-9e0f-123456789abc',
    }),
    ApiResponse({
      status: 200,
      description: 'Lấy chi tiết thành công',
      schema: {
        type: 'object',
        properties: {
          data: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              courseId: { type: 'string' },
              categoryId: { type: 'string' },
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
  );
};

export const ApiUpdateCourseCategoryDoc = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Cập nhật liên kết theo id' }),
    ApiParam({
      name: 'id',
      description: 'ID của liên kết',
      example: '9a7d8e3f-1a2b-4c5d-9e0f-123456789abc',
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          courseId: { type: 'string' },
          categoryId: { type: 'string' },
          status: { type: 'string' },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Cập nhật thành công',
    }),
  );
};

export const ApiRemoveCourseCategoryDoc = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Xóa liên kết theo id' }),
    ApiParam({
      name: 'id',
      description: 'ID của liên kết',
    }),
    ApiResponse({
      status: 200,
      description: 'Xóa thành công',
    }),
  );
};
