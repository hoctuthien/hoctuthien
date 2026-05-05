import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';

const categoryProperties = {
  id: { type: 'string', example: '9a7d8e3f-1a2b-4c5d-9e0f-123456789abc' },
  name: { type: 'string', example: 'Lập trình' },
  slug: { type: 'string', nullable: true, example: 'lap-trinh' },
  iconUrl: {
    type: 'string',
    nullable: true,
    example: 'https://example.com/icon.png',
  },
  metadata: { type: 'object', example: {} },
  status: { type: 'string', example: 'active' },
  createdAt: { type: 'string', format: 'date-time' },
  updatedAt: { type: 'string', format: 'date-time' },
};

export const ApiCreateCategoryDoc = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Tạo danh mục mới (chỉ ADMIN)' }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', maxLength: 255, example: 'Lập trình' },
          slug: {
            type: 'string',
            maxLength: 255,
            example: 'lap-trinh',
            description: 'Nếu không truyền, hệ thống sẽ tự sinh từ name',
          },
          iconUrl: {
            type: 'string',
            maxLength: 500,
            nullable: true,
            example: 'https://example.com/icon.png',
          },
          metadata: { type: 'object', example: { color: '#ff0000' } },
          status: {
            type: 'string',
            example: 'active',
            default: 'active',
          },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'Tạo danh mục thành công',
      schema: {
        type: 'object',
        properties: { data: { type: 'object', properties: categoryProperties } },
      },
    }),
    ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' }),
    ApiResponse({ status: 401, description: 'Chưa đăng nhập' }),
    ApiResponse({ status: 403, description: 'Không có quyền ADMIN' }),
    ApiResponse({ status: 409, description: 'Slug đã tồn tại' }),
  );
};

export const ApiFindAllCategoriesDoc = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Lấy danh sách danh mục (có tìm kiếm & phân trang)' }),
    ApiQuery({
      name: 'name',
      required: false,
      type: String,
      description: 'Tìm kiếm theo tên (partial match)',
      example: 'lập trình',
    }),
    ApiQuery({
      name: 'slug',
      required: false,
      type: String,
      description: 'Tìm kiếm theo slug (partial match)',
      example: 'lap-trinh',
    }),
    ApiQuery({
      name: 'status',
      required: false,
      type: String,
      description: 'Lọc theo trạng thái',
      example: 'active',
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
      description: 'Số bản ghi mỗi trang (mặc định: 20, tối đa: 100)',
      example: 20,
    }),
    ApiResponse({
      status: 200,
      description: 'Lấy danh sách danh mục thành công',
      schema: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: { type: 'object', properties: categoryProperties },
          },
          meta: {
            type: 'object',
            properties: {
              total: { type: 'number', example: 42 },
              page: { type: 'number', example: 1 },
              limit: { type: 'number', example: 20 },
              totalPages: { type: 'number', example: 3 },
            },
          },
        },
      },
    }),
  );
};

export const ApiFindOneCategoryDoc = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Lấy chi tiết danh mục theo id' }),
    ApiParam({
      name: 'id',
      description: 'ID của danh mục',
      example: '9a7d8e3f-1a2b-4c5d-9e0f-123456789abc',
    }),
    ApiResponse({
      status: 200,
      description: 'Lấy chi tiết danh mục thành công',
      schema: {
        type: 'object',
        properties: { data: { type: 'object', properties: categoryProperties } },
      },
    }),
    ApiResponse({ status: 404, description: 'Không tìm thấy danh mục' }),
  );
};

export const ApiUpdateCategoryDoc = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Cập nhật danh mục theo id (chỉ ADMIN)' }),
    ApiParam({
      name: 'id',
      description: 'ID của danh mục',
      example: '9a7d8e3f-1a2b-4c5d-9e0f-123456789abc',
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          name: { type: 'string', maxLength: 255 },
          slug: { type: 'string', maxLength: 255 },
          iconUrl: { type: 'string', maxLength: 500, nullable: true },
          metadata: { type: 'object' },
          status: { type: 'string', example: 'active' },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Cập nhật danh mục thành công',
      schema: {
        type: 'object',
        properties: { data: { type: 'object', properties: categoryProperties } },
      },
    }),
    ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' }),
    ApiResponse({ status: 401, description: 'Chưa đăng nhập' }),
    ApiResponse({ status: 403, description: 'Không có quyền ADMIN' }),
    ApiResponse({ status: 404, description: 'Không tìm thấy danh mục' }),
    ApiResponse({ status: 409, description: 'Slug đã tồn tại' }),
  );
};

export const ApiRemoveCategoryDoc = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Xóa mềm danh mục theo id (chỉ ADMIN)' }),
    ApiParam({
      name: 'id',
      description: 'ID của danh mục',
      example: '9a7d8e3f-1a2b-4c5d-9e0f-123456789abc',
    }),
    ApiResponse({
      status: 200,
      description: 'Xóa danh mục thành công',
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
    ApiResponse({ status: 403, description: 'Không có quyền ADMIN' }),
    ApiResponse({ status: 404, description: 'Không tìm thấy danh mục' }),
  );
};
