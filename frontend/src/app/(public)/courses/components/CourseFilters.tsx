"use client";

import React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/core/ui";
import { LuSearch, LuPlus, LuX, LuSlidersHorizontal } from "react-icons/lu";

const QUICK_TAGS = ["All Topics", "Lập trình Web", "UI/UX Design", "Khoa học máy tính", "Lập trình di động"];

interface CourseFiltersProps {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  selectedTag: string;
  setSelectedTag: (v: string) => void;
  academicLevel: string;
  setAcademicLevel: (v: string) => void;
  durationFilter: string;
  setDurationFilter: (v: string) => void;
  formatFilter: string;
  setFormatFilter: (v: string) => void;
  isFilterActive: boolean;
  clearAllFilters: () => void;
}

const FilterPill = ({
  label,
  value,
  current,
  onChange,
}: {
  label: string;
  value: string;
  current: string;
  onChange: (v: string) => void;
}) => (
  <button
    onClick={() => onChange(current === value ? "" : value)}
    className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border cursor-pointer ${
      current === value
        ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
        : "bg-white border-slate-200 text-slate-600 hover:border-primary/40 hover:text-primary"
    }`}
  >
    {label}
  </button>
);

export const CourseFilters = ({
  searchQuery,
  setSearchQuery,
  selectedTag,
  setSelectedTag,
  academicLevel,
  setAcademicLevel,
  durationFilter,
  setDurationFilter,
  formatFilter,
  setFormatFilter,
  isFilterActive,
  clearAllFilters,
}: CourseFiltersProps) => {
  const { data: session } = useSession();

  return (
    <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 flex flex-col gap-5">
      {/* Row 1: Search + Create button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <LuSearch
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
            size={17}
          />
          <input
            type="text"
            placeholder="Tìm kiếm khóa học, chủ đề..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all"
          />
        </div>

        {session?.user?.role === "mentor" && (
          <Link href="/courses/create" className="shrink-0">
            <Button
              variant="primary"
              label={
                <div className="flex items-center gap-2">
                  <LuPlus size={15} />
                  <span>Tạo khóa học</span>
                </div>
              }
              size="md"
              className="rounded-2xl font-bold w-full sm:w-auto"
            />
          </Link>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-slate-100" />

      {/* Row 2: Topic pills + secondary filters */}
      <div className="flex flex-col gap-3">
        {/* Topic pills */}
        <div className="flex flex-wrap gap-2">
          {QUICK_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? "All Topics" : tag)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border cursor-pointer ${
                selectedTag === tag
                  ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:border-primary/30 hover:bg-white"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Secondary row: refine + clear */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">
            Lọc thêm:
          </span>

          <FilterPill label="Cơ bản" value="beginner" current={academicLevel} onChange={setAcademicLevel} />
          <FilterPill label="Trung cấp" value="intermediate" current={academicLevel} onChange={setAcademicLevel} />
          <FilterPill label="Nâng cao" value="advanced" current={academicLevel} onChange={setAcademicLevel} />

          <div className="w-px h-4 bg-slate-200 mx-1" />

          <FilterPill label="Online" value="online" current={formatFilter} onChange={setFormatFilter} />
          <FilterPill label="Offline" value="offline" current={formatFilter} onChange={setFormatFilter} />
          <FilterPill label="Hybrid" value="hybrid" current={formatFilter} onChange={setFormatFilter} />

          <div className="w-px h-4 bg-slate-200 mx-1" />

          <FilterPill label="< 1 giờ" value="short" current={durationFilter} onChange={setDurationFilter} />
          <FilterPill label="1–3 giờ" value="medium" current={durationFilter} onChange={setDurationFilter} />
          <FilterPill label="> 3 giờ" value="long" current={durationFilter} onChange={setDurationFilter} />

          {isFilterActive && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-full text-[10px] font-black border border-red-100 transition-all cursor-pointer ml-1"
            >
              <LuX size={10} strokeWidth={3} />
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
