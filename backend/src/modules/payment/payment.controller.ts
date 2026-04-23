import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import { PaymentService } from './services/payment.service';
import { GenerateActivationQrDto, VerifyActivationPaymentDto } from './dtos/payment.dto';
import { User } from '../../common/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) { }

  @UseGuards(JwtAuthGuard)
  @Post('activation/generate-qr')
  generateActivationQr(
    @Body() _dto: GenerateActivationQrDto,
    @User('id') userId: string,
  ) {
    return this.paymentService.generateActivationQr(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('activation/verify')
  verifyActivationPayment(
    @Body() dto: VerifyActivationPaymentDto,
    @User('id') userId: string,
  ) {
    return this.paymentService.verifyActivationPayment(userId, dto.paymentId);
  }
}
