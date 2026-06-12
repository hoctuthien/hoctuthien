import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
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

/**
 * DTO tạo QR thanh toán chung (Strategy Pattern)
 */
export class GeneratePaymentQrDto {
  @ApiProperty({
    description: 'Loại hình thanh toán (ví dụ: activation, course_booking, donation)',
    example: 'course_booking',
  })
  @IsString()
  @IsNotEmpty({ message: 'paymentType không được để trống.' })
  paymentType: string;

  @ApiProperty({
    description: 'ID thực thể nghiệp vụ tham chiếu (ví dụ: bookingId, userId)',
    example: '6c99612d-25f0-49c3-813c-0e2e4877fb9',
  })
  @IsString()
  @IsNotEmpty({ message: 'referenceId không được để trống.' })
  referenceId: string;

  @ApiProperty({
    description: 'Số tiền tùy chọn (đối với quyên góp hoặc nhập tay)',
    example: 50000,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  amount?: number;
}

/**
 * DTO xác minh thanh toán chung (Strategy Pattern)
 */
export class VerifyPaymentDto {
  @ApiProperty({
    description: 'ID của payment record',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsString()
  @IsNotEmpty({ message: 'paymentId không được để trống.' })
  paymentId: string;
}
