import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
    description: 'ID của payment record (lấy từ response của generate-qr)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsString()
  @IsNotEmpty({ message: 'paymentId không được để trống.' })
  paymentId: string;
}

