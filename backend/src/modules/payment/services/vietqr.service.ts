import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class VietqrService {
  private readonly logger = new Logger(VietqrService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Sinh URL ảnh QR theo chuẩn VietQR Quick Link (không cần gọi API).
   * Format: https://img.vietqr.io/image/<BANK_CODE>-<ACCOUNT_NO>-<TEMPLATE>.png
   *         ?amount=<AMOUNT>&addInfo=<DESCRIPTION>&accountName=<ACCOUNT_NAME>
   *
   * @param amount       Số tiền (VND)
   * @param description  Nội dung chuyển khoản (transactionCode)
   */
  generateQrUrl(amount: number, description: string): string {
    const bankCode    = this.configService.get<string>('vietqr.bankCode');
    const accountNo   = this.configService.get<string>('vietqr.accountNo');
    const accountName = this.configService.get<string>('vietqr.accountName');

    const baseUrl = `https://img.vietqr.io/image/${bankCode}-${accountNo}-compact2.png`;

    const params = new URLSearchParams({
      amount:      String(amount),
      addInfo:     description,
      accountName: accountName ?? '',
    });

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Xác thực chữ ký webhook từ VietQR bằng HMAC-SHA256.
   * VietQR ký payload bằng API Key — ta so sánh hash để tránh giả mạo.
   *
   * @param payload    Raw body của webhook request (object)
   * @param signature  Giá trị header x-signature gửi từ VietQR
   */
  verifyWebhookSignature(payload: Record<string, any>, signature: string): boolean {
    const apiKey = this.configService.get<string>('vietqr.apiKey');
    if (!apiKey) {
      this.logger.warn('VIETQR_API_KEY chưa được cấu hình — bỏ qua xác thực signature.');
      return false;
    }

    try {
      // Serialize payload theo thứ tự key alphabet để đảm bảo deterministic
      const sortedPayload = JSON.stringify(
        Object.fromEntries(Object.entries(payload).sort()),
      );

      const expectedSignature = crypto
        .createHmac('sha256', apiKey)
        .update(sortedPayload)
        .digest('hex');

      // timingSafeEqual tránh timing attack
      const expected = Buffer.from(expectedSignature, 'hex');
      const received = Buffer.from(signature, 'hex');

      if (expected.length !== received.length) return false;
      return crypto.timingSafeEqual(expected, received);
    } catch {
      this.logger.error('Lỗi khi xác thực webhook signature.');
      return false;
    }
  }
}
