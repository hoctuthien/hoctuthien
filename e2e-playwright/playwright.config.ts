import { defineConfig } from '@playwright/test';
import path from 'path';
import dotenv from 'dotenv';

// Nạp DATABASE_URL/... từ backend/.env — cần cho tests/support/payments.ts, vốn
// phải patch trực tiếp DB để mô phỏng cron xác nhận giao dịch ngân hàng (không có
// cách nào kích hoạt một giao dịch VietQR thật trong môi trường E2E).
dotenv.config({ path: path.resolve(__dirname, '../backend/.env'), quiet: true });

// Lưu ý: baseURL PHẢI có dấu "/" cuối, và mọi path gọi trong test PHẢI KHÔNG có
// dấu "/" đầu (dùng 'auths/login' thay vì '/auths/login') — nếu không, URL() sẽ
// coi path bắt đầu bằng "/" là tuyệt đối và bỏ mất phần /api/v1 của baseURL.
const rawBaseUrl = process.env.API_BASE_URL || 'http://localhost:5050/api/v1';
export const BASE_URL = rawBaseUrl.endsWith('/') ? rawBaseUrl : `${rawBaseUrl}/`;

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  // Các luồng nghiệp vụ đa bước (đăng ký -> duyệt mentor -> tạo course -> booking...)
  // phải chạy tuần tự trong cùng 1 file, và fully-parallel giữa các file để tăng tốc
  // mà không đụng chung state (mỗi luồng dùng email/timestamp riêng).
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],
  use: {
    baseURL: BASE_URL,
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
    },
    trace: 'retain-on-failure',
  },
});
