import React, { Suspense } from 'react';
import { MentorshipFilters } from './components/MentorshipFilters';
import { MentorsGridList } from './components/MentorsGridList';
import { MentorsGridSkeleton } from './components/MentorsGridSkeleton';
import { getTranslations } from 'next-intl/server';

interface MentorshipPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    skills?: string;
    minExperience?: string;
  }>;
}

export default async function MentorshipPage({ searchParams }: MentorshipPageProps) {
  const tExtracted = await getTranslations('Extracted.appPublicMentorshipPage');
  const params = await searchParams;
  const t = await getTranslations('Common');

  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="container-custom">
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <p className="font-bold text-primary uppercase tracking-widest text-xs">
            {t('mentorship') || tExtracted('mentorship')}
          </p>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            {tExtracted('meetOurProfessionalMentors')}</h1>
          <p className="text-slate-500 text-sm md:text-base leading-relaxed">
            {tExtracted('learnFromIndustryExpertsGetCareerGuidanceAnd')}</p>
        </div>

        {/* Filters (Client Component) */}
        <MentorshipFilters />

        {/* Mentors Grid (Server Component with skeleton fallback) */}
        <Suspense key={JSON.stringify(params)} fallback={<MentorsGridSkeleton />}>
          <MentorsGridList searchParams={params} />
        </Suspense>
      </div>
    </div>
  );
}
