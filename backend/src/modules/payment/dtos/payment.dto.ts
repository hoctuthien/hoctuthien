import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO tạo QR kích hoạt tài khoản Mentor.
 * Không có thuộc tính nào — amount lấy từ SystemConfig,
 * userId lấy từ JWT Token qua @User('id') ở Controller.
 */
export class GenerateActivationQrDto { }

/**
 * DTO hứng webhook callback từ VietQR sau khi user chuyển khoản thành công.
 * Cấu trúc dựa theo VietQR Webhook API (v2).
 */
export class VietQrWebhookDto {
  @IsString()
  @IsNotEmpty()
  transaction_id: string;

  @IsNumber({}, { message: 'Số tiền phải là số hợp lệ.' })
  @Min(0)
  @Type(() => Number)
  amount: number;

  @IsString()
  @IsOptional()
  description?: string;
}
