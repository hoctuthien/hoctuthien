"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Breadcrumb, EmptyState, Modal } from "@shared";
import { 
  LuSearch, 
  LuPlus, 
  LuStar, 
  LuChevronDown, 
  LuSlidersHorizontal,
  LuSparkles,
  LuAward,
  LuGraduationCap,
  LuX
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

export default function MentorCoursesClient() {
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("Tất cả Chủ đề");
  const [academicLevel, setAcademicLevel] = useState("all");
  const [durationFilter, setDurationFilter] = useState("all");
  const [formatFilter, setFormatFilter] = useState("all");
  
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  // Kiểm tra xem có bộ lọc nào đang active không
  const isFilterActive =
    searchQuery !== "" ||
    selectedTag !== "Tất cả Chủ đề" ||
    academicLevel !== "all" ||
    durationFilter !== "all" ||
    formatFilter !== "all";

  // Reset tất cả bộ lọc về mặc định
  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedTag("Tất cả Chủ đề");
    setAcademicLevel("all");
    setDurationFilter("all");
    setFormatFilter("all");
  };


  // Quick Tags in Figma Mockup
  const quickTags = [
    "Tất cả Chủ đề",
    "Báo chí",
    "Truyền thông Kỹ thuật số",
    "Viết sáng tạo",
    "Đạo đức"
  ];

  // Mock Mentor Data from Figma Mockup
  const mentors: Mentor[] = [
    {
      id: "mentor-1",
      name: "Lê Minh Trang",
      title: "Nhà thiết kế Sản phẩm Cấp cao @ TechFlow",
      description: "Giúp đỡ các nhà thiết kế đầy tham vọng sẵn sàng hệ thống phân cấp thị giác và các hệ thống tập trung vào người dùng thông qua chia sẻ thực tế và thực chiến dự án.",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80",
      rating: 4.9,
      sessions: 142,
      impactRate: 100,
      tags: ["UI/UX Design", "Viết sáng tạo"],
      level: "intermediate",
      duration: "medium",
      format: "online"
    },
    {
      id: "mentor-2",
      name: "Marcus Aurelius",
      title: "Tổng biên tập Điều hành @ Global News",
      description: "Cố vấn báo chí chiến lược chuyên về báo cáo đạo đức, các vấn đề truyền thông đương đại và xây dựng nội dung đa phương tiện kỹ thuật số cho khán giả toàn cầu.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
      rating: 5.0,
      sessions: 89,
      impactRate: 100,
      tags: ["Báo chí", "Đạo đức"],
      level: "advanced",
      duration: "long",
      format: "offline"
    },
    {
      id: "mentor-3",
      name: "Sophia Chen",
      title: "Lập trình viên Trưởng @ Innovation Lab",
      description: "Rút ngắn khoảng cách giữa lý thuyết học thuật và thực hành kỹ thuật trong ngành. Chuyên sâu về kiến trúc điện toán đám mây và thiết kế hệ thống phân tán lớn.",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80",
      rating: 4.8,
      sessions: 215,
      impactRate: 100,
      tags: ["Truyền thông Kỹ thuật số", "UI/UX Design"],
      level: "beginner",
      duration: "short",
      format: "hybrid"
    }
  ];

  // Mock PhD Mentors Data from Figma Mockup
  const phdMentors: PhDMentor[] = [
    {
      id: "phd-1",
      name: "TS. Sarah Chen",
      university: "Đại học Harvard",
      major: "Kinh tế học",
      quote: "Giáo dục là công cụ mạnh mẽ nhất mà bạn có thể sử dụng để thay đổi thế giới. Học tập kinh tế học giúp chúng ta giải quyết các nguồn lực toàn cầu một cách nhân văn và hiệu quả nhất.",
      badge: "HỌC GIẢ HARVARD",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80"
    },
    {
      id: "phd-2",
      name: "GS. Julian Vance",
      university: "Đại học Oxford",
      major: "Triết học",
      quote: "Tư duy phản biện là một nghệ thuật cộng đồng. Mục tiêu của triết học không phải là cung cấp các câu trả lời tuyệt đối mà là dạy chúng ta biết đặt câu hỏi để thấu hiểu sâu sắc hơn.",
      badge: "ĐẠI HỌC OXFORD",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80"
    },
    {
      id: "phd-3",
      name: "TS. Elena Rodriguez",
      university: "Đại học Stanford",
      major: "Đạo đức AI",
      quote: "Công nghệ cần có tính nhân văn làm móng. Tôi cố vấn để đảm bảo các nhà phát triển và lãnh đạo công nghệ tương lai xây dựng hệ thống AI có trách nhiệm và hướng về con người.",
      badge: "ĐẠI HỌC STANFORD",
      avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=150&q=80"
    }
  ];

  // Filter experts based on Search & Tags & Dropdowns
  const filteredMentors = mentors.filter((mentor) => {
    // 1. Search Query
    const matchesSearch = 
      mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    // 2. Tag Pill Filter
    const matchesTag = 
      selectedTag === "Tất cả Chủ đề" || 
      mentor.tags.includes(selectedTag);

    // 3. Dropdowns
    const matchesLevel = academicLevel === "all" || mentor.level === academicLevel;
    const matchesDuration = durationFilter === "all" || mentor.duration === durationFilter;
    const matchesFormat = formatFilter === "all" || mentor.format === formatFilter;

    return matchesSearch && matchesTag && matchesLevel && matchesDuration && matchesFormat;
  });



  const breadcrumbItems = [
    { label: "Trang chủ", href: "/" },
    { label: "Cố vấn", href: "#" },
    { label: "Danh sách khóa học" },
  ];

  return (
    <div className="w-full bg-[#FAFBFD] min-h-screen py-8 px-4 md:px-8 font-sans overflow-x-hidden">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        
        {/* Top Breadcrumb & Success Alert */}
        <div className="flex flex-col gap-3">
          <Breadcrumb items={breadcrumbItems} />
          {showSuccessAlert && (
            <div className="bg-[#ECFDF5] border border-[#10B981]/30 text-[#064E3B] px-5 py-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 shadow-sm">
              <svg className="text-[#10B981] flex-shrink-0 w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div className="text-sm font-semibold">
                Tạo khóa học thành công! Hệ thống đang xử lý và sẽ hiển thị bài giảng sau khi được phê duyệt.
              </div>
            </div>
          )}
        </div>

        {/* 1. Hero Section - EXACT MATCH WITH FIGMA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-6">
          {/* Left Text Column */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <span className="text-[#2563eb] text-[12px] font-black uppercase tracking-[0.15em] flex items-center gap-1">
              <LuSparkles size={14} className="animate-pulse" /> HỌC TẬP TỔ CHỨC
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-[#0F172A] leading-[1.15] tracking-tight font-[Montserrat]">
              Trao quyền cho <span className="text-[#2563eb] relative inline-block">Thế hệ Tiếp theo<span className="absolute bottom-1 left-0 w-full h-[6px] bg-[#2563eb]/10 rounded-full" /></span> của các <span className="text-[#2563eb] relative inline-block">Nhà giáo dục<span className="absolute bottom-1 left-0 w-full h-[6px] bg-[#2563eb]/10 rounded-full" /></span>
            </h1>
            <p className="text-[#64748b] text-base leading-relaxed font-medium">
              Nền tảng của chúng tôi cung cấp các bộ chương trình giảng dạy toàn diện và các buổi workshop do cố vấn dẫn dắt, được thiết kế dành riêng cho các nhà giáo dục và nhà nghiên cứu học thuật cấp đại học. Tạo dựng, quản lý và mở rộng tầm ảnh hưởng của bạn.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-4">
              <button className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-extrabold text-sm py-4 px-8 rounded-full shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all">
                Bắt đầu Hành trình của Bạn
              </button>
              <button className="bg-transparent hover:bg-slate-50 border border-[#CBD5E1] text-[#1e293b] font-extrabold text-sm py-4 px-8 rounded-full active:scale-[0.98] transition-all">
                Xem Chương trình học
              </button>
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
            <div className="absolute -bottom-6 left-6 sm:left-10 md:left-12 bg-[#2563eb] text-white p-4 sm:p-6 rounded-[20px] sm:rounded-[24px] shadow-2xl max-w-[160px] sm:max-w-[200px] border border-blue-400/20 flex flex-col gap-1 z-10">
              <span className="text-2xl sm:text-4xl font-black tracking-tight">40+</span>
              <span className="text-[9px] sm:text-[11px] text-blue-100 font-bold leading-normal uppercase tracking-wider">
                đối tác đại học toàn cầu trong năm 2024
              </span>
            </div>
          </div>

        </div>

        {/* 2. Search & Quick Filters - EXACT MATCH WITH FIGMA */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-6 rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.02)] mt-8 flex flex-col gap-6">
          {/* Top Row: Search & Tags & Button */}
          <div className="flex flex-col xl:flex-row items-center gap-4 md:gap-5 w-full">
            {/* Search Input */}
            <div className="relative w-full xl:w-[380px] 2xl:w-[420px]">
              <LuSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={18} />
              <input
                type="text"
                placeholder="Tìm kiếm chương trình học, học phần, hoặc chủ đề..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#E2E8F0] rounded-2xl outline-none focus:border-[#2563eb] focus:ring-4 focus:ring-blue-50 text-sm font-medium transition-all"
              />
            </div>

            {/* Quick Filter Topic Pills - Beautiful responsive horizontal scroll on mobile, wrap on desktop */}
            <div className="flex flex-nowrap xl:flex-wrap items-center gap-2 flex-1 w-full overflow-x-auto pb-1 xl:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {quickTags.map((tag) => {
                const isActive = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? "bg-[#1E293B] text-white shadow-sm shadow-slate-900/10"
                        : "bg-[#E2E8F0] hover:bg-[#CBD5E1] text-[#475569]"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>

            {/* Action Create Course Button (Routes to dedicated /courses/create page) */}
            <Link
              href="/courses/create"
              className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-extrabold text-xs py-3.5 px-6 rounded-2xl flex items-center gap-2 shadow-md shadow-blue-500/10 active:scale-[0.98] transition-all w-full xl:w-auto justify-center cursor-pointer whitespace-nowrap"
            >
              <LuPlus size={16} />
              <span>Tạo khóa học mới</span>
            </Link>
          </div>


          {/* Divider */}
          <div className="h-px bg-[#E2E8F0] w-full" />

          {/* Bottom Row: Selection Filters */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-[#94A3B8] tracking-[0.2em] uppercase block sm:inline">
                  LỌC THEO:
                </span>
                {isFilterActive && (
                  <button
                    onClick={clearAllFilters}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 rounded-lg text-[10px] font-black transition-all cursor-pointer animate-in fade-in zoom-in-95 duration-200 border border-red-100"
                    title="Xóa tất cả bộ lọc"
                  >
                    <LuX size={10} strokeWidth={3} />
                    Xóa lọc
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-3 w-full">
                {/* Academic Level Select */}
                <div className="relative w-full sm:w-auto">
                  <select
                    value={academicLevel}
                    onChange={(e) => setAcademicLevel(e.target.value)}
                    className="w-full sm:w-auto appearance-none bg-white border border-[#E2E8F0] pl-4 pr-10 py-2.5 rounded-xl text-xs font-bold text-[#475569] outline-none focus:border-[#2563eb] cursor-pointer"
                  >
                    <option value="all">Cấp độ học thuật</option>
                    <option value="beginner">Cơ bản (Beginner)</option>
                    <option value="intermediate">Trung cấp (Intermediate)</option>
                    <option value="advanced">Nâng cao (Advanced)</option>
                  </select>
                  <LuChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] pointer-events-none" size={14} />
                </div>

                {/* Duration Select */}
                <div className="relative w-full sm:w-auto">
                  <select
                    value={durationFilter}
                    onChange={(e) => setDurationFilter(e.target.value)}
                    className="w-full sm:w-auto appearance-none bg-white border border-[#E2E8F0] pl-4 pr-10 py-2.5 rounded-xl text-xs font-bold text-[#475569] outline-none focus:border-[#2563eb] cursor-pointer"
                  >
                    <option value="all">Thời lượng</option>
                    <option value="short">Dưới 1 giờ (Ngắn)</option>
                    <option value="medium">1 - 3 giờ (Trung bình)</option>
                    <option value="long">Trên 3 giờ (Dài)</option>
                  </select>
                  <LuChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] pointer-events-none" size={14} />
                </div>

                {/* Format Select */}
                <div className="relative w-full sm:w-auto">
                  <select
                    value={formatFilter}
                    onChange={(e) => setFormatFilter(e.target.value)}
                    className="w-full sm:w-auto appearance-none bg-white border border-[#E2E8F0] pl-4 pr-10 py-2.5 rounded-xl text-xs font-bold text-[#475569] outline-none focus:border-[#2563eb] cursor-pointer"
                  >
                    <option value="all">Định dạng</option>
                    <option value="online">Học trực tuyến</option>
                    <option value="hybrid">Học kết hợp (Hybrid)</option>
                  </select>
                  <LuChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] pointer-events-none" size={14} />
                </div>
              </div>
            </div>

              {/* Advanced Filter Trigger Button */}
            <button className="flex items-center gap-1.5 text-xs font-black text-[#2563eb] hover:text-[#1d4ed8] transition-colors cursor-pointer self-start md:self-auto mt-2 md:mt-0">
              <LuSlidersHorizontal size={14} />
              <span>Bộ lọc Nâng cao</span>
            </button>
          </div>

        </div>

        {/* 3. Top Experts Section - EXACT MATCH WITH FIGMA */}
        <div className="flex flex-col gap-6 mt-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#F1F5F9] pb-4">
            <div className="flex flex-col gap-1">
              <span className="text-[#2563eb] text-[10px] font-black uppercase tracking-[0.2em]">
                CHUYÊN GIA HÀNG ĐẦU
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-[#0F172A] tracking-tight">
                Lộ trình được Tuyển chọn cho Sự Xuất sắc
              </h2>
            </div>
            <span className="text-xs font-bold text-[#64748b]">
              Đang hiển thị {filteredMentors.length} cố vấn đã xác minh
            </span>
          </div>

          {filteredMentors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMentors.map((mentor) => (
                <div 
                  key={mentor.id} 
                  className="bg-white rounded-[24px] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.03)] border border-slate-100/80 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between"
                >
                  <div>
                    {/* Top row: Avatar & Info & Rating */}
                    <div className="flex items-center gap-4 mb-4 relative">
                      {/* Avatar with active green badge */}
                      <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-inner flex-shrink-0 bg-slate-50 border border-slate-100">
                        <img
                          src={mentor.avatar}
                          alt={mentor.name}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#10B981] border-2 border-white rounded-full" />
                      </div>
                      
                      {/* Name & Title */}
                      <div className="flex flex-col gap-0.5 pr-12">
                        <h4 className="text-[17px] font-black text-[#0F172A] tracking-tight leading-tight">
                          {mentor.name}
                        </h4>
                        <p className="text-[11px] text-[#2563eb] font-extrabold leading-normal uppercase tracking-wider">
                          {mentor.title}
                        </p>
                      </div>

                      {/* Rating Badge */}
                      <div className="absolute top-0 right-0 flex items-center gap-1 bg-[#FFFBEB] text-[#B45309] px-2 py-1 rounded-lg text-xs font-black">
                        <LuStar size={12} className="fill-amber-500 text-amber-500" />
                        <span>{mentor.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-[13px] leading-relaxed text-[#475569] font-medium mb-4 line-clamp-3">
                      {mentor.description}
                    </p>
                  </div>

                  {/* Divider and stats */}
                  <div>
                    <div className="h-px bg-[#F1F5F9] w-full my-4" />
                    
                    <div className="flex flex-col gap-1.5 text-[11px] font-bold text-[#64748b]">
                      <div className="flex items-center justify-between">
                        <span>SỐ BUỔI:</span>
                        <span className="text-[#0F172A] font-black">{mentor.sessions} hoàn thành</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>TỶ LỆ ĐỒNG GÓP:</span>
                        <span className="text-[#10B981] font-black">{mentor.impactRate}% tác động</span>
                      </div>
                    </div>

                    {/* View Profile Action */}
                    <button className="w-full bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#1e293b] font-black text-xs py-3.5 rounded-xl transition-all uppercase tracking-wider text-center block mt-4 cursor-pointer">
                      Xem Hồ sơ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12">
              <EmptyState
                icon={<LuGraduationCap size={48} className="text-slate-400" />}
                title="Không tìm thấy cố vấn"
                description="Chúng tôi không tìm thấy cố vấn nào phù hợp với bộ lọc và từ khóa tìm kiếm của bạn. Hãy thử xóa bộ lọc hoặc tìm kiếm từ khóa khác."
                actionText="Xóa bộ lọc"
                onAction={() => {
                  setSearchQuery("");
                  setSelectedTag("Tất cả Chủ đề");
                  setAcademicLevel("all");
                  setDurationFilter("all");
                  setFormatFilter("all");
                }}
              />
            </div>
          )}
        </div>

        {/* 4. PhD Mentors Section - EXACT MATCH WITH FIGMA */}
        <div className="flex flex-col gap-6 mt-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#F1F5F9] pb-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl md:text-3xl font-black text-[#0F172A] tracking-tight leading-tight max-w-2xl">
                Học hỏi từ các Cố vấn Tiến sĩ từ các Học viện Hàng đầu Thế giới
              </h2>
            </div>
            <button className="bg-white border border-[#CBD5E1] hover:bg-slate-50 text-[#1e293b] font-extrabold text-xs px-6 py-3.5 rounded-2xl transition-all whitespace-nowrap shadow-sm hover:shadow active:scale-[0.98] cursor-pointer">
              Gặp gỡ Tất cả Cố vấn
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {phdMentors.map((phd) => (
              <div 
                key={phd.id} 
                className="bg-white rounded-[28px] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.03)] border border-slate-100/80 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between gap-6"
              >
                <div className="flex flex-col gap-4">
                  {/* Avatar & Affiliations */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-inner bg-slate-50 border border-slate-100 flex-shrink-0">
                      <img
                        src={phd.avatar}
                        alt={phd.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <h4 className="text-base font-black text-[#0F172A] tracking-tight">
                        {phd.name}
                      </h4>
                      <p className="text-xs text-[#64748b] font-bold">
                        {phd.university} • <span className="text-[#2563eb]">{phd.major}</span>
                      </p>
                    </div>
                  </div>

                  {/* Quote Paragraph */}
                  <p className="text-[13px] leading-relaxed text-[#475569] font-medium italic relative pl-4 border-l-2 border-[#E2E8F0]">
                    "{phd.quote}"
                  </p>
                </div>

                {/* Bottom Scholar Badge */}
                <div className="flex items-center gap-1.5 text-[10px] font-black text-[#B45309] tracking-wider uppercase">
                  <LuAward size={14} className="text-amber-500" />
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

