import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { PaymentService } from './services/payment.service';
import {
  GenerateActivationQrDto,
  VerifyActivationPaymentDto,
  GeneratePaymentQrDto,
  VerifyPaymentDto,
} from './dtos/payment.dto';
import { User } from '../../common/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiGenerateActivationQrDoc,
  ApiFindOnePaymentDoc,
  ApiVerifyActivationPaymentDoc,
} from './swagger/payment.swagger';

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Tạo mã QR kích hoạt tài khoản',
    description:
      'Tạo hoặc lấy lại mã QR VietQR để mentee thanh toán phí kích hoạt. ' +
      'Nếu đã có QR còn hạn → trả về QR cũ. QR hết hạn sau 15 phút.',
  })
  @ApiBody({
    type: GenerateActivationQrDto,
    description: 'Body rỗng — không cần truyền gì.',
  })
  @ApiResponse({
    status: 201,
    description: 'QR tạo thành công hoặc trả về QR còn hạn.',
    schema: {
      example: {
        paymentId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        amount: 5000,
        transactionCode: 'KICHHOAT user123ABC',
        qrUrl: 'https://img.vietqr.io/...',
        expiredAt: '2026-05-20T11:15:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập.' })
  @UseGuards(JwtAuthGuard)
  @Post('activation/generate-qr')
  @ApiGenerateActivationQrDoc()
  generateActivationQr(
    @Body() _dto: GenerateActivationQrDto,
    @User('id') userId: string,
  ) {
    return this.paymentService.generateActivationQr(userId);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Lấy thông tin chi tiết một payment',
    description: 'Tra cứu trạng thái hoặc chi tiết của một payment record.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID của payment',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Trả về payment entity.',
    schema: {
      example: {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        userId: '123456789',
        amount: '5000.00',
        currency: 'VND',
        paymentMethod: 'activation',
        status: 'pending',
        transactionId: null,
        description: 'KICHHOAT user123ABC',
        expiredAt: '2026-05-20T11:15:00.000Z',
        paidAt: null,
        vietqrQrDataUrl: 'https://img.vietqr.io/...',
        vietqrPayload: { transactionCode: 'KICHHOAT user123ABC' },
        createdAt: '2026-05-20T11:00:00.000Z',
        updatedAt: '2026-05-20T11:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy payment.' })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiFindOnePaymentDoc()
  findOne(@Param('id') id: string) {
    return this.paymentService.findOne(id);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Xác minh thanh toán kích hoạt',
    description:
      'User bấm "Tôi đã chuyển khoản" → backend gọi TN App API kiểm tra giao dịch. ' +
      'Có Redis distributed lock để chống race condition với cron job tự động. ' +
      'Gọi API này sau khi đã chuyển khoản với đúng nội dung transactionCode.',
  })
  @ApiResponse({
    status: 201,
    description: 'Kết quả xác minh thanh toán.',
    schema: {
      oneOf: [
        {
          title: 'Đã kích hoạt thành công',
          example: {
            activated: true,
            message: 'Tài khoản đã được kích hoạt thành công.',
          },
        },
        {
          title: 'Chưa tìm thấy giao dịch',
          example: {
            activated: false,
            message: 'Không tìm thấy giao dịch khớp. Vui lòng thử lại sau.',
          },
        },
        {
          title: 'Cron đang xử lý',
          example: {
            activated: false,
            message:
              'Hệ thống đang xử lý giao dịch của bạn. Vui lòng thử lại sau vài giây.',
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập.' })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền xác minh payment này.',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy payment.' })
  @ApiResponse({
    status: 422,
    description: 'Mã QR đã hết hạn — cần tạo QR mới.',
  })
  @ApiResponse({
    status: 503,
    description: 'TN App API tạm thời không khả dụng. Thử lại sau.',
  })
  @UseGuards(JwtAuthGuard)
  @Post('activation/verify')
  @ApiVerifyActivationPaymentDoc()
  verifyActivationPayment(
    @Body() dto: VerifyActivationPaymentDto,
    @User('id') userId: string,
  ) {
    return this.paymentService.verifyActivationPayment(userId, dto.paymentId);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Tạo mã QR thanh toán chung',
    description:
      'Sinh QR VietQR để thanh toán động cho bất kỳ nghiệp vụ nào (activation, course_booking, donation).',
  })
  @ApiResponse({ status: 201, description: 'QR tạo thành công.' })
  @UseGuards(JwtAuthGuard)
  @Post('generate-qr')
  generateGenericQr(
    @Body() dto: GeneratePaymentQrDto,
    @User('id') userId: string,
  ) {
    return this.paymentService.generateGenericQr(
      userId,
      dto.paymentType,
      dto.referenceId,
      dto.amount,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Xác minh thanh toán chung',
    description:
      'Xác thực thanh toán và kích hoạt nghiệp vụ tương ứng thông qua Strategy Pattern.',
  })
  @ApiResponse({ status: 201, description: 'Kết quả xác minh.' })
  @UseGuards(JwtAuthGuard)
  @Post('verify')
  verifyGenericPayment(
    @Body() dto: VerifyPaymentDto,
    @User('id') userId: string,
  ) {
    return this.paymentService.verifyPayment(userId, dto.paymentId);
  }
}
