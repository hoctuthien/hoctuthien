"use client";

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/core/ui/Button';
import { Card } from '@/core/ui/Card';
import { Icon } from '@/core/ui/Icon';

export const HeroSection = () => {
  const tExtracted = useTranslations('Extracted.appPublicHomepageComponentsHeroSection');
  const t = useTranslations('Homepage');
  const tCommon = useTranslations('Common');

  return (
    <section className="relative pt-16 pb-24 overflow-hidden bg-background">
      <div className="container-custom relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-fixed text-primary font-bold text-sm mb-6 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              {t('joinWithUs')}
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-text-heading mb-8 leading-[1.1]">
              {t('heroTitle1')}, <br />
              <span className="text-primary">{t('heroTitle2')}</span>
            </h1>
            <p className="text-lg text-text-muted mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {t('heroSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 w-full">
              <Link 
                href="/courses" 
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 font-[Montserrat] rounded-full transition-all duration-300 outline-none select-none hover:cursor-pointer bg-primary text-white font-bold shadow-[0_4px_6px_-4px_#005BBF,0_10px_15px_-3px_#005BBF] hover:bg-[#004493] hover:shadow-lg active:scale-95 text-base px-10 py-4 h-[56px] hover:no-underline"
              >
                <span className="leading-tight">{tCommon('getStarted')}</span>
              </Link>
              <Link 
                href="/mentor/register" 
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 font-[Montserrat] rounded-full transition-all duration-300 outline-none select-none hover:cursor-pointer bg-white text-primary border-primary border-2 hover:bg-primary/5 active:scale-95 text-base px-10 py-4 h-[56px] hover:no-underline"
              >
                <span className="leading-tight">{t('becomeMentorButton')}</span>
              </Link>
            </div>
          </div>

          {/* Right Image */}
          <div className="flex-1 relative">
            <div className="relative w-full aspect-[4/3] lg:aspect-square min-h-[300px] lg:min-h-0">
              {/* Background Decoration */}
              <div className="absolute -top-10 -right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-secondary/5 rounded-full blur-3xl" />

              {/* Main Image */}
              <div className="relative h-full rounded-[40px] overflow-hidden shadow-2xl border-8 border-white">
                <Image
                  src="/images/avatar_main.png"
                  alt={tExtracted('studentLearning')}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                  className="object-cover"
                />
              </div>

              {/* Floating Badge */}
              <Card
                variant="glass"
                padding="sm"
                className="hidden md:flex absolute bottom-10 -left-12 items-center gap-4 animate-bounce-slow z-20"
              >
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-white">
                  <Icon name="CheckCircle" size={24} />
                </div>
                <div>
                  <p className="font-bold text-text-heading text-sm">{t('topMentors')}</p>
                  <p className="text-text-muted text-xs">{t('expertGuidance')}</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
