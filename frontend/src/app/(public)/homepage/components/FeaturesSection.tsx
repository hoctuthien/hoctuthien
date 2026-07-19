import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/core/ui/Button';
import { Icon } from '@/core/ui/Icon';

export const FeaturesSection = () => {
  const tExtracted = useTranslations('Extracted.appPublicHomepageComponentsFeaturesSection');
  const t = useTranslations('Homepage');
  const tCommon = useTranslations('Common');

  const benefits = [
    {
      icon: 'Calendar',
      title: t('flexibleClasses'),
      description: t('flexibleDesc'),
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: 'DollarSign',
      title: t('affordablePrice'),
      description: t('affordableDesc'),
      color: 'bg-green-100 text-green-600',
    },
    {
      icon: 'Users',
      title: t('mentorship'),
      description: t('mentorshipDesc'),
      color: 'bg-purple-100 text-purple-600',
    },
    {
      icon: 'Clock',
      title: t('lifetimeAccess'),
      description: t('lifetimeDesc'),
      color: 'bg-orange-100 text-orange-600',
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container-custom">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          {/* Left Image */}
          <div className="flex-1 order-2 lg:order-1">
            <div className="relative aspect-[4/5] rounded-[40px] overflow-hidden shadow-xl group">
              <Image
                src="/images/login-background.jpg"
                alt={tExtracted('benefit')}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
            </div>
          </div>

          {/* Right Content */}
          <div className="flex-1 order-1 lg:order-2">
            <p className="font-bold text-primary uppercase tracking-widest text-sm mb-4">
              {t('benefitsTitle')}
            </p>
            <h2 className="text-4xl lg:text-5xl font-bold text-text-heading mb-8 leading-tight">
              {t('benefitsHeading')}
            </h2>
            <p className="text-text-muted mb-12 leading-relaxed">
              {t('benefitsDesc')}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {benefits.map((benefit, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center ${benefit.color}`}>
                    <Icon name={benefit.icon as any} size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-text-heading mb-1">{benefit.title}</h4>
                    <p className="text-text-muted text-sm leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link 
              href="/courses"
              className="inline-flex items-center justify-center gap-2 font-[Montserrat] rounded-full transition-all duration-300 outline-none select-none hover:cursor-pointer bg-primary text-white font-bold shadow-[0_4px_6px_-4px_#005BBF,0_10px_15px_-3px_#005BBF] hover:bg-[#004493] hover:shadow-lg active:scale-95 text-base px-8 py-3 h-12 hover:no-underline"
            >
              <span className="leading-tight">{tCommon('getStarted')}</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
