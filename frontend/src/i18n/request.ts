/**
 * I18n Request Configuration — Chạy trên SERVER cho mỗi request.
 *
 * Flow hoạt động:
 *   1. User gửi request đến Next.js server
 *   2. next-intl plugin gọi file này
 *   3. File này xác định locale (hiện tại: static 'vi')
 *   4. Load file `messages/<locale>.json` tương ứng
 *   5. Return { locale, messages } -- injected into React tree
 *   6. Tất cả Server Components có thể dùng `useTranslations()`
 *
 * Khi cần dynamic locale (tương lai):
 *   - Đọc từ cookie: `cookies().get('locale')?.value`
 *   - Read from URL: `/vi/about` -- locale = 'vi'
 *   - Đọc từ Accept-Language header
 */

import { getRequestConfig } from 'next-intl/server';
import { defaultLocale } from './config';

export default getRequestConfig(async () => {
  // Hiện tại dùng static locale.
  // Khi cần dynamic, thay dòng này bằng logic detect locale.
  const locale = defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
