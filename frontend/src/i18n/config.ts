/**
 * I18n Configuration — Single source of truth cho locale settings.
 *
 * Flow: File này được import bởi:
 *   - `i18n/request.ts`  -- server load message file
 *   - `next.config.ts`   -- (tuong lai) locale-based routing
 *   - `middleware.ts`     -- (tuong lai) detect locale tu request
 *
 * Khi thêm ngôn ngữ mới:
 *   1. Thêm locale vào `locales` array
 *   2. Tạo file `messages/<locale>.json`
 *   3. Done — không cần sửa gì khác
 */

export const locales = ['vi'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'vi';

export const localeCookieName = 'NEXT_LOCALE';

export function isLocale(value: string | undefined): value is Locale {
  return locales.some((locale) => locale === value);
}
