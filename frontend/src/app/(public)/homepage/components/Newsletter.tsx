import React from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/core/ui/Button';
import { Avatar } from '@/core/ui/Avatar';


export const Newsletter = () => {
  const tExtracted = useTranslations('Extracted.appPublicHomepageComponentsNewsletter');
  const t = useTranslations('Homepage');
  const tCommon = useTranslations('Common');

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container-custom">
        <div className="relative bg-primary rounded-[40px] p-8 md:p-16 lg:p-24 flex flex-col lg:flex-row items-center justify-between gap-12 overflow-hidden shadow-2xl">
          {/* Background Circles Decoration */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/5 rounded-full border-[32px] border-white/5" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/5 rounded-full border-[48px] border-white/5" />

          {/* Left Content */}
          <div className="relative z-10 flex-1 text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-8 leading-tight">
              {t('newsletterHeading')}
            </h2>
            <p className="text-white/70 text-lg mb-10 max-w-md mx-auto lg:mx-0">
              {t('newsletterDesc')}
            </p>

            <div className="relative max-w-md mx-auto lg:mx-0">
              <input
                type="email"
                placeholder={tCommon('emailPlaceholder')}
                className="w-full h-16 pl-8 pr-40 rounded-full bg-white text-text-heading outline-none shadow-xl placeholder:text-text-muted focus:ring-4 focus:ring-white/20 transition-all"
              />
              <Button
                label={tCommon('subscribe')}
                variant="primary"
                className="absolute right-2 top-2 bottom-2 px-8 rounded-full shadow-lg"
              />
            </div>
          </div>

          {/* Right Decoration (Avatars) */}
          <div className="relative z-10 flex-shrink-0">
            <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
              {/* Central Avatar */}
              <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white overflow-hidden shadow-2xl z-20">
                <Avatar size="xl" name="Admin" className="w-full h-full border-0" />
              </div>

              {/* Orbiting Avatars */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 w-16 h-16 rounded-full border-4 border-white overflow-hidden shadow-xl z-10">
                <Avatar size="lg" name="User 1" className="w-full h-full border-0" />
              </div>
              <div className="absolute bottom-4 left-0 w-20 h-20 rounded-full border-4 border-white overflow-hidden shadow-xl z-10">
                <Avatar size="lg" name="User 2" className="w-full h-full border-0" />
              </div>
              <div className="absolute bottom-12 right-0 w-16 h-16 rounded-full border-4 border-white overflow-hidden shadow-xl z-10">
                <Avatar size="lg" name="User 3" className="w-full h-full border-0" />
              </div>

              {/* Decorative Rings */}
              <div className="absolute inset-0 border border-white/20 rounded-full animate-spin-slow" />
              <div className="absolute inset-8 border border-white/10 rounded-full animate-reverse-spin" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
