import { useTranslations } from 'next-intl';
import React from "react";
import Link from "next/link";
import { MentorCard } from "@/shared/components/MentorCard";
import { Button } from "@/core/ui";

interface ExpertMentor {
  id: string;
  name: string;
  title: string;
  description: string;
  avatar: string;
  userId?: string;
}

const MOCK_EXPERTS: ExpertMentor[] = [
  {
    id: "mentor-1",
    name: "Le Minh Trang",
    title: "Senior Product Designer @ Techflow",
    description:
      "Helping aspiring designers master visual hierarchy and user-centric systems through practical, real-world scholarship programs.",
    avatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80",
  },
  {
    id: "mentor-2",
    name: "Marcus Aurelius",
    title: "Executive Editor @ Global News",
    description:
      "Strategic journalism mentor specializing in ethical reporting and digital-first narrative construction for global audiences.",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
  },
  {
    id: "mentor-3",
    name: "Sophia Chen",
    title: "Lead Developer @ Innovation Lab",
    description:
      "Bridge the gap between academic theory and industry engineering. Specializing in cloud architecture and system design.",
    avatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80",
  },
];

export const ExpertMentorsSection = () => {
  const tExtracted = useTranslations('Extracted.appPublicCoursesComponentsExpertMentorsSection');
  return (
    <div className="flex flex-col gap-6">
      {/* Section header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex flex-col gap-1">
          <span className="text-primary text-[10px] font-black uppercase tracking-[0.2em]">
            {tExtracted('topExperts')}</span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            {tExtracted('mentorNoiBat')}</h2>
        </div>
        <Link 
          href="/mentorship" 
          className="shrink-0 inline-flex items-center justify-center gap-2 font-[Montserrat] rounded-full transition-all duration-300 outline-none select-none hover:cursor-pointer bg-transparent text-primary border-slate-200 border-2 hover:border-primary/40 hover:bg-primary/5 active:scale-95 text-sm px-8 py-3 h-12 hover:no-underline font-bold"
        >
          <span className="leading-tight">{tExtracted('xemTatCa')}</span>
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_EXPERTS.map((mentor) => (
          <div key={mentor.id} className="flex justify-center">
            <MentorCard
              name={mentor.name}
              title={mentor.title}
              description={mentor.description}
              avatarSrc={mentor.avatar}
              onConnect={() => {}}
              onProfile={() => {}}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
