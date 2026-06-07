"use client";

import React from "react";
import { Button } from "@/core/ui";

export const CourseHero = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      {/* Left */}
      <div className="flex flex-col gap-5">
        <span className="text-primary text-[11px] font-black uppercase tracking-[0.18em]">
          Institutional Learning
        </span>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-[1.1] tracking-tight">
          Nâng tầm <span className="text-primary">thế hệ</span> học viên tiếp theo
        </h1>
        <p className="text-slate-500 text-base leading-relaxed">
          Khám phá các chương trình học chất lượng cao được thiết kế bởi chuyên gia thực chiến.
          Học theo lộ trình, có mentor đồng hành.
        </p>
        <div className="flex flex-wrap gap-3 mt-2">
          <Button
            variant="primary"
            label="Bắt đầu học ngay"
            size="lg"
            className="rounded-full font-bold px-8 hover:scale-[1.02] active:scale-95 transition-transform"
          />
          <Button
            variant="outline"
            label="Xem tất cả khóa học"
            size="lg"
            className="rounded-full font-bold px-8 hover:scale-[1.02] active:scale-95 transition-transform"
          />
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-8 mt-4 pt-4 border-t border-slate-100">
          {[
            { value: "40+", label: "Đối tác trường học" },
            { value: "1,200+", label: "Học viên" },
            { value: "98%", label: "Hài lòng" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col">
              <span className="text-2xl font-black text-slate-900">{s.value}</span>
              <span className="text-xs text-slate-400 font-medium">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right - Image */}
      <div className="relative flex justify-end">
        <div className="relative w-full max-w-[480px] aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
          <img
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=800&auto=format&fit=crop"
            alt="Classroom"
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 to-transparent" />
        </div>

        {/* Floating badge */}
        <div className="absolute -bottom-5 left-4 bg-primary text-white px-6 py-4 rounded-2xl shadow-xl shadow-primary/25 flex flex-col gap-0.5 z-10">
          <span className="text-3xl font-black leading-none">40+</span>
          <span className="text-[10px] text-blue-100 font-bold uppercase tracking-wider">
            Trường ĐH<br />đối tác 2026
          </span>
        </div>
      </div>
    </div>
  );
};
