"use client";

import React, { useState } from "react";
import { Breadcrumb } from "@shared";
import { courseGateway } from "@/core/gateway";
import { useQuery } from "@tanstack/react-query";

import { CourseHero } from "./components/CourseHero";
import { CourseFilters } from "./components/CourseFilters";
import { CourseGrid } from "./components/CourseGrid";
import { ExpertMentorsSection } from "./components/ExpertMentorsSection";
import { PhDMentorsSection } from "./components/PhDMentorsSection";

const BREADCRUMB_ITEMS = [
  { label: "Trang chủ", href: "/" },
  { label: "Khóa học" },
];

// ─── Filter helpers ────────────────────────────────────────────────────────────

const normalizeLevel = (lvl: string) => {
  const l = (lvl || "").toLowerCase();
  if (["cơ bản", "beginner", "basic"].includes(l)) return "beginner";
  if (["trung cấp", "intermediate", "medium"].includes(l)) return "intermediate";
  if (["nâng cao", "advanced"].includes(l)) return "advanced";
  return "intermediate";
};

const normalizeFormat = (fmt: string) => {
  const f = (fmt || "").toLowerCase();
  if (f === "trực tuyến" || f === "online") return "online";
  if (f === "trực tiếp" || f === "offline") return "offline";
  if (f === "hỗn hợp" || f === "hybrid") return "hybrid";
  return "online";
};

const TAG_MAP: Record<string, string[]> = {
  "Lập trình Web": ["web", "frontend", "backend"],
  "UI/UX Design": ["design", "ui", "ux", "figma"],
  "Khoa học máy tính": ["máy tính", "computer", "khoa học", "c/c++"],
  "Lập trình di động": ["di động", "mobile", "android", "ios", "react native"],
};

// ─── Main Component ────────────────────────────────────────────────────────────

export default function PublicCoursesClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("All Topics");
  const [academicLevel, setAcademicLevel] = useState("");
  const [durationFilter, setDurationFilter] = useState("");
  const [formatFilter, setFormatFilter] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["publicCourses"],
    queryFn: async () => {
      const courses = await courseGateway.getPublicCourses();
      return courses;
    },
  });

  const allCourses = data || [];

  const isFilterActive =
    searchQuery !== "" ||
    selectedTag !== "All Topics" ||
    academicLevel !== "" ||
    durationFilter !== "" ||
    formatFilter !== "";

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedTag("All Topics");
    setAcademicLevel("");
    setDurationFilter("");
    setFormatFilter("");
  };

  const filteredCourses = allCourses.filter((course: any) => {
    if (course.status !== "published") return false;

    const matchSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category.toLowerCase().includes(searchQuery.toLowerCase());

    const catLower = course.category.toLowerCase();
    const matchTag =
      selectedTag === "All Topics" ||
      catLower.includes(selectedTag.toLowerCase()) ||
      (TAG_MAP[selectedTag] || []).some((k) => catLower.includes(k));

    const matchLevel =
      academicLevel === "" ||
      normalizeLevel(course.metadata?.level || "") === academicLevel;

    const matchFormat =
      formatFilter === "" ||
      normalizeFormat(course.metadata?.format || "") === formatFilter;

    const hours = course.durationMinutes
      ? course.durationMinutes / 60
      : Number(course.metadata?.totalHours || 12);
    const durGroup = hours <= 1 ? "short" : hours <= 3 ? "medium" : "long";
    const matchDuration = durationFilter === "" || durGroup === durationFilter;

    return matchSearch && matchTag && matchLevel && matchFormat && matchDuration;
  });

  return (
    <div className="w-full bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 flex flex-col gap-12">
        {/* Breadcrumb */}
        <Breadcrumb items={BREADCRUMB_ITEMS} />

        {/* 1. Hero */}
        <CourseHero />

        {/* 2. Filters */}
        <CourseFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTag}
          academicLevel={academicLevel}
          setAcademicLevel={setAcademicLevel}
          durationFilter={durationFilter}
          setDurationFilter={setDurationFilter}
          formatFilter={formatFilter}
          setFormatFilter={setFormatFilter}
          isFilterActive={isFilterActive}
          clearAllFilters={clearAllFilters}
        />

        {/* 3. Course Grid */}
        <div className="flex flex-col gap-5">
          {/* Section header */}
          <div className="flex items-end justify-between border-b border-slate-200 pb-4">
            <div className="flex flex-col gap-1">
              <span className="text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                Khóa học nổi bật
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                Các chương trình chất lượng cao
              </h2>
            </div>
            <span className="text-xs font-bold text-slate-400">
              {isLoading ? "Đang tải..." : `${filteredCourses.length} khóa học`}
            </span>
          </div>

          {/* Error banner */}
          {isError && (
            <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-xs font-semibold text-red-700 flex items-center gap-3 animate-in fade-in duration-300">
              <span className="text-red-500 text-base">⚠️</span>
              Không thể tải danh sách khóa học. Vui lòng thử lại sau.
            </div>
          )}

          <CourseGrid
            courses={filteredCourses}
            loading={isLoading}
            searchQuery={searchQuery}
            onClearFilters={clearAllFilters}
          />
        </div>

        {/* 4. Expert Mentors */}
        <ExpertMentorsSection />

        {/* 5. PhD Mentors */}
        <PhDMentorsSection />
      </div>
    </div>
  );
}
