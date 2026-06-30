import React from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/core/ui/Card';
import { Avatar } from '@/core/ui/Avatar';
import { Icon } from '@/core/ui/Icon';
import { MOCK_TESTIMONIALS } from '@/shared/mocks/homepage.mock';

export const Testimonials = () => {
  const tExtracted = useTranslations('Extracted.appPublicHomepageComponentsTestimonials');
  const t = useTranslations('Homepage');

  const testimonials = MOCK_TESTIMONIALS.map(rev => ({
    name: rev.userName,
    role: t('student'),
    image: rev.userAvatar || '/images/avatar_logo.png',
    rating: rev.rating,
    quote: rev.comment,
  }));

  return (
    <section className="py-24 bg-background">
      <div className="container-custom">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="font-bold text-primary uppercase tracking-widest text-sm mb-4">
            {t('testimonialsTitle')}
          </p>
          <h2 className="text-4xl lg:text-5xl font-bold text-text-heading mb-6">
            {t('testimonialsHeading')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <Card key={idx} variant="elevated" className="relative group">
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 text-primary/10 group-hover:text-primary/20 transition-colors">
                <Icon name="Quote" size={48} />
              </div>

              <div className="flex items-center gap-4 mb-6">
                <Avatar src={testimonial.image} size="md" name={testimonial.name} />
                <div>
                  <h4 className="font-bold text-text-heading">{testimonial.name}</h4>
                  <p className="text-text-muted text-xs">{testimonial.role}</p>
                </div>
              </div>

              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Icon
                    key={i}
                    name="Star"
                    size={16}
                    className={i < testimonial.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-200"}
                  />
                ))}
              </div>

              <p className="text-text-body italic leading-relaxed">
                "{testimonial.quote}"
              </p>
            </Card>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center">
          <div className="flex -space-x-4 mb-6">
            {["User 1", "User 2", "User 3", "User 4", "User 5"].map((name, i) => (
              <Avatar key={i} size="sm" name={name} className="border-2 border-white" />
            ))}
            <div className="w-8 h-8 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center border-2 border-white z-10">
              {tExtracted('text2k')}</div>
          </div>
          <p className="text-text-muted text-sm font-medium">
            {t('happyStudents')}
          </p>
        </div>
      </div>
    </section>
  );
};
