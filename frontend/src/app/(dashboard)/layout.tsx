"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Avatar } from '@/core/ui/Avatar';
import { 
  LuLayers, 
  LuBookOpen, 
  LuSearch, 
  LuUser, 
  LuCalendar, 
  LuLogOut, 
  LuHouse, 
  LuMenu, 
  LuX,
  LuChevronLeft
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
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (status === 'loading') {
    return (
      <div className="w-full bg-[#FAFBFD] min-h-screen flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-xs font-black text-[#64748B] uppercase tracking-widest">Đang tải bố cục...</p>
        </div>
      </div>
    );
  }

  const isMentor = session?.user?.role === 'mentor';

  // Sidebar links based on role
  const sidebarItems: SidebarItem[] = isMentor 
    ? [
        { label: 'Bảng điều khiển', href: '/dashboard', icon: <LuLayers size={18} /> },
        { label: 'Lịch dạy của tôi', href: '/mentor/bookings', icon: <LuCalendar size={18} /> },
        { label: 'Khóa học đã tạo', href: '/mentor/courses', icon: <LuBookOpen size={18} /> },
        { label: 'Hồ sơ cá nhân', href: '/profile', icon: <LuUser size={18} /> },
      ]
    : [
        { label: 'Bảng điều khiển', href: '/dashboard', icon: <LuLayers size={18} /> },
        { label: 'Lịch học của tôi', href: '/my-courses', icon: <LuCalendar size={18} /> },
        { label: 'Khám phá khóa học', href: '/courses', icon: <LuSearch size={18} /> },
        { label: 'Hồ sơ cá nhân', href: '/profile', icon: <LuUser size={18} /> },
      ];

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#1E293B] text-white p-6 font-sans">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 mb-8 border-b border-slate-700/50 pb-6">
        <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-white text-base">
          HT
        </div>
        <div className="flex flex-col">
          <span className="font-black text-sm tracking-tight">HỌC TỪ THIỆN</span>
          <span className="text-[9px] text-[#94A3B8] font-black uppercase tracking-widest">Dashboard</span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 flex flex-col gap-1.5">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-xs font-bold tracking-wide transition-all no-underline ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 font-black' 
                  : 'text-[#94A3B8] hover:text-white hover:bg-slate-800'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Exit Links */}
      <div className="border-t border-slate-700/50 pt-6 mt-6 flex flex-col gap-2">
        <Link 
          href="/" 
          className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-xs font-bold tracking-wide text-[#94A3B8] hover:text-white hover:bg-slate-800 no-underline"
        >
          <LuHouse size={18} />
          <span>Về trang chủ</span>
        </Link>
        <button 
          onClick={handleSignOut}
          className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-xs font-bold tracking-wide text-rose-400 hover:text-white hover:bg-rose-500/10 cursor-pointer text-left border-0 bg-transparent transition-all"
        >
          <LuLogOut size={18} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#FAFBFD] font-sans">
      
      {/* 1. Desktop Sidebar */}
      <aside className="hidden lg:block w-[260px] h-screen sticky top-0 flex-shrink-0 z-30 border-r border-slate-200">
        {sidebarContent}
      </aside>

      {/* 2. Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-[260px] h-full shadow-2xl flex flex-col animate-slide-in">
            <button 
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-white hover:text-slate-200 z-50 p-1"
            >
              <LuX size={20} />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* 3. Main Body Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="sticky top-0 bg-white border-b border-[#E2E8F0] h-16 flex items-center justify-between px-6 z-20 shadow-sm">
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 text-slate-600 hover:text-blue-600 rounded-lg hover:bg-slate-50 border-0 bg-transparent cursor-pointer"
          >
            <LuMenu size={20} />
          </button>

          {/* Page Path Indicator */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-[#64748B]">
            <span className="uppercase tracking-wider text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 border border-slate-200/50">
              {isMentor ? 'Khu vực Cố vấn' : 'Khu vực Học viên'}
            </span>
          </div>

          {/* User Account / Actions */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex flex-col text-right hidden md:flex">
                <strong className="text-xs text-slate-700 leading-tight block">{session?.user?.name}</strong>
                <span className="text-[10px] text-slate-400 font-semibold block">{session?.user?.email}</span>
              </div>
              <Avatar 
                src={session?.user?.image || undefined} 
                name={session?.user?.name || ''} 
                size="sm"
                className="border border-slate-200"
              />
            </div>
          </div>
        </header>

        {/* Content Box */}
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
