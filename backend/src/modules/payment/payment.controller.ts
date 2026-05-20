import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaymentService } from './services/payment.service';
import {
  GenerateActivationQrDto,
  VerifyActivationPaymentDto,
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

  @UseGuards(JwtAuthGuard)
  @Post('activation/generate-qr')
  @ApiGenerateActivationQrDoc()
  generateActivationQr(
    @Body() _dto: GenerateActivationQrDto,
    @User('id') userId: string,
  ) {
    return this.paymentService.generateActivationQr(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiFindOnePaymentDoc()
  findOne(@Param('id') id: string) {
    return this.paymentService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('activation/verify')
  @ApiVerifyActivationPaymentDoc()
  verifyActivationPayment(
    @Body() dto: VerifyActivationPaymentDto,
    @User('id') userId: string,
  ) {
    return this.paymentService.verifyActivationPayment(userId, dto.paymentId);
  }
}
