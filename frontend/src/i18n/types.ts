/**
 * TypeScript Augmentation cho next-intl.
 *
 * File này "dạy" TypeScript biết cấu trúc messages,
 * giúp bạn có autocomplete và type-checking cho translation keys.
 *
 * Ví dụ:
 *   t('Auth.signIn')      -> OK
 *   t('Auth.signInn')     -> TypeScript error
 *   t('Auth.')             -> Autocomplete hiện danh sách keys
 *
 * Import type từ messages/vi.json (source of truth cho key structure).
 * Tất cả locale khác phải có cùng structure với vi.json.
 */

import vi from '../../messages/vi.json';

type Messages = typeof vi;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface IntlMessages extends Messages {}
}
