"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/core/ui/Card';
import { Icon } from '@/core/ui/Icon';
import { cn } from '@/core/utils/cn';
import { MOCK_CATEGORIES } from '@/shared/mocks/homepage.mock';

export const CourseCategories = () => {
  const t = useTranslations('Homepage');
  const tCommon = useTranslations('Common');

  const categories = MOCK_CATEGORIES.map(cat => ({
    icon: cat.iconUrl,
    title: cat.name,
    description: t(`${cat.slug}Desc` as any) || 'Master complex topics with expert guidance.',
    color: cat.slug === 'mathematics' ? 'bg-blue-50 text-blue-600 border-blue-100' :
           cat.slug === 'science' ? 'bg-green-50 text-green-600 border-green-100' :
           cat.slug === 'geography' ? 'bg-orange-50 text-orange-600 border-orange-100' :
           'bg-purple-50 text-purple-600 border-purple-100',
  }));

  const filters = [
    t('allCategories'),
    t('marketing'),
    t('design'),
    t('business'),
    t('technology'),
  ];
  const [activeFilter, setActiveFilter] = useState(t('allCategories'));

  return (
    <section className="py-24 bg-background">
      <div className="container-custom">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-text-heading mb-6">{t('premiumCourses')}</h2>
          <p className="text-text-muted leading-relaxed">
            {t('premiumCoursesDesc')}
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center lg:justify-center gap-3 mb-16 overflow-x-auto pb-4 no-scrollbar -mx-6 px-6">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "px-6 py-2.5 rounded-full text-sm font-bold transition-all border-2 whitespace-nowrap",
                activeFilter === filter
                  ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                  : "bg-white border-outline-variant text-text-muted hover:border-primary hover:text-primary"
              )}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category, idx) => (
            <Card
              key={idx}
              variant="elevated"
              className={cn(
                "group border-t-4 transition-all duration-500 hover:-translate-y-2",
                category.color.split(' ')[2] // Extracting border color
              )}
            >
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform",
                category.color.split(' ')[0], // Extracting background color
                category.color.split(' ')[1]  // Extracting text color
              )}>
                <Icon name={category.icon as any} size={32} />
              </div>
              <h3 className="text-xl font-bold text-text-heading mb-4 group-hover:text-primary transition-colors">
                {category.title}
              </h3>
              <p className="text-text-muted text-sm leading-relaxed mb-8">
                {category.description}
              </p>
              <button className="flex items-center gap-2 font-bold text-primary text-sm hover:gap-3 transition-all">
                {tCommon('learnMore')}
                <Icon name="ArrowRight" size={16} />
              </button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
