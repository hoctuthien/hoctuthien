"use client";

import React, { useState, useEffect } from 'react';
import { Breadcrumb, EmptyState } from '@shared';
import { courseBookingGateway, courseGateway } from '@/core/gateway';
import { Button } from '@/core/ui';
import { useSession } from 'next-auth/react';
import { 
  LuCalendar, 
  LuClock, 
  LuBookOpen, 
  LuCheck, 
  LuPlus, 
  LuChevronLeft, 
  LuChevronRight, 
  LuUser, 
  LuUsers, 
  LuExternalLink, 
  LuVideo, 
  LuGraduationCap, 
  LuArrowRight,
  LuTrendingUp,
  LuLayers
} from 'react-icons/lu';

// Types representing mapped data
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
  partnerName: string; // Mentee name for mentor, Mentor name for mentee
  partnerAvatar?: string | null;
  googleMeetUrl: string | null;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
}

export default function DashboardClient() {
  const { data: session, status: authStatus } = useSession();
  const [loading, setLoading] = useState(true);
  
  // Dashboard Metrics
  const [metrics, setMetrics] = useState({
    stat1: 0, // Enrolled courses for Mentee, Created courses for Mentor
    stat2: 0, // Upcoming sessions for both
    stat3: 0, // Completed sessions for both
    stat4: 0, // Study hours for Mentee, Total Students for Mentor
  });

  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [calendarSlots, setCalendarSlots] = useState<CalendarSlot[]>([]);
  
  // Calendar Week Offset (0 = current week, -1 = last week, 1 = next week etc.)
  const [weekOffset, setWeekOffset] = useState(0);
  const [currentWeekDays, setCurrentWeekDays] = useState<{ dayName: string; date: Date; dateStr: string }[]>([]);

  // Calculate current week dates based on weekOffset
  useEffect(() => {
    const today = new Date();
    // Get Monday of the current week
    const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday etc.
    const differenceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + differenceToMonday + weekOffset * 7);

    const days = [];
    const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
    
    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(monday);
      currentDay.setDate(monday.getDate() + i);
      const dateStr = currentDay.toISOString().split('T')[0];
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
        
        // Find unique student accounts taught
        const uniqueStudents = new Set(bookings.map((b: any) => b.menteeId));

        setMetrics({
          stat1: mentorCourses.length,
          stat2: upcomingCount,
          stat3: completedCount,
          stat4: uniqueStudents.size,
        });

        // Map Mentor Taught Courses
        const mappedCourses: CourseItem[] = mentorCourses.map((c: any) => {
          // Count active student bookings for this course
          const courseBookings = bookings.filter((b: any) => b.courseId === c.id);
          const distinctStudents = new Set(courseBookings.map((b: any) => b.menteeId)).size;
          
          return {
            id: c.id,
            title: c.title,
            thumbnail: c.thumbnail,
            price: c.price,
            progressPercent: c.status === 'published' ? 100 : 30, // Mock based on state
            totalSessions: courseBookings.length,
            completedSessions: courseBookings.filter((b: any) => b.status === 'completed').length,
            category: c.category,
            status: c.status,
            studentsCount: distinctStudents,
          };
        });
        setCourses(mappedCourses);

        // Map Calendar slots for Mentor
        const slots: CalendarSlot[] = bookings.map((b: any) => {
          const mTime = new Date(b.meetingTime);
          return {
            id: b.id,
            timeLabel: mTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            dateStr: mTime.toISOString().split('T')[0],
            courseTitle: b.course?.title || 'Khóa học',
            partnerName: b.mentee?.name || 'Học viên',
            partnerAvatar: b.mentee?.avatarUrl,
            googleMeetUrl: b.googleMeetUrl,
            status: b.status,
          };
        });
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

        // 1 session ~ 1 hour mock
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
            progressPercent: percent || 25, // Mock fallback to keep UX premium
            totalSessions: total,
            completedSessions: completed,
            category: 'Khóa học đã đăng ký',
          };
        });
        setCourses(mappedCourses);

        // Map Calendar slots for Mentee
        const slots: CalendarSlot[] = bookings.map((b: any) => {
          const mTime = new Date(b.meetingTime);
          return {
            id: b.id,
            timeLabel: mTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            dateStr: mTime.toISOString().split('T')[0],
            courseTitle: b.course?.title || 'Khóa học',
            partnerName: b.course?.mentor?.name || 'Cố vấn học tập',
            partnerAvatar: b.course?.mentor?.avatarUrl,
            googleMeetUrl: b.googleMeetUrl,
            status: b.status,
          };
        });
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

  return (
    <div className="w-full bg-[#FAFBFD] min-h-screen py-8 px-4 md:px-8 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        
        {/* Title, Breadcrumb & Welcome Banner */}
        <div className="flex flex-col gap-2">
          <Breadcrumb items={breadcrumbItems} />
          
          <div className="relative mt-2 p-6 md:p-8 rounded-[32px] overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-900 shadow-xl shadow-blue-900/10 flex flex-col gap-3 text-white">
            <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 translate-y-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full w-max text-[10px] font-black uppercase tracking-wider">
              <LuTrendingUp size={12} className="text-emerald-400" />
              <span>BẢNG ĐIỀU KHIỂN HỌC TẬP THÔNG MINH</span>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-tight mt-1 font-[Montserrat]">
              Chào mừng trở lại, {session?.user?.name}! ✨
            </h1>
            <p className="text-sm text-blue-100/90 font-medium max-w-2xl leading-relaxed">
              {welcomeMessage}
            </p>
          </div>
        </div>

        {/* 1. Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Stat 1 */}
          <div className="bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.005)] flex items-center gap-4 hover:shadow-md transition-all duration-300">
            <div className="w-10 h-10 bg-blue-50 text-[#2563eb] rounded-xl flex items-center justify-center flex-shrink-0">
              {isMentor ? <LuLayers size={20} /> : <LuBookOpen size={20} />}
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-[10px] text-[#64748b] font-black uppercase tracking-wider block truncate">
                {isMentor ? 'KHÓA HỌC ĐÃ TẠO' : 'KHÓA HỌC ĐÃ ĐĂNG KÝ'}
              </span>
              <span className="text-xl font-black text-[#0F172A]">{metrics.stat1}</span>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.005)] flex items-center gap-4 hover:shadow-md transition-all duration-300">
            <div className="w-10 h-10 bg-amber-50 text-[#D97706] rounded-xl flex items-center justify-center flex-shrink-0">
              <LuCalendar size={20} />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-[10px] text-[#64748b] font-black uppercase tracking-wider block truncate">LỊCH HẸN SẮP TỚI</span>
              <span className="text-xl font-black text-[#D97706]">{metrics.stat2}</span>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.005)] flex items-center gap-4 hover:shadow-md transition-all duration-300">
            <div className="w-10 h-10 bg-emerald-50 text-[#10B981] rounded-xl flex items-center justify-center flex-shrink-0">
              <LuCheck size={20} />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-[10px] text-[#64748b] font-black uppercase tracking-wider block truncate">ĐÃ HOÀN THÀNH</span>
              <span className="text-xl font-black text-[#10B981]">{metrics.stat3}</span>
            </div>
          </div>

          {/* Stat 4 */}
          <div className="bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.005)] flex items-center gap-4 hover:shadow-md transition-all duration-300">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
              {isMentor ? <LuUsers size={20} /> : <LuClock size={20} />}
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-[10px] text-[#64748b] font-black uppercase tracking-wider block truncate">
                {isMentor ? 'HỌC VIÊN ĐANG GIẢNG DẠY' : 'SỐ GIỜ HỌC TÍCH LŨY'}
              </span>
              <span className="text-xl font-black text-indigo-600">
                {isMentor ? metrics.stat4 : `${metrics.stat4}h`}
              </span>
            </div>
          </div>
        </div>

        {/* 2-Column Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Column Left (2/3 width on large screens): Courses & Calendars */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* Calendar Section */}
            <div className="bg-white border border-[#E2E8F0] rounded-[32px] p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.005)] flex flex-col gap-6">
              
              {/* Calendar Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider">LỊCH PHÂN BỔ THỜI GIAN THỰC</span>
                  <h2 className="text-xl font-black text-[#0F172A] font-[Montserrat]">Lịch Trình Tuần Này</h2>
                </div>
                
                {/* Week Control */}
                <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-1 w-max">
                  <button 
                    onClick={() => setWeekOffset(prev => prev - 1)}
                    className="p-1.5 hover:bg-white rounded-lg transition-all text-[#64748B] hover:text-[#0F172A] cursor-pointer"
                  >
                    <LuChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setWeekOffset(0)}
                    className="px-3 py-1 bg-white shadow-sm border border-slate-100 rounded-lg text-[10px] font-black text-blue-600 uppercase cursor-pointer"
                  >
                    Tuần Này
                  </button>
                  <button 
                    onClick={() => setWeekOffset(prev => prev + 1)}
                    className="p-1.5 hover:bg-white rounded-lg transition-all text-[#64748B] hover:text-[#0F172A] cursor-pointer"
                  >
                    <LuChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Weekly Calendar Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
                {currentWeekDays.map((day) => {
                  const dayBookings = calendarSlots.filter(s => s.dateStr === day.dateStr && s.status !== 'cancelled');
                  const isToday = new Date().toISOString().split('T')[0] === day.dateStr;
                  
                  return (
                    <div 
                      key={day.dateStr}
                      className={`flex flex-col rounded-2xl p-3 border transition-all duration-300 min-h-[140px] ${
                        isToday 
                          ? 'bg-blue-50/40 border-blue-200 ring-2 ring-blue-100' 
                          : 'bg-slate-50/50 border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                        <span className="text-[10px] font-black text-[#475569]">{day.dayName}</span>
                        <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-extrabold ${
                          isToday ? 'bg-blue-600 text-white' : 'text-[#94A3B8]'
                        }`}>
                          {day.date.getDate()}
                        </span>
                      </div>

                      {/* Day's appointments */}
                      <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
                        {dayBookings.length > 0 ? (
                          dayBookings.map((slot) => {
                            let statusColor = 'bg-amber-100 border-amber-200 text-amber-800';
                            if (slot.status === 'confirmed') statusColor = 'bg-emerald-100 border-emerald-200 text-emerald-800';
                            else if (slot.status === 'completed') statusColor = 'bg-slate-100 border-slate-200 text-slate-500';
                            else if (slot.status === 'rescheduled') statusColor = 'bg-blue-100 border-blue-200 text-blue-800';

                            return (
                              <div 
                                key={slot.id}
                                className={`p-2 rounded-xl border flex flex-col gap-1 shadow-sm text-[9px] ${statusColor}`}
                                title={`${slot.courseTitle} - với ${slot.partnerName}`}
                              >
                                <div className="flex items-center justify-between font-extrabold">
                                  <span className="flex items-center gap-0.5">
                                    <LuClock size={9} />
                                    {slot.timeLabel}
                                  </span>
                                  {slot.googleMeetUrl && (
                                    <a 
                                      href={slot.googleMeetUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-700"
                                    >
                                      <LuVideo size={10} />
                                    </a>
                                  )}
                                </div>
                                <span className="font-extrabold line-clamp-1 break-all">{slot.courseTitle}</span>
                                <span className="text-[8px] text-[#64748B] block truncate">
                                  {isMentor ? 'HV: ' : 'CV: '}{slot.partnerName}
                                </span>
                              </div>
                            );
                          })
                        ) : (
                          <div className="flex-1 flex items-center justify-center">
                            <span className="text-[9px] font-bold text-[#94A3B8] italic">Trống</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Courses Enrolled / Created */}
            <div className="bg-white border border-[#E2E8F0] rounded-[32px] p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.005)] flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider">TIẾN TRÌNH HỌC TẬP</span>
                  <h2 className="text-xl font-black text-[#0F172A] font-[Montserrat]">
                    {isMentor ? 'Khóa Học Tôi Đảm Nhận' : 'Khóa Học Đã Đăng Ký'}
                  </h2>
                </div>
                <Button 
                  label={isMentor ? 'Quản lý khóa học' : 'Xem lịch học'}
                  variant="outline"
                  className="rounded-full text-xs font-black"
                  onClick={() => window.location.href = isMentor ? '/mentor/courses' : '/my-courses'}
                />
              </div>

              {courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {courses.map((course) => (
                    <div 
                      key={course.id}
                      className="bg-[#F8FAFC] border border-[#E2E8F0]/70 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-start gap-4">
                        {/* Thumbnail */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-100">
                          <img 
                            src={course.thumbnail} 
                            alt={course.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Title, Mentor details */}
                        <div className="flex flex-col gap-1 min-w-0">
                          <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest">
                            {course.category || 'HỌC TẬP'}
                          </span>
                          <h3 
                            className="text-xs font-black text-[#0f172a] line-clamp-2 leading-snug cursor-pointer hover:text-blue-600"
                            onClick={() => window.location.href = `/courses/detail/${course.id}`}
                          >
                            {course.title}
                          </h3>
                          
                          {/* Mentor Info for Mentee, Active student count for Mentor */}
                          {isMentor ? (
                            <span className="text-[10px] text-[#64748B] font-semibold">
                              Học viên tích cực: <strong className="text-slate-600">{course.studentsCount || 0}</strong>
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#64748B] font-semibold">
                              Cố vấn: <strong className="text-slate-600">{course.mentorName}</strong>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Course progress */}
                      <div className="mt-4 pt-3 border-t border-slate-200/50 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                          <span>Tiến độ bài học:</span>
                          <span className="text-blue-600 font-extrabold">{course.progressPercent}%</span>
                        </div>
                        
                        <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${course.progressPercent}%` }}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between text-[9px] font-bold text-[#94A3B8] mt-1">
                          <span>
                            {course.completedSessions}/{course.totalSessions || 1} buổi học đã xong
                          </span>
                          <a 
                            href={`/courses/detail/${course.id}`}
                            className="text-blue-600 hover:text-blue-700 font-black flex items-center gap-0.5 no-underline"
                          >
                            Chi tiết khóa học
                            <LuArrowRight size={10} />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<LuBookOpen size={48} className="text-slate-300" />}
                  title={isMentor ? 'Không có khóa học nào' : 'Bạn chưa học khóa nào'}
                  description={isMentor ? 'Hãy bắt đầu tạo khóa học giảng dạy thiện nguyện đầu tiên.' : 'Hãy khám phá danh sách và đăng ký khóa học đầu tiên của bạn.'}
                  actionText={isMentor ? 'Tạo khóa học ngay' : 'Tìm kiếm khóa học'}
                  onAction={() => window.location.href = isMentor ? '/courses/create' : '/courses'}
                />
              )}
            </div>

          </div>

          {/* Column Right (1/3 width): Sidebar, quick notifications, registration cards */}
          <div className="flex flex-col gap-8">
            
            {/* Quick Explore banner (Only for Student) */}
            {!isMentor && (
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
                  className="bg-white hover:bg-slate-50 text-indigo-700 text-xs font-black px-5 py-3 rounded-xl uppercase tracking-wider text-center transition-all cursor-pointer shadow-md active:scale-[0.98] mt-2 flex items-center justify-center gap-1"
                >
                  <span>Khám phá ngay</span>
                  <LuArrowRight size={14} />
                </button>
              </div>
            )}

            {/* Mentor Actions (Only for Mentor) */}
            {isMentor && (
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
                  onClick={() => window.location.href = '/courses/create'}
                  className="bg-white hover:bg-slate-50 text-emerald-700 text-xs font-black px-5 py-3 rounded-xl uppercase tracking-wider text-center transition-all cursor-pointer shadow-md active:scale-[0.98] mt-2 flex items-center justify-center gap-1"
                >
                  <span>Tạo khóa học mới</span>
                  <LuPlus size={14} />
                </button>
              </div>
            )}

            {/* Upcoming Next Study Class Card */}
            <div className="bg-white border border-[#E2E8F0] rounded-[32px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.005)] flex flex-col gap-5">
              <div className="flex flex-col gap-1 border-b border-slate-100 pb-3">
                <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">THỜI GIAN BIỂU HÔM NAY</span>
                <h3 className="text-xs font-black text-[#0F172A] font-[Montserrat]">
                  {isMentor ? 'Buổi Dạy Sắp Tới' : 'Lớp Học Tiếp Theo'}
                </h3>
              </div>

              {allBookings.filter(b => b.status === 'confirmed' || b.status === 'pending').slice(0, 1).map((nextBooking) => {
                const bTime = new Date(nextBooking.meetingTime);
                const isConfirmed = nextBooking.status === 'confirmed';
                
                return (
                  <div key={nextBooking.id} className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-[#64748B] font-bold">Giờ họp:</span>
                      <strong className="text-slate-800 flex items-center gap-1 font-black">
                        <LuClock size={13} className="text-blue-500" />
                        {bTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}, {bTime.toLocaleDateString('vi-VN')}
                      </strong>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 border border-slate-200/50 flex-shrink-0">
                        <img 
                          src={isMentor ? nextBooking.mentee?.avatarUrl : nextBooking.course?.mentor?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'} 
                          alt="Partner" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col min-w-0 gap-0.5">
                        <span className="text-[8px] text-[#94A3B8] font-black uppercase tracking-wider">
                          {isMentor ? 'HỌC VIÊN' : 'CỐ VẤN'}
                        </span>
                        <strong className="text-xs text-slate-700 truncate block">
                          {isMentor ? nextBooking.mentee?.name : nextBooking.course?.mentor?.name}
                        </strong>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[8px] text-[#94A3B8] font-black uppercase tracking-wider">KHÓA HỌC</span>
                      <span className="text-[11px] font-black text-slate-800 line-clamp-1 leading-snug">
                        {nextBooking.course?.title}
                      </span>
                    </div>

                    {isConfirmed && nextBooking.googleMeetUrl ? (
                      <a 
                        href={nextBooking.googleMeetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] py-3 rounded-xl uppercase tracking-wider text-center no-underline shadow-md shadow-blue-500/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                      >
                        <LuVideo size={14} />
                        <span>Vào Google Meet</span>
                      </a>
                    ) : (
                      <div className="bg-slate-50 text-[#64748B] border border-slate-200 font-extrabold text-[9px] py-3 rounded-xl uppercase tracking-wider text-center block mt-2">
                        {isConfirmed ? 'Chờ link phòng họp' : 'Chờ cố vấn xác nhận lớp'}
                      </div>
                    )}
                  </div>
                );
              }).length === 0 && (
                <div className="text-center py-6 text-[11px] font-semibold text-[#94A3B8] italic">
                  Không có lịch học nào sắp tới.
                </div>
              )}
            </div>

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

          </div>

        </div>

      </div>
    </div>
  );
}
