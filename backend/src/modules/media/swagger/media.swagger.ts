import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
} from '@nestjs/swagger';

export const ApiUploadMediaDoc = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Upload hình ảnh lên hệ thống (Openinary)' }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
            description: 'File hình ảnh cần upload (jpg, png, webp, avif)',
          },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'Upload thành công',
      schema: {
        type: 'object',
        properties: {
          data: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              files: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    filename: { type: 'string', example: 'image.png' },
                    path: { type: 'string', example: 'image.png' },
                    size: { type: 'number', example: 55733 },
                    url: {
                      type: 'string',
                      example: 'https://cloud.hoctuthien.com/t/image.png',
                    },
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
      status: 400,
      description: 'File không đúng định dạng hoặc quá kích thước',
    }),
    ApiResponse({ status: 401, description: 'Chưa đăng nhập' }),
  );
};
