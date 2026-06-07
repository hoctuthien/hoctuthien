import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Card } from '@/core/ui/Card';
import { Icon } from '@/core/ui/Icon';
import { Button } from '@/core/ui/Button';
import { MOCK_INSTRUCTORS } from '@/shared/mocks/homepage.mock';
import Link from 'next/link';

interface InstructorTeamProps {
  initialMentors?: any[];
}

export const InstructorTeam = ({ initialMentors }: InstructorTeamProps) => {
  const t = useTranslations('Homepage');

  const mentorsList = (initialMentors && initialMentors.length > 0)
    ? initialMentors
    : MOCK_INSTRUCTORS;

  const instructors = mentorsList.map((ins) => {
    const name = ins.user?.name || ins.name || "Mentor";
    const role = ins.jobTitle || (
      ins.id === 'ins-1' ? t('mathExpert') :
      ins.id === 'ins-2' ? t('scienceResearcher') :
      ins.id === 'ins-3' ? t('globalHistorian') :
      t('financialAnalyst')
    );
    const image = ins.user?.avatarUrl || ins.avatarUrl || '/images/avatar_logo.png';
    return { name, role, image };
  });

  return (
    <section className="py-24 bg-white">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16">
          <div className="max-w-xl">
            <p className="font-bold text-primary uppercase tracking-widest text-sm mb-4">
              {t('instructorTitle')}
            </p>
            <h2 className="text-4xl lg:text-5xl font-bold text-text-heading leading-tight">
              {t('instructorHeading')}
            </h2>
          </div>
          <div className="flex gap-4">
            <button className="w-12 h-12 rounded-full border-2 border-outline-variant flex items-center justify-center text-text-muted hover:border-primary hover:text-primary transition-all active:scale-90">
              <Icon name="ChevronLeft" size={24} />
            </button>
            <button className="w-12 h-12 rounded-full border-2 border-outline-variant flex items-center justify-center text-text-muted hover:border-primary hover:text-primary transition-all active:scale-90">
              <Icon name="ChevronRight" size={24} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {instructors.map((instructor, idx) => (
            <Card key={idx} padding="none" variant="elevated" className="group">
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={instructor.image}
                  alt={instructor.name}
                  fill
                  className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-6 left-6 right-6 translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="flex justify-center gap-3">
                    {['Facebook', 'Twitter', 'Linkedin'].map((social) => (
                      <button key={social} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-primary transition-colors">
                        <Icon name={social as any} size={18} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-6 text-center">
                <h4 className="font-bold text-text-heading text-lg mb-1">{instructor.name}</h4>
                <p className="text-text-muted text-sm">{instructor.role}</p>
                <Button 
                  label={t('joinWithMe')} 
                  variant="outline" 
                  size="sm" 
                  className="mt-6 w-full rounded-full border-primary/20 hover:border-primary text-primary"
                />
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-16 flex justify-center">
          <Link href="/mentorship" className="no-underline">
            <Button 
              label={t('viewAllInstructors')} 
              variant="primary" 
              className="rounded-full px-10"
              iconRight={<Icon name="ArrowRight" size={18} />}
            />
          </Link>
        </div>
      </div>
    </section>
  );
};
