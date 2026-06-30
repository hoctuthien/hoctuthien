import { getTranslations } from 'next-intl/server';
import React from 'react';
import { mentorGateway } from '@/core/gateway';
import { MentorCard } from './MentorCard';
import { MentorshipPagination } from './MentorshipPagination';
import { Icon } from '@/core/ui';

interface MentorsGridListProps {
  searchParams: {
    page?: string;
    search?: string;
    skills?: string;
    minExperience?: string;
  };
}

export const MentorsGridList = async ({ searchParams }: MentorsGridListProps) => {
  const tExtracted = await getTranslations('Extracted.appPublicMentorshipComponentsMentorsGridList');
  const page = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  const search = searchParams.search || undefined;
  const skills = searchParams.skills || undefined;
  const minExperience = searchParams.minExperience ? parseInt(searchParams.minExperience, 10) : undefined;

  let mentorsData: any[] = [];
  let meta = { total: 0, page: 1, limit: 9, totalPages: 0 };

  try {
    const res = await mentorGateway.getAllMentorProfiles({
      page,
      limit: 9,
      search,
      skills,
      minExperience,
    });
    // res = { data: [...], meta: {...}, error: null }
    mentorsData = res.data || [];
    if (res.meta) meta = res.meta;
  } catch (error) {
    console.error("Error fetching public mentors:", error);
  }

  if (mentorsData.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <Icon name="Users" size={48} className="mx-auto text-slate-300 mb-4" />
        <h3 className="text-lg font-bold text-slate-800">{tExtracted('noMentorsFound')}</h3>
        <p className="text-slate-500 text-sm mt-1">{tExtracted('tryAdjustingYourFiltersOrSearchKeywords')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {mentorsData.map((mentor: any) => (
          <MentorCard key={mentor.id} mentor={mentor} />
        ))}
      </div>

      <MentorshipPagination
        meta={meta}
        currentPage={page}
        searchParams={searchParams as any}
        itemsLength={mentorsData.length}
      />
    </div>
  );
};

