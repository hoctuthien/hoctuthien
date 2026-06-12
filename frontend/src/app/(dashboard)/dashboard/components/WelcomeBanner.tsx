import React from 'react';
import { LuTrendingUp } from 'react-icons/lu';

interface WelcomeBannerProps {
  name: string;
  isMentor: boolean;
  message: string;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ name, isMentor, message }) => {
  return (
    <div className="relative mt-2 p-6 md:p-8 rounded-[24px] overflow-hidden bg-gradient-to-r from-[#1E293B] to-[#0F172A] border border-[#334155]/60 shadow-md flex flex-col gap-3 text-white">
      {/* Premium Minimal Outline Badge */}
      <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full w-max text-[9px] font-extrabold uppercase tracking-widest text-[#38BDF8] font-mono">
        <LuTrendingUp size={11} />
        <span>BẢNG ĐIỀU KHIỂN HỌC TẬP THÔNG MINH</span>
      </div>
      
      {/* Explicit White Heading */}
      <h1 className="text-white text-2xl md:text-3xl font-black tracking-tight leading-tight mt-1 font-[Montserrat] uppercase">
        Chào mừng trở lại, {name}!
      </h1>
      
      {/* Clean Slate Subtitle */}
      <p className="text-xs md:text-sm text-slate-300 font-medium max-w-2xl leading-relaxed">
        {message}
      </p>
    </div>
  );
};
