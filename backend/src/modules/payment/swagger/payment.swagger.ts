import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { PaymentStatus } from '../entities/payment.entity';

export const ApiGenerateActivationQrDoc = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      description:
        'Tạo một payment record và trả về QR VietQR để mentee chuyển khoản phí kích hoạt. ' +
        'Nếu đã có QR chưa hết hạn, hệ thống trả lại QR cũ thay vì tạo mới.',
    }),
    ApiResponse({
      status: 200,
      description: 'Tạo mã QR kích hoạt thành công',
      schema: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                paymentId: {
                  type: 'string',
                  example: '9a7d8e3f-1a2b-4c5d-9e0f-123456789abc',
                },
                amount: { type: 'number', example: 10000 },
                transactionCode: {
                  type: 'string',
                  example: 'KICHHOAT 42AXYZ',
                },
                qrUrl: {
                  type: 'string',
                  example: 'https://img.vietqr.io/image/MB-...',
                },
                expiredAt: {
                  type: 'string',
                  format: 'date-time',
                  example: '2026-05-01T08:15:00.000Z',
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
  );
};

export const ApiFindOnePaymentDoc = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({}),
    ApiParam({
      name: 'id',
      description: 'ID của payment',
      example: '9a7d8e3f-1a2b-4c5d-9e0f-123456789abc',
    }),
    ApiResponse({
      status: 200,
      description: 'Lấy chi tiết payment thành công',
      schema: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  example: '9a7d8e3f-1a2b-4c5d-9e0f-123456789abc',
                },
                userId: { type: 'string', example: '42' },
                amount: { type: 'number', example: 10000 },
                currency: { type: 'string', example: 'VND' },
                paymentMethod: {
                  type: 'string',
                  nullable: true,
                  example: 'activation',
                },
                transactionId: {
                  type: 'string',
                  nullable: true,
                  example: null,
                },
                description: {
                  type: 'string',
                  nullable: true,
                  example: 'KICHHOAT 42AXYZ',
                },
                expiredAt: {
                  type: 'string',
                  format: 'date-time',
                  nullable: true,
                  example: '2026-05-01T08:15:00.000Z',
                },
                vietqrQrDataUrl: {
                  type: 'string',
                  nullable: true,
                  example: 'https://img.vietqr.io/image/MB-...',
                },
                vietqrPayload: {
                  type: 'object',
                  example: {
                    transactionCode: 'KICHHOAT 42AXYZ',
                    qrUrl: 'https://img.vietqr.io/...',
                    generatedAt: '2026-05-01T07:00:00.000Z',
                  },
                },
                paymentGatewayPayload: { type: 'object', example: {} },
                paidAt: {
                  type: 'string',
                  format: 'date-time',
                  nullable: true,
                  example: null,
                },
                status: {
                  type: 'string',
                  enum: Object.values(PaymentStatus),
                  example: PaymentStatus.PENDING,
                },
                createdAt: {
                  type: 'string',
                  format: 'date-time',
                  example: '2026-05-01T07:00:00.000Z',
                },
                updatedAt: {
                  type: 'string',
                  format: 'date-time',
                  example: '2026-05-01T07:00:00.000Z',
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
      status: 404,
      description: 'Không tìm thấy thông tin thanh toán',
    }),
  );
};

export const ApiVerifyActivationPaymentDoc = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      description:
        'User bấm "Tôi đã chuyển khoản" → backend query TN App API tìm giao dịch khớp → kích hoạt tài khoản. ' +
        'Nếu giao dịch chưa xuất hiện (activated: false), FE polling lại sau vài giây.',
    }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['paymentId'],
        properties: {
          paymentId: {
            type: 'string',
            example: '9a7d8e3f-1a2b-4c5d-9e0f-123456789abc',
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description:
        'Kết quả xác minh — `activated: true` nếu thành công, `activated: false` nếu giao dịch chưa được tìm thấy (FE polling lại)',
      schema: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                activated: { type: 'boolean', example: true },
                message: {
                  type: 'string',
                  example: 'Tài khoản đã được kích hoạt thành công!',
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
      description: 'Bạn không có quyền xác minh thanh toán này',
    }),
    ApiResponse({
      status: 404,
      description: 'Không tìm thấy thông tin thanh toán',
    }),
    ApiResponse({
      status: 422,
      description:
        'Mã QR đã hết hạn, vui lòng tạo mã mới và chuyển khoản lại',
    }),
    ApiResponse({
      status: 500,
      description: 'Lỗi nội bộ: không tìm thấy mã giao dịch trong payment',
    }),
    ApiResponse({
      status: 503,
      description:
        'Không thể kết nối đến dịch vụ kiểm tra giao dịch (TN App), vui lòng thử lại sau',
    }),
  );
};
