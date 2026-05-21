"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Breadcrumb, EmptyState } from "@shared";
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, InlineMessage } from "@/core/ui";
import { courseGateway } from "@/core/gateway";
import { MockCourse, mockMentorCourses } from "@/shared/mocks/mentorCourses.mock";
import { 
  LuSearch, 
  LuPlus, 
  LuStar, 
  LuSlidersHorizontal,
  LuAward,
  LuGraduationCap,
  LuX,
  LuChevronDown,
  LuBookOpen,
  LuUsers,
  LuTag,
  LuExternalLink
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

  // Live courses state
  const [courses, setCourses] = useState<MockCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("All Topics");
  const [academicLevel, setAcademicLevel] = useState("all");
  const [durationFilter, setDurationFilter] = useState("all");
  const [formatFilter, setFormatFilter] = useState("all");

  // Fetch courses from PostgreSQL via courseGateway
  useEffect(() => {
    async function loadCourses() {
      try {
        setLoading(true);
        const data = await courseGateway.getPublicCourses();
        setCourses(data);
        setError(null);
      } catch (err: any) {
        console.warn("Failed to load public courses from backend, falling back to mock data:", err);
        
        // Dùng danh sách mock làm fallback để giao diện luôn hiển thị đầy đủ khóa học
        const activeMocks = mockMentorCourses.filter(c => c.status === "published");
        setCourses(activeMocks);
        
        // Báo lỗi ngắn gọn cho Dev qua mã lỗi thô, người dùng thường nhìn vào chỉ thấy như mất mạng/bảo trì thông thường
        const rawMsg = err?.error?.message || err?.message || "";
        let errCode = "BE_ERR_CONN_FAILED";
        if (rawMsg.includes("Cannot GET") || err?.status === 404 || err?.error?.code === "NOT_FOUND") {
          errCode = "BE_ERR_404_COURSES";
        } else if (err?.status === 500) {
          errCode = "BE_ERR_500_SERVER";
        }
        
        setError(`Không thể tải dữ liệu mới từ máy chủ. Đang hiển thị danh sách khóa học dự phòng. (Mã lỗi: ${errCode})`);
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, []);

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

  // Hardcoded Topic Pills for UI stability
  const quickTags = ["All Topics", "Lập trình Web", "UI/UX Design", "Khoa học máy tính", "Lập trình di động"];

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

  // Filter courses based on Search, Tags & Dropdowns
  const filteredCourses = courses.filter((course) => {
    // Only show published/active courses on public page
    if (course.status !== "published") return false;

    // 1. Search Query
    const matchesSearch = 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category.toLowerCase().includes(searchQuery.toLowerCase());
      
    // 2. Tag Pill Filter
    const matchesTag = 
      selectedTag === "All Topics" || 
      course.category === selectedTag;

    // 3. Dropdowns (Simulated based on categories & course attributes for rich interactivity)
    let courseLevel = "beginner";
    let courseDuration = "short";
    let courseFormat = "online";

    if (course.category.includes("Web") || course.title.includes("Web") || course.title.includes("Next.js")) {
      courseLevel = "intermediate";
      courseDuration = "medium";
      courseFormat = "online";
    } else if (course.category.includes("Figma") || course.category.includes("Design") || course.title.includes("Figma")) {
      courseLevel = "beginner";
      courseDuration = "long";
      courseFormat = "online";
    } else if (course.category.includes("máy tính") || course.title.includes("thuật") || course.title.includes("TypeScript")) {
      courseLevel = "advanced";
      courseDuration = "medium";
      courseFormat = "offline";
    }

    const matchesLevel = academicLevel === "all" || courseLevel === academicLevel;
    const matchesDuration = durationFilter === "all" || courseDuration === durationFilter;
    const matchesFormat = formatFilter === "all" || courseFormat === formatFilter;

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
                KHÓA HỌC NỔI BẬT
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-[#0F172A] tracking-tight">
                Các Chương Trình Học Chất Lượng Cao
              </h2>
            </div>
            <span className="text-xs font-bold text-[#64748b]">
              {loading ? "Đang tải dữ liệu..." : `Hiển thị ${filteredCourses.length} khóa học`}
            </span>
          </div>

          {/* Premium Figma-style Backup Warning Banner */}
          {error && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-300 w-full">
              <div className="bg-white border border-amber-200/80 rounded-[20px] p-5 flex items-start gap-4 shadow-[0_10px_30px_rgba(245,158,11,0.02)]">
                <div className="p-2.5 bg-amber-50 rounded-xl text-amber-500 flex-shrink-0 border border-amber-100">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="text-[11px] font-black text-amber-800 uppercase tracking-widest">
                    Chế độ dữ phòng hoạt động
                  </h4>
                  <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            /* Loading skeletons matching the premium grid perfectly */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-[28px] border border-slate-100 p-6 flex flex-col gap-5 animate-pulse shadow-[0_12px_35px_rgba(0,0,0,0.01)] min-h-[380px]">
                  <div className="flex items-center justify-between gap-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-full" />
                    <div className="h-6 bg-slate-100 rounded-full w-12" />
                  </div>
                  <div className="flex flex-col gap-2 mt-2">
                    <div className="h-6 bg-slate-100 rounded w-5/6" />
                    <div className="h-4 bg-slate-100 rounded w-1/3" />
                  </div>
                  <div className="flex flex-col gap-2 mt-2">
                    <div className="h-3 bg-slate-100 rounded w-full" />
                    <div className="h-3 bg-slate-100 rounded w-full" />
                    <div className="h-3 bg-slate-100 rounded w-2/3" />
                  </div>
                  <div className="h-px bg-slate-100 w-full my-1 mt-auto" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-8 bg-slate-100 rounded" />
                    <div className="h-8 bg-slate-100 rounded" />
                  </div>
                  <div className="h-10 bg-slate-100 rounded-xl" />
                </div>
              ))}
            </div>
          ) : filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
              {filteredCourses.map((course) => {
                // Dynamically assign premium gradients based on category
                let gradientClass = "from-amber-400 to-orange-500";
                if (course.category.toLowerCase().includes("web")) {
                  gradientClass = "from-blue-500 to-cyan-400";
                } else if (course.category.toLowerCase().includes("design") || course.category.toLowerCase().includes("ui") || course.category.toLowerCase().includes("ux")) {
                  gradientClass = "from-purple-500 to-pink-500";
                } else if (course.category.toLowerCase().includes("máy tính") || course.category.toLowerCase().includes("khoa học")) {
                  gradientClass = "from-indigo-500 to-violet-600";
                }

                // Dynamic premium descriptive text matching the layout
                let courseDesc = "Chương trình đào tạo chất lượng cao được thiết kế bài bản bởi các chuyên gia thực chiến giúp bạn phát triển tư duy nhanh chóng.";
                if (course.title.toLowerCase().includes("react") || course.title.toLowerCase().includes("next.js")) {
                  courseDesc = "Làm chủ Next.js & React từ cơ bản đến nâng cao. Xây dựng ứng dụng web hiệu năng cao, tối ưu SEO cực đỉnh và sẵn sàng thực tế.";
                } else if (course.title.toLowerCase().includes("figma") || course.title.toLowerCase().includes("thiết kế")) {
                  courseDesc = "Thiết kế UI/UX đỉnh cao trên Figma. Nắm vững hệ thống thiết kế (Design Systems), wireframe phức tạp và cách làm việc nhóm.";
                } else if (course.title.toLowerCase().includes("cấu trúc") || course.title.toLowerCase().includes("thuật")) {
                  courseDesc = "Nâng cao tư duy thuật toán với cấu trúc dữ liệu và giải thuật kinh điển. Tối ưu hiệu năng ứng dụng Javascript thực chiến.";
                }

                return (
                  <div 
                    key={course.id} 
                    className="bg-white rounded-[28px] p-6 shadow-[0_12px_35px_rgba(0,0,0,0.015)] border border-slate-100/90 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col justify-between min-h-[380px] group"
                  >
                    <div className="flex flex-col gap-4">
                      {/* Top Avatar/Thumbnail & Rating row */}
                      <div className="flex items-center justify-between gap-4">
                        {/* Circular course thumbnail with glowing gradient ring */}
                        <div className="relative">
                          <div className={`w-16 h-16 rounded-full p-1 bg-gradient-to-tr ${gradientClass} shadow-md`}>
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className="w-full h-full object-cover rounded-full border-2 border-white bg-slate-50"
                            />
                          </div>
                          {/* Active visual indicator for published state */}
                          <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                        </div>

                        {/* Rating badge matching mockup exactly */}
                        <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full text-xs font-black border border-amber-100">
                          <LuStar size={12} className="fill-amber-500 text-amber-500" />
                          <span>{course.rating > 0 ? course.rating.toFixed(1) : "4.8"}</span>
                        </div>
                      </div>

                      {/* Course Identity */}
                      <div className="flex flex-col gap-1.5 mt-1">
                        <h3 className="text-[17px] font-black text-[#0F172A] tracking-tight group-hover:text-[#2563eb] transition-colors leading-snug line-clamp-2 min-h-[2.5rem] font-[Montserrat]">
                          {course.title}
                        </h3>
                        <span className="text-[10px] font-extrabold text-[#2563eb] tracking-wider uppercase">
                          {course.category} • ACADEMY COURSE
                        </span>
                      </div>

                      {/* Course Professional Description */}
                      <p className="text-[13px] leading-relaxed text-[#64748b] font-medium line-clamp-3">
                        {courseDesc}
                      </p>
                    </div>

                    <div>
                      <div className="h-px bg-slate-100 w-full my-4" />
                      
                      {/* Stats columns matching the exact mockup grid style */}
                      <div className="grid grid-cols-2 gap-4 text-[10px] text-[#94A3B8] font-black tracking-wider mb-5">
                        <div className="flex flex-col gap-0.5">
                          <span className="uppercase text-[9px]">HỌC VIÊN</span>
                          <span className="text-[#0F172A] text-sm font-black mt-0.5">
                            {course.studentsCount.toLocaleString("vi-VN")} completed
                          </span>
                        </div>
                        
                        <div className="flex flex-col gap-0.5">
                          <span className="uppercase text-[9px]">HỌC PHÍ</span>
                          <span className={`text-sm font-black mt-0.5 ${course.price === 0 ? "text-[#10B981]" : "text-blue-600"}`}>
                            {course.price === 0 ? "100% Free" : `${course.price.toLocaleString("vi-VN")}đ`}
                          </span>
                        </div>
                      </div>

                      {/* Wide View Details Button matching mockup exactly */}
                      <Link href={`/courses/detail/${course.id}`} className="block w-full cursor-pointer hover:no-underline">
                        <Button
                          variant="text"
                          label="Xem chi tiết"
                          className="w-full bg-[#F1F5F9]/70 hover:bg-[#E2E8F0] text-[#1E293B] font-extrabold text-xs py-3.5 rounded-xl uppercase tracking-wider text-center cursor-pointer active:scale-95 transition-all"
                        />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12">
              <EmptyState
                icon={<LuGraduationCap size={48} className="text-slate-400" />}
                title="Không tìm thấy khóa học nào"
                description="Chúng tôi không tìm thấy khóa học nào phù hợp với bộ lọc của bạn. Thử xóa bộ lọc hoặc tìm từ khóa khác."
                actionText="Xóa tất cả bộ lọc"
                onAction={clearAllFilters}
              />
            </div>
          )}
        </div>

        {/* 3.5. Top Experts Section - EXACT Fig-match RESTORED */}
        <div className="flex flex-col gap-6 mt-16">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 pt-12">
            {filteredMentors.map((mentor) => {
              // Dynamic border colors based on Figma mockup
              let borderColor = "border-[#4FD1C5]"; // Le Minh Trang: Teal
              if (mentor.id === "mentor-2") borderColor = "border-[#ECC94B]"; // Marcus Aurelius: Gold/Amber
              else if (mentor.id === "mentor-3") borderColor = "border-[#ED64A6]"; // Sophia Chen: Pink/Purple

              return (
                <div 
                  key={mentor.id} 
                  className="bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.015)] border border-slate-100/90 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col justify-between min-h-[380px] group relative"
                >
                  <div className="flex flex-col gap-4">
                    {/* Top Avatar & Rating row */}
                    <div className="flex items-center justify-between gap-4">
                      {/* Squircle (rounded square) avatar overflowing top edge */}
                      <div className="relative mt-[-46px]">
                        <div className={`w-[72px] h-[72px] rounded-[20px] p-[3px] bg-white border-2 ${borderColor} shadow-md overflow-visible`}>
                          <img
                            src={mentor.avatar}
                            alt={mentor.name}
                            className="w-full h-full object-cover rounded-[16px]"
                          />
                        </div>
                        {/* Active green status indicator */}
                        <span className="absolute bottom-0 right-0 w-[14px] h-[14px] bg-[#48BB78] border-2 border-white rounded-full"></span>
                      </div>

                      {/* Rating badge matching mockup exactly */}
                      <div className="flex items-center gap-1 bg-[#FEF3C7]/60 text-[#D97706] px-2.5 py-1 rounded-full text-xs font-black border border-[#FDE68A]/50">
                        <LuStar size={12} className="fill-[#F59E0B] text-[#F59E0B]" />
                        <span>{mentor.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    {/* Mentor Identity */}
                    <div className="flex flex-col gap-1 mt-2">
                      <h3 className="text-[18px] font-black text-[#1A202C] tracking-tight group-hover:text-[#2563eb] transition-colors font-[Montserrat]">
                        {mentor.name}
                      </h3>
                      <span className="text-[11px] font-bold text-[#3182CE] tracking-normal">
                        {mentor.title}
                      </span>
                    </div>

                    {/* Mentor Bio */}
                    <p className="text-[13px] leading-relaxed text-[#4A5568] font-medium line-clamp-3">
                      {mentor.description}
                    </p>
                  </div>

                  <div>
                    <div className="h-px bg-slate-100 w-full my-4" />
                    
                    {/* Stats columns matching mockup exactly */}
                    <div className="grid grid-cols-2 gap-4 text-[11px] text-[#718096] font-medium mb-5">
                      <div className="flex flex-col gap-0.5">
                        <span>Sessions</span>
                        <span className="text-[#1A202C] text-sm font-bold mt-0.5">
                          {mentor.sessions} completed
                        </span>
                      </div>
                      
                      <div className="flex flex-col gap-0.5">
                        <span>Donation Rate</span>
                        <span className="text-[#38A169] text-sm font-bold mt-0.5">
                          {mentor.impactRate}% impact
                        </span>
                      </div>
                    </div>

                    {/* View Profile Button matching mockup exactly */}
                    <Button
                      variant="text"
                      label="View Profile"
                      className="w-full bg-[#EDF2F7] hover:bg-[#E2E8F0] text-[#4A5568] font-bold text-xs py-3.5 rounded-xl tracking-wide text-center cursor-pointer active:scale-95 transition-all"
                    />
                  </div>
                </div>
              );
            })}
          </div>
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
