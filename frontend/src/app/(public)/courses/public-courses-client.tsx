"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Breadcrumb, EmptyState } from "@shared";
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@/core/ui";
import { 
  LuSearch, 
  LuPlus, 
  LuStar, 
  LuSlidersHorizontal,
  LuAward,
  LuGraduationCap,
  LuX,
  LuChevronDown
} from "react-icons/lu";

// Interface for Expert Mentors
interface Mentor {
  id: string;
  name: string;
  title: string;
  description: string;
  avatar: string;
  rating: number;
  sessions: number;
  impactRate: number;
  tags: string[];
  level: string;
  duration: string;
  format: string;
}

// Interface for PhD Mentors
interface PhDMentor {
  id: string;
  name: string;
  university: string;
  major: string;
  quote: string;
  badge: string;
  avatar: string;
}

export default function PublicCoursesClient() {
  const { data: session } = useSession();

  // State for search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("All Topics");
  const [academicLevel, setAcademicLevel] = useState("all");
  const [durationFilter, setDurationFilter] = useState("all");
  const [formatFilter, setFormatFilter] = useState("all");

  // Check if any filter is active
  const isFilterActive =
    searchQuery !== "" ||
    selectedTag !== "All Topics" ||
    academicLevel !== "all" ||
    durationFilter !== "all" ||
    formatFilter !== "all";

  // Reset all filters to default
  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedTag("All Topics");
    setAcademicLevel("all");
    setDurationFilter("all");
    setFormatFilter("all");
  };

  // Quick Tags matching the mockup
  const quickTags = [
    "All Topics",
    "Journalism",
    "Digital Media",
    "Creative Writing",
    "Ethics"
  ];

  // Mock Mentor Data matching the mockup perfectly
  const mentors: Mentor[] = [
    {
      id: "mentor-1",
      name: "Le Minh Trang",
      title: "Senior Product Designer @ Techflow",
      description: "Helping aspiring designers master visual hierarchy and user-centric systems through practical, real-world scholarship programs.",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80",
      rating: 4.9,
      sessions: 142,
      impactRate: 100,
      tags: ["UI/UX Design", "Creative Writing"],
      level: "intermediate",
      duration: "medium",
      format: "online"
    },
    {
      id: "mentor-2",
      name: "Marcus Aurelius",
      title: "Executive Editor @ Global News",
      description: "Strategic journalism mentor specializing in ethical reporting and digital-first narrative construction for global audiences.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
      rating: 5.0,
      sessions: 89,
      impactRate: 100,
      tags: ["Journalism", "Ethics"],
      level: "advanced",
      duration: "long",
      format: "offline"
    },
    {
      id: "mentor-3",
      name: "Sophia Chen",
      title: "Lead Developer @ Innovation Lab",
      description: "Bridge the gap between academic theory and industry engineering practices. Specializing in cloud architecture and system design.",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80",
      rating: 4.8,
      sessions: 215,
      impactRate: 100,
      tags: ["Digital Media", "UI/UX Design"],
      level: "beginner",
      duration: "short",
      format: "hybrid"
    }
  ];

  // Mock PhD Mentors Data matching the mockup perfectly
  const phdMentors: PhDMentor[] = [
    {
      id: "phd-1",
      name: "Dr. Sarah Chen",
      university: "Harvard University",
      major: "Economics",
      quote: "Education is the most powerful tool which you can use to change the world. Mentorship ensures no one uses it alone.",
      badge: "VERIFIED SCHOLAR",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80"
    },
    {
      id: "phd-2",
      name: "Prof. Julian Vance",
      university: "Oxford University",
      major: "Philosophy",
      quote: "Critical thinking is a communal art. My goal is to help students find their voice through deep analytical inquiry.",
      badge: "VERIFIED SCHOLAR",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80"
    },
    {
      id: "phd-3",
      name: "Dr. Elena Rodriguez",
      university: "Stanford University",
      major: "AI Ethics",
      quote: "Technology needs humanity. I mentor to ensure future leaders build with empathy and purpose.",
      badge: "VERIFIED SCHOLAR",
      avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=150&q=80"
    }
  ];

  // Options for dropdowns matching the mockup placeholders
  const academicLevelOptions = [
    { label: "Academic Level", value: "all" },
    { label: "Beginner", value: "beginner" },
    { label: "Intermediate", value: "intermediate" },
    { label: "Advanced", value: "advanced" }
  ];

  const durationOptions = [
    { label: "Duration", value: "all" },
    { label: "Under 1 hour (Short)", value: "short" },
    { label: "1 - 3 hours (Medium)", value: "medium" },
    { label: "Over 3 hours (Long)", value: "long" }
  ];

  const formatOptions = [
    { label: "Format", value: "all" },
    { label: "Online", value: "online" },
    { label: "Hybrid", value: "hybrid" },
    { label: "Offline", value: "offline" }
  ];

  // Filter experts based on Search, Tags & Dropdowns
  const filteredMentors = mentors.filter((mentor) => {
    // 1. Search Query
    const matchesSearch = 
      mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    // 2. Tag Pill Filter
    const matchesTag = 
      selectedTag === "All Topics" || 
      mentor.tags.includes(selectedTag);

    // 3. Dropdowns
    const matchesLevel = academicLevel === "all" || mentor.level === academicLevel;
    const matchesDuration = durationFilter === "all" || mentor.duration === durationFilter;
    const matchesFormat = formatFilter === "all" || mentor.format === formatFilter;

    return matchesSearch && matchesTag && matchesLevel && matchesDuration && matchesFormat;
  });

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Mentors", href: "#" },
    { label: "Curriculum Lists" },
  ];

  return (
    <div className="w-full bg-[#FAFBFD] min-h-screen py-8 px-4 md:px-8 font-sans overflow-x-hidden">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        
        {/* Top Breadcrumb */}
        <div className="flex flex-col gap-3">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {/* 1. Hero Section - EXACT MATCH WITH MOCKUP */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-6">
          {/* Left Text Column */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <span className="text-[#2563eb] text-[12px] font-black uppercase tracking-[0.15em] flex items-center gap-1">
               INSTITUTIONAL LEARNING
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-[56px] font-black text-[#0F172A] leading-[1.1] tracking-tight">
              Empowering the <span className="text-[#2563eb]">Next Generation</span> of Voice
            </h1>
            <p className="text-[#64748b] text-base leading-relaxed font-medium">
              The Editorial Exchange provides comprehensive curriculum sets and mentor-led workshops designed specifically for university-level journalism and creative writing departments.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-4">
              <Button
                variant="primary"
                label="Start Your Journey"
                size="lg"
                className="rounded-full font-black text-sm px-8 hover:scale-[1.02] active:scale-95 transition-transform select-none cursor-pointer"
              />
              <Button
                variant="outline"
                label="View Curriculum"
                size="lg"
                className="rounded-full font-bold text-sm px-8 border-[#CBD5E1] text-[#2563eb] hover:bg-slate-50 hover:scale-[1.02] active:scale-95 transition-transform select-none cursor-pointer"
              />
            </div>
          </div>

          {/* Right Image & Badge Column */}
          <div className="lg:col-span-6 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[500px] aspect-[4/3] rounded-[32px] overflow-hidden shadow-2xl border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=800&auto=format&fit=crop"
                alt="University library classroom lecture hall"
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
              />
            </div>
            
            {/* Overlapping Blue Badge Card */}
            <div className="absolute -bottom-6 left-6 sm:left-10 md:left-12 bg-[#2563eb] text-white p-6 rounded-[24px] shadow-2xl max-w-[200px] border border-blue-400/20 flex flex-col gap-1 z-10">
              <span className="text-4xl font-black tracking-tight leading-none">40+</span>
              <span className="text-[11px] text-blue-100 font-bold uppercase tracking-wider mt-1 block">
                Global College<br />Partnered in 2026
              </span>
            </div>
          </div>

        </div>

        {/* 2. Search & Quick Filters - REUSING SYSTEM DROPDOWNS & ROUNDED PILLS */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-6 rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.02)] mt-8 flex flex-col gap-6">
          {/* Top Row: Search & Tags & Button */}
          <div className="flex flex-col xl:flex-row items-center gap-4 md:gap-5 w-full">
            {/* Search Input */}
            <div className="relative w-full xl:w-[380px] 2xl:w-[420px]">
              <LuSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={18} />
              <input
                type="text"
                placeholder="Search curriculum, modules, artworks or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#E2E8F0] rounded-full outline-none focus:border-[#2563eb] focus:ring-4 focus:ring-blue-50 text-sm font-medium transition-all"
              />
            </div>

            {/* Quick Filter Topic Pills */}
            <div className="flex flex-nowrap xl:flex-wrap items-center gap-2 flex-1 w-full overflow-x-auto pb-1 xl:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {quickTags.map((tag) => {
                const isActive = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? "bg-[#2563eb] text-white shadow-sm shadow-blue-500/15"
                        : "bg-white border border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5F9]"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>

            {/* Action Create Course Button (ONLY SHOW FOR MENTOR ROLE) */}
            {session?.user?.role === "mentor" && (
              <Link href="/courses/create" className="cursor-pointer whitespace-nowrap w-full xl:w-auto">
                <Button
                  variant="primary"
                  label={
                    <div className="flex items-center gap-2 justify-center">
                      <LuPlus size={16} />
                      <span>Create new course</span>
                    </div>
                  }
                  size="md"
                  className="rounded-2xl font-extrabold text-xs shadow-md shadow-primary/10 w-full xl:w-auto cursor-pointer animate-in fade-in duration-200"
                />
              </Link>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-[#E2E8F0] w-full" />

          {/* Bottom Row: Selection Filters (REFINE BY) - EXACT FIGMA PILL DROPDOWNS */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full lg:w-auto">
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[11px] font-black text-[#94A3B8] tracking-[0.2em] uppercase block sm:inline">
                  REFINE BY:
                </span>
                {isFilterActive && (
                  <button
                    onClick={clearAllFilters}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 rounded-lg text-[10px] font-black transition-all cursor-pointer border border-red-100 animate-in fade-in duration-200"
                    title="Clear all filters"
                  >
                    <LuX size={10} strokeWidth={3} />
                    <span>Clear Filters</span>
                  </button>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                {/* Academic Level Dropdown */}
                <Dropdown>
                  <DropdownTrigger variant="secondary" hideIcon={true} className="bg-white border border-[#E2E8F0] hover:border-[#2563eb] text-xs font-bold text-[#475569] rounded-full h-[40px] px-5 flex items-center justify-between gap-2 shadow-sm cursor-pointer min-w-[145px] transition-colors">
                    <span className="truncate">
                      {academicLevel === "all" ? "Academic Level" : academicLevelOptions.find(o => o.value === academicLevel)?.label}
                    </span>
                    <LuChevronDown className="text-slate-400 flex-shrink-0" size={14} />
                  </DropdownTrigger>
                  <DropdownMenu className="rounded-xl border border-slate-100 shadow-xl mt-1 z-50">
                    {academicLevelOptions.map((opt) => (
                      <DropdownItem
                        key={opt.value}
                        isActive={academicLevel === opt.value}
                        onClick={() => setAcademicLevel(opt.value)}
                        className="text-xs"
                      >
                        {opt.label}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>

                {/* Duration Dropdown */}
                <Dropdown>
                  <DropdownTrigger variant="secondary" hideIcon={true} className="bg-white border border-[#E2E8F0] hover:border-[#2563eb] text-xs font-bold text-[#475569] rounded-full h-[40px] px-5 flex items-center justify-between gap-2 shadow-sm cursor-pointer min-w-[120px] transition-colors">
                    <span className="truncate">
                      {durationFilter === "all" ? "Duration" : durationOptions.find(o => o.value === durationFilter)?.label}
                    </span>
                    <LuChevronDown className="text-slate-400 flex-shrink-0" size={14} />
                  </DropdownTrigger>
                  <DropdownMenu className="rounded-xl border border-slate-100 shadow-xl mt-1 z-50">
                    {durationOptions.map((opt) => (
                      <DropdownItem
                        key={opt.value}
                        isActive={durationFilter === opt.value}
                        onClick={() => setDurationFilter(opt.value)}
                        className="text-xs"
                      >
                        {opt.label}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>

                {/* Format Dropdown */}
                <Dropdown>
                  <DropdownTrigger variant="secondary" hideIcon={true} className="bg-white border border-[#E2E8F0] hover:border-[#2563eb] text-xs font-bold text-[#475569] rounded-full h-[40px] px-5 flex items-center justify-between gap-2 shadow-sm cursor-pointer min-w-[110px] transition-colors">
                    <span className="truncate">
                      {formatFilter === "all" ? "Format" : formatOptions.find(o => o.value === formatFilter)?.label}
                    </span>
                    <LuChevronDown className="text-slate-400 flex-shrink-0" size={14} />
                  </DropdownTrigger>
                  <DropdownMenu className="rounded-xl border border-slate-100 shadow-xl mt-1 z-50">
                    {formatOptions.map((opt) => (
                      <DropdownItem
                        key={opt.value}
                        isActive={formatFilter === opt.value}
                        onClick={() => setFormatFilter(opt.value)}
                        className="text-xs"
                      >
                        {opt.label}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>

            {/* Advanced Filter Trigger Button */}
            <button className="flex items-center gap-1.5 text-xs font-black text-[#2563eb] hover:text-[#1d4ed8] transition-colors cursor-pointer self-start lg:self-auto mt-2 lg:mt-0">
              <LuSlidersHorizontal size={14} />
              <span>Advanced Filters</span>
            </button>
          </div>

        </div>

        {/* 3. Top Experts Section - EXACT FIGMA MATCH */}
        <div className="flex flex-col gap-6 mt-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#F1F5F9] pb-4">
            <div className="flex flex-col gap-1">
              <span className="text-[#2563eb] text-[10px] font-black uppercase tracking-[0.2em]">
                TOP EXPERTS
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-[#0F172A] tracking-tight">
                Curated Paths for Eycellence
              </h2>
            </div>
            <span className="text-xs font-bold text-[#64748b]">
              Showing 128 verified mentors
            </span>
          </div>

          {filteredMentors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-6 pt-10">
              {filteredMentors.map((mentor) => {
                const borderGradients: Record<string, string> = {
                  "mentor-1": "from-cyan-400 to-[#2563eb]",
                  "mentor-2": "from-amber-400 to-amber-600",
                  "mentor-3": "from-rose-400 to-indigo-500",
                };
                const borderGradient = borderGradients[mentor.id] || "from-slate-200 to-slate-400";
                return (
                  <div 
                    key={mentor.id} 
                    className="bg-white rounded-[28px] p-6 pt-12 pb-6 shadow-[0_12px_35px_rgba(0,0,0,0.02)] border border-slate-100/90 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between relative min-h-[385px] group"
                  >
                    <div>
                      {/* Overlapping Avatar */}
                      <div className={`absolute -top-10 left-6 w-[76px] h-[76px] rounded-[24px] bg-gradient-to-tr ${borderGradient} p-[3px] shadow-md transition-transform duration-300 group-hover:scale-105`}>
                        <div className="relative w-full h-full rounded-[21px] overflow-hidden bg-white">
                          <img
                            src={mentor.avatar}
                            alt={mentor.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="absolute bottom-0 right-0 w-4 h-4 bg-[#10B981] border-2 border-white rounded-full" />
                      </div>
                      
                      {/* Rating Badge */}
                      <div className="absolute top-4 right-6 flex items-center gap-1 bg-[#FFFBEB] text-[#B45309] px-2.5 py-1 rounded-full text-xs font-black shadow-sm border border-amber-100/40">
                        <LuStar size={12} className="fill-amber-500 text-amber-500" />
                        <span>{mentor.rating.toFixed(1)}</span>
                      </div>

                      {/* Name & Title */}
                      <div className="flex flex-col gap-1 mb-3">
                        <h4 className="text-lg font-black text-[#0F172A] tracking-tight leading-tight">
                          {mentor.name}
                        </h4>
                        <p className="text-[11px] text-[#2563eb] font-extrabold leading-normal uppercase tracking-wider">
                          {mentor.title}
                        </p>
                      </div>

                      {/* Description */}
                      <p className="text-[13px] leading-relaxed text-[#475569] font-medium mb-4 min-h-[56px] line-clamp-3">
                        {mentor.description}
                      </p>
                    </div>

                    {/* Stats & View Profile */}
                    <div>
                      <div className="grid grid-cols-2 gap-4 border-t border-[#F1F5F9] pt-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sessions</span>
                          <span className="text-[13px] font-extrabold text-slate-800">{mentor.sessions} completed</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Donation Rate</span>
                          <span className="text-[13px] font-black text-[#10B981]">{mentor.impactRate}% impact</span>
                        </div>
                      </div>

                      {/* View Profile Button using Core Button styling */}
                      <div className="mt-5">
                        <Button
                          variant="text"
                          label="View Profile"
                          className="w-full bg-[#E2E8F0]/50 hover:bg-[#E2E8F0] hover:no-underline text-[#1E3A8A] font-extrabold text-xs py-3.5 rounded-xl uppercase tracking-wider text-center cursor-pointer active:scale-[0.98] transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12">
              <EmptyState
                icon={<LuGraduationCap size={48} className="text-slate-400" />}
                title="No mentors found"
                description="We couldn't find any mentors matching your filters. Try clearing your filters or using different keywords."
                actionText="Clear Filters"
                onAction={clearAllFilters}
              />
            </div>
          )}
        </div>

        {/* 4. PhD Mentors Section - EXACT FIGMA MATCH WRAPPING CONTAINER & BUTTON */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0]/65 rounded-[32px] p-8 md:p-10 mt-10">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#E2E8F0] pb-6 mb-8">
            <div className="flex flex-col gap-2 max-w-2xl">
              <h2 className="text-2xl md:text-3xl font-black text-[#0F172A] tracking-tight leading-tight">
                Learn from Ph.D. Mentors from the World's Top Institutions
              </h2>
              <p className="text-[#64748b] text-sm font-medium">
                Connect with academic leaders and researchers from Ivy League and prestigious global universities who dedicate their expertise to student growth.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Button
                variant="outline"
                label="Meet All Mentors"
                className="rounded-full bg-white border-[#CBD5E1] text-[#2563eb] font-bold hover:bg-slate-50 text-sm py-3.5 px-6 shadow-sm cursor-pointer active:scale-[0.98] transition-all"
              />
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {phdMentors.map((phd) => (
              <div 
                key={phd.id} 
                className="bg-white rounded-[28px] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.015)] border border-slate-100/90 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col justify-between gap-6"
              >
                <div className="flex flex-col gap-4">
                  {/* Title & Affiliations */}
                  <div className="flex flex-col gap-1">
                    <h4 className="text-lg font-black text-[#0F172A] tracking-tight">
                      {phd.name}
                    </h4>
                    <p className="text-xs text-[#2563eb] font-bold tracking-wide">
                      {phd.university} • {phd.major}
                    </p>
                  </div>

                  {/* Quote Paragraph */}
                  <p className="text-[13px] leading-relaxed text-[#475569] font-medium italic">
                    "{phd.quote}"
                  </p>
                </div>

                {/* Bottom Scholar Badge */}
                <div className="flex items-center gap-1.5 text-[10px] font-black text-[#64748b] tracking-wider uppercase">
                  <svg className="w-4 h-4 text-[#2563eb] fill-blue-50/50 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <span>{phd.badge}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
