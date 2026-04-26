import { registerAs } from '@nestjs/config';

export const vietqrConfig = registerAs('vietqr', () => ({
  // VietQR API credentials
  clientId: process.env.VIETQR_CLIENT_ID || '',
  apiKey: process.env.VIETQR_API_KEY || '',

  // Thông tin tài khoản ngân hàng nhận tiền
  bankCode: 970422,
  accountNo: 2022,
  accountName: 'HOI CHU THAP DO VIET NAM',

  // VietQR public API endpoint
  apiUrl: process.env.VIETQR_API_URL || 'https://api.vietqr.io/v2',

  // Thời gian QR hết hạn (tính bằng phút, mặc định 15 phút)
  qrExpiryMinutes: 1,
}));

export type VietQRConfig = ReturnType<typeof vietqrConfig>;
