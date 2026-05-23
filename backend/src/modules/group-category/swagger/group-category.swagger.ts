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
  name: { type: 'string', example: 'Lập trình Web' },
  slug: { type: 'string', nullable: true, example: 'lap-trinh-web' },
  iconUrl: {
    type: 'string',
    nullable: true,
    example: 'https://example.com/icon.png',
  },
  metadata: { type: 'object', example: {} },
  status: { type: 'string', example: 'ACTIVE' },
  createdAt: { type: 'string', format: 'date-time' },
  updatedAt: { type: 'string', format: 'date-time' },
};

const groupCategoryProperties = {
  id: { type: 'string', example: 'a0100000-0000-0000-0000-000000000001' },
  name: { type: 'string', example: 'Công nghệ thông tin' },
  slug: { type: 'string', nullable: true, example: 'cong-nghe-thong-tin' },
  status: { type: 'string', example: 'ACTIVE' },
  createdAt: { type: 'string', format: 'date-time' },
  updatedAt: { type: 'string', format: 'date-time' },
  categories: {
    type: 'array',
    items: {
      type: 'object',
      properties: categoryProperties,
    },
  },
};

export const ApiCreateGroupCategoryDoc = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Tạo nhóm danh mục mới (chỉ ADMIN)' }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', maxLength: 255, example: 'Công nghệ thông tin' },
          slug: {
            type: 'string',
            maxLength: 255,
            example: 'cong-nghe-thong-tin',
            description: 'Nếu không truyền, hệ thống sẽ tự sinh từ name',
          },
          status: {
            type: 'string',
            example: 'ACTIVE',
            default: 'ACTIVE',
          },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'Tạo nhóm danh mục thành công',
      schema: {
        type: 'object',
        properties: {
          data: { type: 'object', properties: groupCategoryProperties },
        },
      },
    }),
    ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' }),
    ApiResponse({ status: 401, description: 'Chưa đăng nhập' }),
    ApiResponse({ status: 403, description: 'Không có quyền ADMIN' }),
    ApiResponse({ status: 409, description: 'Slug đã tồn tại' }),
  );
};

export const ApiFindAllGroupCategoriesDoc = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Lấy danh sách nhóm danh mục (có tìm kiếm & phân trang & kèm categories con)',
    }),
    ApiQuery({
      name: 'name',
      required: false,
      type: String,
      description: 'Tìm kiếm theo tên (partial match)',
      example: 'công nghệ',
    }),
    ApiQuery({
      name: 'slug',
      required: false,
      type: String,
      description: 'Tìm kiếm theo slug (partial match)',
      example: 'cong-nghe-thong-tin',
    }),
    ApiQuery({
      name: 'status',
      required: false,
      type: String,
      description: 'Lọc theo trạng thái',
      example: 'ACTIVE',
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
      description: 'Lấy danh sách nhóm danh mục thành công',
      schema: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: { type: 'object', properties: groupCategoryProperties },
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
  );
};

export const ApiFindOneGroupCategoryDoc = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Lấy chi tiết nhóm danh mục theo id (kèm categories con)' }),
    ApiParam({
      name: 'id',
      description: 'ID của nhóm danh mục (UUID)',
      example: 'a0100000-0000-0000-0000-000000000001',
    }),
    ApiResponse({
      status: 200,
      description: 'Lấy chi tiết nhóm danh mục thành công',
      schema: {
        type: 'object',
        properties: {
          data: { type: 'object', properties: groupCategoryProperties },
        },
      },
    }),
    ApiResponse({ status: 404, description: 'Không tìm thấy nhóm danh mục' }),
  );
};

export const ApiUpdateGroupCategoryDoc = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Cập nhật nhóm danh mục theo id (chỉ ADMIN)' }),
    ApiParam({
      name: 'id',
      description: 'ID của nhóm danh mục',
      example: 'a0100000-0000-0000-0000-000000000001',
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          name: { type: 'string', maxLength: 255 },
          slug: { type: 'string', maxLength: 255 },
          status: { type: 'string', example: 'ACTIVE' },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Cập nhật nhóm danh mục thành công',
      schema: {
        type: 'object',
        properties: {
          data: { type: 'object', properties: groupCategoryProperties },
        },
      },
    }),
    ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' }),
    ApiResponse({ status: 401, description: 'Chưa đăng nhập' }),
    ApiResponse({ status: 403, description: 'Không có quyền ADMIN' }),
    ApiResponse({ status: 404, description: 'Không tìm thấy nhóm danh mục' }),
    ApiResponse({ status: 409, description: 'Slug đã tồn tại' }),
  );
};

export const ApiRemoveGroupCategoryDoc = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Xóa mềm nhóm danh mục theo id (chỉ ADMIN)' }),
    ApiParam({
      name: 'id',
      description: 'ID của nhóm danh mục',
      example: 'a0100000-0000-0000-0000-000000000001',
    }),
    ApiResponse({
      status: 200,
      description: 'Xóa nhóm danh mục thành công',
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
    ApiResponse({ status: 404, description: 'Không tìm thấy nhóm danh mục' }),
  );
};
