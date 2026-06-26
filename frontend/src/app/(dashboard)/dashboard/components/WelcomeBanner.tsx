import React from 'react';

interface WelcomeBannerProps {
  name: string;
  isMentor: boolean;
  message: string;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ name, message }) => {
  return (
    <div className="relative mt-2 p-6 md:p-8 rounded-[24px] overflow-hidden bg-gradient-to-r from-[#1E293B] to-[#0F172A] border border-[#334155]/60 shadow-md flex flex-col gap-3 text-white">
      <h1 className="text-white text-2xl md:text-3xl font-black tracking-tight leading-tight font-[Montserrat] uppercase">
        Chào mừng trở lại, {name}!
      </h1>

      <p className="text-xs md:text-sm text-slate-300 font-medium max-w-2xl leading-relaxed">
        {message}
      </p>
    </div>
  );
};
