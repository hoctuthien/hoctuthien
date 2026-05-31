"use client";

import React, { useState, useEffect } from 'react';
import { Breadcrumb } from '@shared';
import { courseBookingGateway, courseGateway, authGateway } from '@/core/gateway';
import { useSession } from 'next-auth/react';
import { 
  LuPlus, 
  LuArrowRight, 
  LuGraduationCap,
  LuInfo
} from 'react-icons/lu';

// Import SOLID Subcomponents
import { WelcomeBanner } from './components/WelcomeBanner';
import { MetricsGrid } from './components/MetricsGrid';
import { DashboardCalendar, getLocalDateString } from './components/DashboardCalendar';
import { CourseList } from './components/CourseList';
import { UpcomingClassCard } from './components/UpcomingClassCard';

interface CourseItem {
  id: string;
  title: string;
  thumbnail: string;
  price: number;
  mentorName?: string;
  mentorAvatar?: string | null;
  progressPercent: number;
  totalSessions: number;
  completedSessions: number;
  category?: string;
  status?: string;
  studentsCount?: number;
}

interface CalendarSlot {
  id: string;
  timeLabel: string;
  dateStr: string;
  courseTitle: string;
  partnerName: string;
  partnerAvatar?: string | null;
  googleMeetUrl: string | null;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
}

export default function DashboardClient() {
  const { data: session, status: authStatus } = useSession();
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [isVerified, setIsVerified] = useState<boolean>(true);
  
  // Dashboard Metrics state
  const [metrics, setMetrics] = useState({
    stat1: 0,
    stat2: 0,
    stat3: 0,
    stat4: 0,
  });

  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [calendarSlots, setCalendarSlots] = useState<CalendarSlot[]>([]);
  
  // Calendar Week Offset state
  const [weekOffset, setWeekOffset] = useState(0);
  const [currentWeekDays, setCurrentWeekDays] = useState<{ dayName: string; date: Date; dateStr: string }[]>([]);

  // Calculate current week dates dynamically based on weekOffset
  useEffect(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const differenceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + differenceToMonday + weekOffset * 7);

    const days = [];
    const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
    
    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(monday);
      currentDay.setDate(monday.getDate() + i);
      const dateStr = getLocalDateString(currentDay);
      days.push({
        dayName: dayNames[i],
        date: currentDay,
        dateStr,
      });
    }
    setCurrentWeekDays(days);
  }, [weekOffset]);

  const loadDashboardData = async () => {
    if (!session) return;
    try {
      setLoading(true);
      const isMentor = session.user?.role === 'mentor';

      // Fetch user verified status
      try {
        const meRes = await authGateway.getMe();
        setIsVerified((meRes.user as any)?.isVerified ?? false);
      } catch (err) {
        console.error('Error fetching user profile verified status:', err);
      }

      // 1. Fetch All Bookings
      const bookingsRes = await courseBookingGateway.getMyBookings({ limit: 100 });
      const bookings = bookingsRes.data || [];
      setAllBookings(bookings);

      // 2. Fetch Mentor Courses if Mentor
      let mentorCourses: any[] = [];
      if (isMentor) {
        try {
          mentorCourses = await courseGateway.getMyCourses();
        } catch (e) {
          console.error('Error fetching mentor courses:', e);
        }
      }

      // Calculate Metrics and Courses list based on Role
      if (isMentor) {
        // Mentor Dashboard Logic
        const upcomingCount = bookings.filter((b: any) => b.status === 'pending' || b.status === 'confirmed' || b.status === 'rescheduled').length;
        const completedCount = bookings.filter((b: any) => b.status === 'completed').length;
        const uniqueStudents = new Set(bookings.map((b: any) => b.menteeId));

        setMetrics({
          stat1: mentorCourses.length,
          stat2: upcomingCount,
          stat3: completedCount,
          stat4: uniqueStudents.size,
        });

        // Map Mentor Taught Courses
        const mappedCourses: CourseItem[] = mentorCourses.map((c: any) => {
          const courseBookings = bookings.filter((b: any) => b.courseId === c.id);
          const distinctStudents = new Set(courseBookings.map((b: any) => b.menteeId)).size;
          
          return {
            id: c.id,
            title: c.title,
            thumbnail: c.thumbnail,
            price: c.price,
            progressPercent: c.status === 'published' ? 100 : 30,
            totalSessions: courseBookings.length,
            completedSessions: courseBookings.filter((b: any) => b.status === 'completed').length,
            category: c.category,
            status: c.status,
            studentsCount: distinctStudents,
          };
        });
        setCourses(mappedCourses);

        // Map Calendar slots for Mentor (with Date validity check)
        const slots: CalendarSlot[] = bookings.map((b: any) => {
          const mTime = b.meetingTime ? new Date(b.meetingTime) : null;
          const isValid = mTime && !isNaN(mTime.getTime());
          return {
            id: b.id,
            timeLabel: isValid ? mTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Chưa định giờ',
            dateStr: (isValid && mTime) ? getLocalDateString(mTime) : '',
            courseTitle: b.course?.title || 'Khóa học',
            partnerName: b.mentee?.name || 'Học viên',
            partnerAvatar: b.mentee?.avatarUrl,
            googleMeetUrl: b.googleMeetUrl,
            status: b.status,
          };
        }).filter((s: CalendarSlot) => s.dateStr !== '');
        setCalendarSlots(slots);

      } else {
        // Mentee / Student Dashboard Logic
        const upcomingCount = bookings.filter((b: any) => b.status === 'pending' || b.status === 'confirmed' || b.status === 'rescheduled').length;
        const completedCount = bookings.filter((b: any) => b.status === 'completed').length;
        
        // Group bookings to get unique Enrolled Courses
        const courseMap = new Map<string, any>();
        bookings.forEach((b: any) => {
          if (b.courseId && b.course) {
            if (!courseMap.has(b.courseId)) {
              courseMap.set(b.courseId, {
                course: b.course,
                bookings: [],
              });
            }
            courseMap.get(b.courseId).bookings.push(b);
          }
        });

        // 1 session ~ 1.5 hours studied
        const totalHours = completedCount * 1.5; 

        setMetrics({
          stat1: courseMap.size,
          stat2: upcomingCount,
          stat3: completedCount,
          stat4: totalHours,
        });

        // Map Enrolled Courses
        const mappedCourses: CourseItem[] = Array.from(courseMap.values()).map(({ course, bookings: courseBookings }) => {
          const completed = courseBookings.filter((b: any) => b.status === 'completed').length;
          const total = courseBookings.length;
          const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
          
          return {
            id: course.id,
            title: course.title,
            thumbnail: course.thumbnailUrl || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=120&q=80',
            price: course.price || 0,
            mentorName: course.mentor?.name || 'Đang phân công',
            mentorAvatar: course.mentor?.avatarUrl,
            progressPercent: percent || 25,
            totalSessions: total,
            completedSessions: completed,
            category: 'Khóa học đã đăng ký',
          };
        });
        setCourses(mappedCourses);

        // Map Calendar slots for Mentee (with Date validity check)
        const slots: CalendarSlot[] = bookings.map((b: any) => {
          const mTime = b.meetingTime ? new Date(b.meetingTime) : null;
          const isValid = mTime && !isNaN(mTime.getTime());
          return {
            id: b.id,
            timeLabel: isValid ? mTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Chưa định giờ',
            dateStr: (isValid && mTime) ? getLocalDateString(mTime) : '',
            courseTitle: b.course?.title || 'Khóa học',
            partnerName: b.course?.mentor?.name || 'Cố vấn học tập',
            partnerAvatar: b.course?.mentor?.avatarUrl,
            googleMeetUrl: b.googleMeetUrl,
            status: b.status,
          };
        }).filter((s: CalendarSlot) => s.dateStr !== '');
        setCalendarSlots(slots);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authStatus === 'authenticated') {
      loadDashboardData();
    }
  }, [authStatus, session]);

  if (authStatus === 'loading' || loading) {
    return (
      <div className="w-full bg-[#FAFBFD] min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-xs font-black text-[#64748B] uppercase tracking-widest font-sans">Đang tải bảng điều khiển...</p>
        </div>
      </div>
    );
  }

  const isMentor = session?.user?.role === 'mentor';
  const welcomeMessage = isMentor 
    ? 'Xin chào Cố vấn học tập! Cùng theo dõi các lớp học hôm nay nhé.' 
    : 'Bắt đầu hành trình chinh phục kiến thức thiện nguyện cùng các Cố vấn nào!';

  const breadcrumbItems = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Bảng điều khiển' },
  ];

  // Reusable Sidebar right column content
  const rightSidebarContent = (
    <>
      {/* Quick Explore / Creation banner */}
      {isMentor ? (
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[32px] p-6 shadow-lg shadow-emerald-500/10 flex flex-col gap-4 text-white">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
            <LuPlus size={24} className="text-emerald-200" />
          </div>
          <h3 className="text-base font-black tracking-tight leading-snug font-[Montserrat] mt-1">
            Tạo Thêm Khóa Học Mới
          </h3>
          <p className="text-xs text-emerald-100/90 leading-relaxed font-medium">
            Truyền thụ tri thức và giúp đỡ các em học sinh có hoàn cảnh khó khăn qua những bài giảng bổ ích của bạn.
          </p>
          
          <button
            onClick={() => window.location.href = '/mentor/courses'}
            className="bg-white hover:bg-slate-50 text-emerald-700 text-xs font-black px-5 py-3 rounded-xl uppercase tracking-wider text-center transition-all cursor-pointer shadow-md active:scale-[0.98] mt-2 flex items-center justify-center gap-1 opacity-90 border-0"
          >
            <span>Tạo khóa học mới</span>
            <LuPlus size={14} />
          </button>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[32px] p-6 shadow-lg shadow-indigo-500/10 flex flex-col gap-4 text-white">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
            <LuGraduationCap size={24} className="text-cyan-300" />
          </div>
          <h3 className="text-base font-black tracking-tight leading-snug font-[Montserrat] mt-1">
            Đăng Ký Khóa Học Mới?
          </h3>
          <p className="text-xs text-indigo-100/90 leading-relaxed font-medium">
            Hàng ngàn Cố vấn học tập tận tụy từ khắp các trường Đại học luôn sẵn lòng đồng hành cùng bạn 100% miễn phí.
          </p>
          
          <button
            onClick={() => window.location.href = '/courses'}
            className="bg-white hover:bg-slate-50 text-indigo-700 text-xs font-black px-5 py-3 rounded-xl uppercase tracking-wider text-center transition-all cursor-pointer shadow-md active:scale-[0.98] mt-2 flex items-center justify-center gap-1 opacity-90 border-0"
          >
            <span>Khám phá ngay</span>
            <LuArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Upcoming Next Study Class Card */}
      <UpcomingClassCard 
        isMentor={isMentor} 
        allBookings={allBookings} 
      />

      {/* Quick Profile details */}
      <div className="bg-white border border-[#E2E8F0] rounded-[32px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.005)] flex items-center gap-4">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
          <img 
            src={session?.user?.image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'} 
            alt={session?.user?.name || 'Tài khoản'} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col min-w-0 gap-0.5">
          <strong className="text-xs font-black text-slate-800 block truncate leading-tight">
            {session?.user?.name}
          </strong>
          <span className="text-[10px] text-slate-400 font-bold block truncate leading-tight">
            {session?.user?.email}
          </span>
          <span className="text-[8px] bg-slate-100 text-slate-500 font-black px-2 py-0.5 rounded-full uppercase tracking-wider w-max border border-slate-200/50 mt-1">
            {isMentor ? 'Cố vấn' : 'Học viên'}
          </span>
        </div>
      </div>
    </>
  );

  return (
    <div className="w-full bg-[#FAFBFD] min-h-screen py-8 px-4 md:px-8 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        
        {/* Title, Breadcrumb & Welcome Banner */}
        <div className="flex flex-col gap-2">
          <Breadcrumb items={breadcrumbItems} />
          
          <WelcomeBanner 
            name={session?.user?.name || ''} 
            isMentor={isMentor} 
            message={welcomeMessage} 
          />
        </div>

        {/* Activation Warning Banner for Unverified Mentees */}
        {!isMentor && !isVerified && (
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-[32px] p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[0_4px_20px_rgba(245,158,11,0.03)] animate-pulse-subtle">
            <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
              <div className="w-12 h-12 bg-amber-500/20 text-amber-600 rounded-2xl flex items-center justify-center flex-shrink-0 border border-amber-500/10 shadow-inner">
                <LuInfo size={24} />
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="text-sm font-black text-slate-800 font-[Montserrat] tracking-tight">
                  Tài Khoản Chưa Được Kích Hoạt 🔐
                </h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xl">
                  Để bắt đầu đăng ký học 100% miễn phí từ hàng ngàn Cố vấn tận tâm, hãy tiến hành kích hoạt tài khoản của bạn.
                </p>
              </div>
            </div>
            <button
              onClick={() => window.location.href = '/activation'}
              className="w-full sm:w-max bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-black px-6 py-3.5 rounded-2xl uppercase tracking-wider text-center transition-all cursor-pointer shadow-lg shadow-amber-500/15 hover:shadow-xl hover:shadow-amber-500/20 active:scale-[0.98] border-0"
            >
              Kích hoạt ngay
            </button>
          </div>
        )}

        {/* 1. Statistics Cards */}
        <MetricsGrid 
          isMentor={isMentor} 
          stat1={metrics.stat1} 
          stat2={metrics.stat2} 
          stat3={metrics.stat3} 
          stat4={metrics.stat4} 
        />

        {/* 2. Responsive Main Layout */}
        {viewMode === 'month' ? (
          <div className="flex flex-col gap-8 w-full">
            {/* FULL-WIDTH MONTHLY CALENDAR GRID */}
            <div className="w-full">
              <DashboardCalendar 
                currentWeekDays={currentWeekDays} 
                calendarSlots={calendarSlots} 
                isMentor={isMentor} 
                setWeekOffset={setWeekOffset} 
                weekOffset={weekOffset}
                viewMode={viewMode}
                setViewMode={setViewMode}
              />
            </div>
            
            {/* Rest of items in columns below */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 flex flex-col gap-8">
                <CourseList courses={courses} isMentor={isMentor} />
              </div>
              <div className="flex flex-col gap-8">
                {rightSidebarContent}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 2/3 COLUMN WEEKLY CALENDAR & COURSES */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              <DashboardCalendar 
                currentWeekDays={currentWeekDays} 
                calendarSlots={calendarSlots} 
                isMentor={isMentor} 
                setWeekOffset={setWeekOffset} 
                weekOffset={weekOffset}
                viewMode={viewMode}
                setViewMode={setViewMode}
              />
              <CourseList courses={courses} isMentor={isMentor} />
            </div>
            
            {/* 1/3 COLUMN SIDEBAR */}
            <div className="flex flex-col gap-8">
              {rightSidebarContent}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
