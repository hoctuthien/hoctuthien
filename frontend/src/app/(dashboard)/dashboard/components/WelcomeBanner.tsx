import React from 'react';
import { LuTrendingUp } from 'react-icons/lu';

interface WelcomeBannerProps {
  name: string;
  isMentor: boolean;
  message: string;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ name, isMentor, message }) => {
  return (
    <div className="relative mt-2 p-6 md:p-8 rounded-[32px] overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-900 shadow-xl shadow-blue-900/10 flex flex-col gap-3 text-white">
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 translate-y-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full w-max text-[10px] font-black uppercase tracking-wider">
        <LuTrendingUp size={12} className="text-emerald-400" />
        <span>BẢNG ĐIỀU KHIỂN HỌC TẬP THÔNG MINH</span>
      </div>
      
      <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-tight mt-1 font-[Montserrat]">
        Chào mừng trở lại, {name}! ✨
      </h1>
      <p className="text-sm text-blue-100/90 font-medium max-w-2xl leading-relaxed">
        {message}
      </p>
    </div>
  );
};
