import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class VietqrService {
  private readonly logger = new Logger(VietqrService.name);

  constructor(private readonly configService: ConfigService) { }

  // Sinh URL QR theo chuẩn VietQR Quick Link — không cần gọi API VietQR
  generateQrUrl(amount: number, description: string): string {
    const bankCode = this.configService.get<string>('vietqr.bankCode');
    const accountNo = this.configService.get<string>('vietqr.accountNo');
    const accountName = this.configService.get<string>('vietqr.accountName');

    const baseUrl = `https://img.vietqr.io/image/${bankCode}-${accountNo}-compact2.png`;

    const params = new URLSearchParams({
      amount: String(amount),
      addInfo: description,
      accountName: accountName ?? '',
    });

    return `${baseUrl}?${params.toString()}`;
  }

}
