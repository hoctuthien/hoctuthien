import React from 'react';
import { LuCheck } from 'react-icons/lu';

interface ActivationSuccessProps {
  message: string;
}

export const ActivationSuccess: React.FC<ActivationSuccessProps> = ({ message }) => {
  return (
    <div className="w-full bg-gradient-to-tr from-blue-50 to-indigo-50 min-h-screen py-12 px-4 flex items-center justify-center font-sans animate-fade-in">
      <div className="bg-white rounded-[32px] p-8 md:p-12 max-w-lg w-full shadow-2xl border border-emerald-500/20 text-center flex flex-col items-center gap-6">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-500/10 text-emerald-500 animate-bounce">
          <LuCheck size={48} />
        </div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight font-[Montserrat] uppercase">
          Kích Hoạt Thành Công!
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed font-medium">
          {message}
        </p>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-[progress_2s_ease-out-in_infinite]" style={{ width: '100%' }} />
        </div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest animate-pulse">
          Đang chuyển hướng về Bảng điều khiển...
        </p>
      </div>
    </div>
  );
};
