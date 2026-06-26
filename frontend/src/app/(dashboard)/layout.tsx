"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Header } from '@/shared/components/layout/Header';
import { Footer } from '@/shared/components/layout/Footer';
import {
  LuBookOpen,
  LuCalendar,
  LuCalendarDays,
  LuLayers,
  LuSearch,
  LuUser,
} from 'react-icons/lu';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (status === 'loading') {
    return (
      <div className="w-full bg-[#FAFBFD] min-h-screen flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-xs font-black text-[#64748B] uppercase tracking-widest font-sans">Đang tải bố cục...</p>
        </div>
      </div>
    );
  }

  const isMentor = session?.user?.role === 'mentor';

  const sidebarItems: SidebarItem[] = isMentor
    ? [
        { label: 'Bảng điều khiển', href: '/dashboard', icon: <LuLayers size={18} /> },
        { label: 'Lịch', href: '/calendar', icon: <LuCalendar size={18} /> },
        { label: 'Lịch dạy của tôi', href: '/mentor/bookings', icon: <LuCalendarDays size={18} /> },
        { label: 'Khóa học đã tạo', href: '/mentor/courses', icon: <LuBookOpen size={18} /> },
        { label: 'Hồ sơ cá nhân', href: '/profile', icon: <LuUser size={18} /> },
      ]
    : [
        { label: 'Bảng điều khiển', href: '/dashboard', icon: <LuLayers size={18} /> },
        { label: 'Lịch', href: '/calendar', icon: <LuCalendar size={18} /> },
        { label: 'Lịch học của tôi', href: '/my-courses', icon: <LuCalendarDays size={18} /> },
        { label: 'Khám phá khóa học', href: '/courses', icon: <LuSearch size={18} /> },
        { label: 'Hồ sơ cá nhân', href: '/profile', icon: <LuUser size={18} /> },
      ];

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFBFD]">
      <Header />

      <div className="flex-grow pt-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <aside className="lg:col-span-1">
              <div className="hidden lg:flex flex-col gap-6 bg-white border border-[#E2E8F0] rounded-[32px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.005)]">
                <div className="flex flex-col gap-1 border-b border-[#F1F5F9] pb-4 px-2">
                  <span className="text-[10px] text-[#94A3B8] font-black uppercase tracking-widest">
                    {isMentor ? 'Khu vực cố vấn' : 'Khu vực học viên'}
                  </span>
                  <span className="font-black text-sm text-[#0F172A] tracking-tight">Cài đặt tài khoản</span>
                </div>

                <nav className="flex flex-col gap-1.5">
                  {sidebarItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-xs font-black transition-all no-underline ${
                          isActive
                            ? 'bg-gradient-to-r from-[#005BBF] to-[#004493] text-white shadow-lg shadow-[#005BBF]/15'
                            : 'text-[#475569] hover:text-[#005BBF] hover:bg-[#DFEFFF]/50'
                        }`}
                      >
                        <div className={isActive ? 'text-white' : 'text-slate-500'}>
                          {item.icon}
                        </div>
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="lg:hidden w-full bg-white border border-[#E2E8F0] rounded-2xl p-3 shadow-sm mb-4 overflow-x-auto whitespace-nowrap scrollbar-hide flex gap-2">
                {sidebarItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all no-underline ${
                        isActive
                          ? 'bg-gradient-to-r from-[#005BBF] to-[#004493] text-white'
                          : 'text-[#475569] hover:text-[#005BBF] hover:bg-[#DFEFFF]/50'
                      }`}
                    >
                      <div>{item.icon}</div>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </aside>

            <main className="lg:col-span-3 min-w-0">
              {children}
            </main>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
