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
  LuCalendarDays,
  LuLogOut, 
  LuHouse, 
  LuMenu, 
  LuX,
  LuChevronLeft,
  LuChevronRight,
  LuBug
} from 'react-icons/lu';
import { ReportBugModal } from '@/shared/components/ReportBugModal';

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
  const [collapsed, setCollapsed] = useState(false);
  const [bugReportOpen, setBugReportOpen] = useState(false);

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

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-[#E2E8F0] p-4 font-sans justify-between transition-all duration-300">
      <div className="flex flex-col gap-6">
        {/* Brand Logo */}
        <div className={`flex items-center gap-3 border-b border-[#F1F5F9] pb-5 ${collapsed ? 'justify-center' : 'px-2'}`}>
          <div className="w-10 h-10 bg-gradient-to-tr from-[#005BBF] to-[#004493] rounded-xl flex items-center justify-center flex-shrink-0 font-black text-white text-base shadow-md shadow-[#005BBF]/10">
            HT
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-black text-sm text-[#0F172A] tracking-tight">HỌC TỪ THIỆN</span>
              <span className="text-[9px] text-[#94A3B8] font-black uppercase tracking-widest">Dashboard</span>
            </div>
          )}
        </div>

        {/* Nav Menu */}
        <nav className="flex flex-col gap-1.5">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-xs font-black transition-all no-underline ${
                  isActive 
                    ? 'bg-gradient-to-r from-[#005BBF] to-[#004493] text-white shadow-lg shadow-[#005BBF]/15' 
                    : 'text-[#475569] hover:text-[#005BBF] hover:bg-[#DFEFFF]/50'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <div className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-[#005BBF]'}`}>
                  {item.icon}
                </div>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Exit Links */}
      <div className="flex flex-col gap-1.5 border-t border-[#F1F5F9] pt-4">
        {/* Report Bug Button */}
        <button
          onClick={() => setBugReportOpen(true)}
          className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-xs font-black text-amber-600 hover:text-white hover:bg-amber-500 transition-all cursor-pointer text-left border-0 bg-transparent ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Báo lỗi' : undefined}
        >
          <LuBug size={18} />
          {!collapsed && <span>Báo lỗi</span>}
        </button>

        <Link 
          href="/" 
          className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-xs font-black text-[#475569] hover:text-blue-600 hover:bg-[#F0F7FF] no-underline ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Về trang chủ' : undefined}
        >
          <LuHouse size={18} className="text-slate-500" />
          {!collapsed && <span>Về trang chủ</span>}
        </Link>
        <button 
          onClick={handleSignOut}
          className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-xs font-black text-rose-500 hover:text-white hover:bg-rose-500 transition-all cursor-pointer text-left border-0 bg-transparent ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Đăng xuất' : undefined}
        >
          <LuLogOut size={18} />
          {!collapsed && <span>Đăng xuất</span>}
        </button>

        {/* Desktop Collapse Toggle Switch */}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center w-full mt-2 py-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer border-0 bg-transparent"
        >
          {collapsed ? <LuChevronRight size={18} /> : (
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
              <LuChevronLeft size={16} />
              <span>Thu gọn</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#FAFBFD] font-sans">
      
      {/* 1. Desktop Sidebar */}
      <aside 
        className="hidden lg:block h-screen sticky top-0 flex-shrink-0 z-30 transition-all duration-300 ease-in-out"
        style={{ width: collapsed ? '80px' : '260px' }}
      >
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
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 z-50 p-1"
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
        <header className="sticky top-0 bg-white border-b border-[#E2E8F0] h-16 flex items-center justify-between px-6 z-20 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
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
                <strong className="text-xs text-slate-700 leading-tight block font-black">{session?.user?.name}</strong>
                <span className="text-[10px] text-slate-400 font-semibold block">{session?.user?.email}</span>
              </div>
              <Avatar 
                src={session?.user?.image || undefined} 
                name={session?.user?.name || ''} 
                size="sm"
                className="border border-slate-200 shadow-sm"
              />
            </div>
          </div>
        </header>

        {/* Content Box */}
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Report Bug Modal */}
      <ReportBugModal isOpen={bugReportOpen} onClose={() => setBugReportOpen(false)} />
    </div>
  );
}
