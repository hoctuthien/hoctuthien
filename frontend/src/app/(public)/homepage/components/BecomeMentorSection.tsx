'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Icon } from '@/core/ui/Icon';
import { Button } from '@/core/ui/Button';

export const BecomeMentorSection = () => {
  const t = useTranslations('Homepage');

  return (
    <section className="py-24 bg-primary relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

      <div className="container-custom relative z-10">
        <div className="bg-white/10 backdrop-blur-md rounded-[40px] p-8 md:p-16 border border-white/20 flex flex-col md:flex-row items-center justify-between gap-12 shadow-2xl">
          <div className="max-w-2xl text-center md:text-left">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-6">
              {t('becomeMentorTitle')}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              {t('becomeMentorHeading')}
            </h2>
            <p className="text-white/80 text-lg md:text-xl font-[Montserrat] mb-0 leading-relaxed">
              {t('becomeMentorDesc')}
            </p>
          </div>

          <div className="flex-shrink-0">
            <Link href="/mentor/register">
              <Button
                label={t('becomeMentorButton')}
                variant="primary"
                size="lg"
                className="bg-white text-primary hover:bg-slate-50 border-none px-12 h-[64px] text-lg rounded-2xl shadow-xl shadow-black/10 transition-transform active:scale-95"
                iconRight={<Icon name="ArrowRight" size={20} />}
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
