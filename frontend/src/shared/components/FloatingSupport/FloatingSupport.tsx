'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { LuBug, LuHeadphones, LuMail, LuMessageCircle, LuX } from 'react-icons/lu';
import { ReportBugModal } from '@/shared/components/ReportBugModal';

export function FloatingSupport() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [bugReportOpen, setBugReportOpen] = useState(false);
  const isLoggedIn = Boolean(session);

  const openBugReport = () => {
    setIsOpen(false);
    setBugReportOpen(true);
  };

  return (
    <>
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
        {isOpen && (
          <div className="flex flex-col items-end gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
            {isLoggedIn && (
              <button
                type="button"
                onClick={openBugReport}
                className="group flex items-center gap-3 rounded-full border border-amber-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 shadow-lg shadow-slate-900/10 transition-all hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-50"
                aria-label="Báo lỗi hệ thống"
              >
                <span className="text-xs font-black">Báo lỗi</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-700 transition-colors group-hover:bg-amber-500 group-hover:text-white">
                  <LuBug size={18} />
                </span>
              </button>
            )}

            <a
              href="mailto:support@hoctuthien.com"
              className="group flex items-center gap-3 rounded-full border border-blue-100 bg-white px-4 py-3 text-sm font-bold text-slate-800 shadow-lg shadow-slate-900/10 transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 no-underline"
              aria-label="Liên hệ qua email"
            >
              <span className="text-xs font-black">Email</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                <LuMail size={18} />
              </span>
            </a>

            <button
              type="button"
              className="group flex items-center gap-3 rounded-full border border-emerald-100 bg-white px-4 py-3 text-sm font-bold text-slate-800 shadow-lg shadow-slate-900/10 transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50"
              aria-label="Liên hệ qua chat"
            >
              <span className="text-xs font-black">Liên hệ</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                <LuMessageCircle size={18} />
              </span>
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#005BBF] text-white shadow-xl shadow-blue-900/25 transition-all hover:-translate-y-0.5 hover:bg-[#004493] focus:outline-none focus:ring-4 focus:ring-blue-200"
          aria-label={isOpen ? 'Đóng hỗ trợ' : 'Mở hỗ trợ'}
          aria-expanded={isOpen}
        >
          {isOpen ? <LuX size={24} /> : <LuHeadphones size={24} />}
        </button>
      </div>

      <ReportBugModal isOpen={bugReportOpen} onClose={() => setBugReportOpen(false)} />
    </>
  );
}
