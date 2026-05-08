import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO tạo QR kích hoạt tài khoản Mentee.
 * Không có thuộc tính nào — amount lấy từ SystemConfig,
 * userId lấy từ JWT Token qua @User('id') ở Controller.
 */
export class GenerateActivationQrDto {}

/**
 * DTO xác minh thanh toán kích hoạt — user bấm "Tôi đã chuyển khoản".
 * Backend sẽ query TN App API để tìm giao dịch khớp.
 */
export class VerifyActivationPaymentDto {
  @ApiProperty({
    example: 'PAY123456',
    description: 'ID của giao dịch thanh toán',
  })
  @IsString()
  @IsNotEmpty({ message: 'paymentId không được để trống.' })
  paymentId: string;
}
