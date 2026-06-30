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
import { cookies, headers } from 'next/headers';
import {
  defaultLocale,
  isLocale,
  localeCookieName,
  type Locale,
} from './config';

export default getRequestConfig(async () => {
  const cookieLocale = (await cookies()).get(localeCookieName)?.value;
  const acceptedLanguage = (await headers())
    .get('accept-language')
    ?.split(',')[0]
    ?.split('-')[0];
  const locale: Locale = isLocale(cookieLocale)
    ? cookieLocale
    : isLocale(acceptedLanguage)
      ? acceptedLanguage
      : defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
