import React from "react";
import Link from "next/link";
import { Button } from "@/core/ui";

interface PhDMentor {
  id: string;
  name: string;
  university: string;
  major: string;
  quote: string;
  avatar: string;
}

const PHD_MENTORS: PhDMentor[] = [
  {
    id: "phd-1",
    name: "Dr. Sarah Chen",
    university: "Harvard University",
    major: "Economics",
    quote:
      "Education is the most powerful tool to change the world. Mentorship ensures no one uses it alone.",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
  },
  {
    id: "phd-2",
    name: "Prof. Julian Vance",
    university: "Oxford University",
    major: "Philosophy",
    quote:
      "Critical thinking is a communal art. My goal is to help students find their voice through deep analytical inquiry.",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80",
  },
  {
    id: "phd-3",
    name: "Dr. Elena Rodriguez",
    university: "Stanford University",
    major: "AI Ethics",
    quote:
      "Technology needs humanity. I mentor to ensure future leaders build with empathy and purpose.",
    avatar:
      "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=150&q=80",
  },
];

const PhDCard = ({ phd }: { phd: PhDMentor }) => (
  <div className="bg-white rounded-3xl p-7 border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col gap-5">
    {/* Avatar + identity */}
    <div className="flex items-center gap-4">
      <img
        src={phd.avatar}
        alt={phd.name}
        className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100 shadow-sm flex-shrink-0"
      />
      <div className="flex flex-col gap-0.5 min-w-0">
        <h4 className="text-base font-black text-slate-900 leading-tight truncate">{phd.name}</h4>
        <p className="text-xs font-bold text-primary truncate">
          {phd.university} · {phd.major}
        </p>
      </div>
    </div>

    {/* Quote */}
    <blockquote className="text-sm text-slate-500 leading-relaxed italic font-medium border-l-2 border-primary/30 pl-4 flex-1">
      "{phd.quote}"
    </blockquote>

    {/* Badge */}
    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
      <svg
        className="w-4 h-4 text-primary flex-shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
      Verified Scholar
    </div>
  </div>
);

export const PhDMentorsSection = () => {
  return (
    <div className="bg-slate-50 rounded-3xl p-8 md:p-10 border border-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-6 mb-8 border-b border-slate-200">
        <div className="flex flex-col gap-2 max-w-xl">
          <span className="text-primary text-[10px] font-black uppercase tracking-[0.2em]">
            Academic Excellence
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
            Học từ các Tiến sĩ hàng đầu thế giới
          </h2>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            Kết nối với các nhà nghiên cứu và học giả từ các đại học danh tiếng toàn cầu.
          </p>
        </div>
        <Link href="/mentorship" className="shrink-0">
          <Button
            variant="outline"
            label="Gặp gỡ tất cả"
            size="md"
            className="rounded-full font-bold border-slate-200 bg-white hover:border-primary/40 shadow-sm"
          />
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PHD_MENTORS.map((phd) => (
          <PhDCard key={phd.id} phd={phd} />
        ))}
      </div>
    </div>
  );
};
