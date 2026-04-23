import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import { PaymentService } from './services/payment.service';
import { GenerateActivationQrDto } from './dtos/payment.dto';
import { User } from '../../common/decorators/user.decorator';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) { }

  /**
   * POST /payments/activation/generate-qr
   * Tạo mã QR VietQR để user thanh toán phí kích hoạt tài khoản.
   * userId được lấy từ JWT Token — FE không cần gửi trong body.
   */
  @Post('activation/generate-qr')
  generateActivationQr(
    @Body() _dto: GenerateActivationQrDto,
    @User('id') userId: string,
  ) {
    return this.paymentService.generateActivationQr(userId);
  }

  /**
   * GET /payments/:id
   * Tra cứu thông tin một payment theo ID.
   * TODO (Chặng 4): Thêm guard kiểm tra ownership (chỉ owner mới xem được).
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentService.findOne(id);
  }

  // TODO (Chặng 4):
  // POST /payments/webhook/vietqr  → @Public() + @BypassInterceptor()
}
