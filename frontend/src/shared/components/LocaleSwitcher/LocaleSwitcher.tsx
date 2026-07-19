"use client";

import React, { useTransition } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { localeCookieName } from '@/i18n/config';

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLocaleChange = (nextLocale: 'vi' | 'en') => {
    if (nextLocale === locale) return;

    startTransition(() => {
      // Set i18n cookie
      document.cookie = `${localeCookieName}=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
      // Reload route to apply locale changes
      router.refresh();
    });
  };

  const viLabel = 'VI';
  const enLabel = 'EN';

  return (
    <div className="flex items-center gap-1.5 rounded-full bg-slate-50 border border-slate-100 p-1 text-xs font-bold text-slate-500">
      <button
        type="button"
        onClick={() => handleLocaleChange('vi')}
        disabled={isPending}
        className={`px-2.5 py-1 rounded-full cursor-pointer transition-all ${
          locale === 'vi'
            ? 'bg-primary text-white shadow-sm'
            : 'hover:text-primary'
        }`}
      >
        {viLabel}
      </button>
      <button
        type="button"
        onClick={() => handleLocaleChange('en')}
        disabled={isPending}
        className={`px-2.5 py-1 rounded-full cursor-pointer transition-all ${
          locale === 'en'
            ? 'bg-primary text-white shadow-sm'
            : 'hover:text-primary'
        }`}
      >
        {enLabel}
      </button>
    </div>
  );
}
