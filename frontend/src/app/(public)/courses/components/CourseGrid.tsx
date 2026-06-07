import React from "react";
import Link from "next/link";
import { Button } from "@/core/ui";
import { LuStar, LuUsers, LuGraduationCap } from "react-icons/lu";

interface Course {
  id: string;
  title: string;
  description?: string;
  category: string;
  thumbnail?: string;
  rating: number;
  studentsCount: number;
  price: number;
  status: string;
  durationMinutes?: number;
  metadata?: {
    level?: string;
    format?: string;
    totalHours?: string | number;
  };
}

const CATEGORY_GRADIENT: Record<string, string> = {
  web: "from-blue-500 to-cyan-400",
  design: "from-purple-500 to-pink-500",
  ui: "from-purple-500 to-pink-500",
  ux: "from-purple-500 to-pink-500",
  "máy tính": "from-indigo-500 to-violet-600",
  "khoa học": "from-indigo-500 to-violet-600",
  mobile: "from-emerald-500 to-teal-400",
  default: "from-amber-400 to-orange-500",
};

function getCategoryGradient(category: string): string {
  const lower = category.toLowerCase();
  for (const [key, grad] of Object.entries(CATEGORY_GRADIENT)) {
    if (lower.includes(key)) return grad;
  }
  return CATEGORY_GRADIENT.default;
}

// --- Course Card ---
const CourseCard = ({ course }: { course: Course }) => {
  return (
    <div className="group bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-slate-100 hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 flex flex-col gap-5 select-none">

      {/* Top row: thumbnail + rating */}
      <div className="flex items-start justify-between gap-4">
        {/* Thumbnail with online dot */}
        <div className="relative flex-shrink-0">
          <div className="w-[80px] h-[80px] rounded-[18px] overflow-hidden border border-slate-100 shadow-sm bg-slate-50">
            <img
              src={course.thumbnail || "/images/avatar_logo.png"}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="absolute bottom-1 right-1 w-[14px] h-[14px] bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
        </div>

        {/* Rating badge */}
        <div className="flex items-center gap-1.5 bg-slate-50 text-slate-700 px-3 py-1.5 rounded-full text-sm font-bold border border-slate-100 shadow-sm">
          <LuStar size={14} className="fill-amber-400 text-amber-400" />
          <span>{course.rating > 0 ? course.rating.toFixed(1) : "4.8"}</span>
        </div>
      </div>

      {/* Identity */}
      <div className="flex flex-col gap-1">
        <h3 className="text-[18px] font-black text-slate-900 leading-snug tracking-tight group-hover:text-primary transition-colors line-clamp-2">
          {course.title}
        </h3>
        <span className="text-[13px] font-bold text-primary">
          {course.category}
        </span>
      </div>

      {/* Description */}
      <p className="text-[13px] leading-relaxed text-slate-500 font-normal line-clamp-3 flex-1">
        {course.description || "Khóa học chất lượng cao được thiết kế bởi chuyên gia thực chiến."}
      </p>

      {/* Divider */}
      <div className="h-px bg-slate-100 w-full" />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] text-slate-400 font-semibold">Học viên</span>
          <span className="text-[15px] font-black text-slate-900">
            {course.studentsCount.toLocaleString("vi-VN")} enrolled
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] text-slate-400 font-semibold">Học phí</span>
          <span className={`text-[15px] font-black ${course.price === 0 ? "text-emerald-600" : "text-primary"}`}>
            {course.price === 0 ? "Miễn phí" : `${course.price.toLocaleString("vi-VN")}đ`}
          </span>
        </div>
      </div>

      {/* CTA button */}
      <Link href={`/courses/detail/${course.id}`} className="block no-underline">
        <div className="w-full bg-slate-100 hover:bg-slate-200 active:scale-[0.98] transition-all rounded-xl py-3.5 text-center text-[13px] font-bold text-primary tracking-wide cursor-pointer">
          Xem chi tiết
        </div>
      </Link>
    </div>
  );
};


// --- Skeleton ---
const CourseCardSkeleton = () => (
  <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col gap-5 animate-pulse">
    {/* Top row */}
    <div className="flex items-start justify-between gap-4">
      <div className="w-[80px] h-[80px] bg-slate-100 rounded-[18px] flex-shrink-0" />
      <div className="w-14 h-7 bg-slate-100 rounded-full" />
    </div>
    {/* Identity */}
    <div className="flex flex-col gap-2">
      <div className="h-5 bg-slate-100 rounded w-4/5" />
      <div className="h-4 bg-slate-100 rounded w-1/2" />
    </div>
    {/* Description */}
    <div className="flex flex-col gap-1.5 flex-1">
      <div className="h-3 bg-slate-100 rounded w-full" />
      <div className="h-3 bg-slate-100 rounded w-full" />
      <div className="h-3 bg-slate-100 rounded w-3/4" />
    </div>
    {/* Divider */}
    <div className="h-px bg-slate-100" />
    {/* Stats */}
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-1">
        <div className="h-3 bg-slate-100 rounded w-1/2" />
        <div className="h-5 bg-slate-100 rounded w-3/4" />
      </div>
      <div className="flex flex-col gap-1">
        <div className="h-3 bg-slate-100 rounded w-1/2" />
        <div className="h-5 bg-slate-100 rounded w-2/3" />
      </div>
    </div>
    {/* Button */}
    <div className="h-11 bg-slate-100 rounded-xl" />
  </div>
);


// --- Empty State ---
const CourseEmpty = ({
  searchQuery,
  onClear,
}: {
  searchQuery: string;
  onClear: () => void;
}) => (
  <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-100 shadow-sm text-center px-8 animate-in fade-in duration-300">
    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-primary mb-5">
      <LuGraduationCap size={40} />
    </div>
    <h3 className="text-xl font-black text-slate-900 mb-2">Không tìm thấy khóa học</h3>
    <p className="text-slate-500 text-sm font-medium max-w-sm mb-6 leading-relaxed">
      {searchQuery
        ? `Không có kết quả nào cho "${searchQuery}". Thử điều chỉnh bộ lọc.`
        : "Chưa có khóa học nào phù hợp với bộ lọc này."}
    </p>
    <Button
      variant="primary"
      label="Xem tất cả khóa học"
      onClick={onClear}
      className="rounded-full font-bold px-8"
    />
  </div>
);

// --- Grid ---
interface CourseGridProps {
  courses: Course[];
  loading: boolean;
  searchQuery: string;
  onClearFilters: () => void;
}

export const CourseGrid = ({
  courses,
  loading,
  searchQuery,
  onClearFilters,
}: CourseGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {loading ? (
        [1, 2, 3].map((n) => <CourseCardSkeleton key={n} />)
      ) : courses.length > 0 ? (
        courses.map((course) => <CourseCard key={course.id} course={course} />)
      ) : (
        <CourseEmpty searchQuery={searchQuery} onClear={onClearFilters} />
      )}
    </div>
  );
};
