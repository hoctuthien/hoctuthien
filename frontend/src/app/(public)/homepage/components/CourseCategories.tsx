"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Card } from '@/core/ui/Card';
import { Icon } from '@/core/ui/Icon';
import { cn } from '@/core/utils/cn';

type HomepageCategory = {
  id: string;
  name: string;
  slug?: string | null;
  metadata?: {
    icon?: string;
  } | null;
};

interface CourseCategoriesProps {
  categories: HomepageCategory[];
}

const categoryColors = [
  'bg-blue-50 text-blue-600 border-blue-100',
  'bg-green-50 text-green-600 border-green-100',
  'bg-orange-50 text-orange-600 border-orange-100',
  'bg-purple-50 text-purple-600 border-purple-100',
];

export const CourseCategories = ({ categories }: CourseCategoriesProps) => {
  const t = useTranslations('Homepage');
  const tCommon = useTranslations('Common');
  const [visibleCount, setVisibleCount] = useState(8);

  if (categories.length === 0) {
    return null;
  }

  const visibleCategories = categories.slice(0, visibleCount);
  const canShowMore = visibleCount < categories.length;

  return (
    <section className="py-24 bg-background">
      <div className="container-custom">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-text-heading mb-6">{t('premiumCourses')}</h2>
          <p className="text-text-muted leading-relaxed">{t('premiumCoursesDesc')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {visibleCategories.map((category, idx) => {
            const color = categoryColors[idx % categoryColors.length];
            const [backgroundClass, textClass, borderClass] = color.split(' ');

            return (
              <Link
                key={category.id}
                href={`/courses?categoryId=${category.id}`}
                className="no-underline"
              >
                <Card
                  variant="elevated"
                  className={cn(
                    'group h-full border-t-4 transition-all duration-500 hover:-translate-y-2',
                    borderClass,
                  )}
                >
                  <div
                    className={cn(
                      'w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform',
                      backgroundClass,
                      textClass,
                    )}
                  >
                    <Icon name={(category.metadata?.icon || 'BookOpen') as any} size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-text-heading mb-8 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <span className="flex items-center gap-2 font-bold text-primary text-sm group-hover:gap-3 transition-all">
                    {tCommon('learnMore')}
                    <Icon name="ArrowRight" size={16} />
                  </span>
                </Card>
              </Link>
            );
          })}
        </div>

        {canShowMore && (
          <div className="mt-12 flex justify-center">
            <button
              onClick={() => setVisibleCount(categories.length)}
              className="px-6 py-2.5 rounded-full text-sm font-bold transition-all border-2 bg-white border-outline-variant text-text-muted hover:border-primary hover:text-primary"
            >
              {t('allCategories')}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
