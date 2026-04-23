import { registerAs } from '@nestjs/config';

/**
 * Config cho Thiện Nguyện App API.
 * API này public — không cần authentication header.
 * Dùng để query lịch sử giao dịch theo số tài khoản.
 */
export const tnAppConfig = registerAs('tnApp', () => ({
  baseUrl: 'https://apiv2.thiennguyen.app/api/v2',

  // Số tài khoản ngân hàng thật của tổ chức — dùng để query giao dịch TN App
  accountNo: process.env.TN_APP_ACCOUNT_NO ?? '2022',
}));

export type TnAppConfig = ReturnType<typeof tnAppConfig>;
