"use client";

import React, { useState, useEffect } from 'react';
import { Breadcrumb, EmptyState, Modal } from '@shared';
import { courseBookingGateway } from '@/core/gateway';
import { Button } from '@/core/ui';
import { 
  LuCalendar, 
  LuCheck, 
  LuX, 
  LuClock, 
  LuSearch, 
  LuExternalLink, 
  LuUser, 
  LuMessageSquare, 
  LuTriangleAlert,
  LuSettings,
  LuLink
} from 'react-icons/lu';
import { useSession } from 'next-auth/react';
import { DashboardCalendar, getLocalDateString } from '../../dashboard/components/DashboardCalendar';

interface BookingRelation {
  id: string;
  courseId: string;
  menteeId: string;
  meetingTime: string;
  googleMeetUrl: string | null;
  notesForMentor: string | null;
  cancellationReason: string | null;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  createdAt: string;
  course?: {
    id: string;
    title: string;
    thumbnailUrl: string | null;
    price: number;
  };
  mentee?: {
    id: string;
    name: string;
    avatarUrl: string | null;
    email?: string;
  };
}

export default function MentorBookingsClient() {
  const { data: session, status } = useSession();
  const [bookings, setBookings] = useState<BookingRelation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');

  // Edit Booking Modal States
  const [editBooking, setEditBooking] = useState<BookingRelation | null>(null);
  const [meetUrl, setMeetUrl] = useState('');
  const [newStatus, setNewStatus] = useState<'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled'>('confirmed');
  const [cancellationReason, setCancellationReason] = useState('');
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Calendar States
  const [viewType, setViewType] = useState<'list' | 'calendar'>('list');
  const [calendarViewMode, setCalendarViewMode] = useState<'week' | 'month'>('month');
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

  // Map bookings to calendarSlots structure
  const calendarSlots = bookings.map((b: any) => {
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
  }).filter((s: any) => s.dateStr !== '');

  const handleManageSlot = (slotId: string) => {
    const booking = bookings.find((b) => b.id === slotId);
    if (booking) {
      handleOpenEdit(booking);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await courseBookingGateway.getMyBookings({ limit: 100 });
      setBookings(res.data || []);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load mentor bookings:', err);
      setError('Không thể tải danh sách lịch dạy của bạn. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchBookings();
    }
  }, [status]);

  const handleOpenEdit = (booking: BookingRelation) => {
    setEditBooking(booking);
    setMeetUrl(booking.googleMeetUrl || '');
    setNewStatus(booking.status);
    setCancellationReason(booking.cancellationReason || '');
  };

  const handleQuickConfirm = async (id: string) => {
    try {
      await courseBookingGateway.updateBooking(id, { status: 'confirmed' });
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: 'confirmed' } : b))
      );
    } catch (err) {
      console.error('Failed to confirm booking:', err);
      alert('Xác nhận lịch học thất bại.');
    }
  };

  const handleQuickComplete = async (id: string) => {
    try {
      await courseBookingGateway.updateBooking(id, { status: 'completed' });
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: 'completed' } : b))
      );
    } catch (err) {
      console.error('Failed to complete booking:', err);
      alert('Cập nhật trạng thái hoàn thành thất bại.');
    }
  };

  const handleUpdateBookingSubmit = async () => {
    if (!editBooking) return;
    try {
      setSubmittingEdit(true);
      const payload: any = {
        status: newStatus,
        googleMeetUrl: meetUrl.trim() || null,
      };
      if (newStatus === 'cancelled') {
        payload.cancellationReason = cancellationReason.trim() || 'Lịch dạy bị hủy bởi Cố vấn';
      }

      await courseBookingGateway.updateBooking(editBooking.id, payload);
      
      // Update local state beautifully
      setBookings((prev) =>
        prev.map((b) =>
          b.id === editBooking.id
            ? { 
                ...b, 
                status: newStatus, 
                googleMeetUrl: meetUrl.trim() || null,
                cancellationReason: newStatus === 'cancelled' ? cancellationReason : b.cancellationReason
              }
            : b
        )
      );
      setEditBooking(null);
    } catch (err) {
      console.error('Failed to update booking:', err);
      alert('Cập nhật lịch học thất bại.');
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Filter Bookings logic
  const filteredBookings = bookings.filter((b) => {
    const courseTitle = b.course?.title || '';
    const studentName = b.mentee?.name || '';
    const matchesSearch =
      courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      studentName.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === 'pending') return matchesSearch && b.status === 'pending';
    if (activeTab === 'confirmed') return matchesSearch && b.status === 'confirmed';
    if (activeTab === 'completed') return matchesSearch && b.status === 'completed';
    if (activeTab === 'cancelled') return matchesSearch && b.status === 'cancelled';
    return matchesSearch;
  });

  // Calculate statistics
  const total = bookings.length;
  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const confirmedCount = bookings.filter((b) => b.status === 'confirmed' || b.status === 'rescheduled').length;
  const completedCount = bookings.filter((b) => b.status === 'completed').length;
  const cancelledCount = bookings.filter((b) => b.status === 'cancelled').length;

  const breadcrumbItems = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Cố vấn', href: '#' },
    { label: 'Quản lý lịch dạy' },
  ];

  return (
    <div className="w-full bg-[#FAFBFD] min-h-screen py-8 px-4 md:px-8 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        
        {/* Title & Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Breadcrumb items={breadcrumbItems} />
            <h1 className="text-3xl font-black text-[#0F172A] tracking-tight mt-1 font-[Montserrat]">
              Quản lý Lịch dạy & Buổi học
            </h1>
            <p className="text-sm text-[#64748b] font-semibold">
              Xem danh sách các buổi học được học viên đặt, cập nhật phòng học trực tuyến (Google Meet) và xác nhận kết quả giảng dạy.
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-[#F1F5F9] p-1 rounded-2xl border border-[#E2E8F0] self-start sm:self-center">
            <button
              onClick={() => setViewType('list')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all border-0 ${
                viewType === 'list' ? 'bg-[#005BBF] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 bg-transparent'
              }`}
            >
              <span>Dạng Danh sách</span>
            </button>
            <button
              onClick={() => setViewType('calendar')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all border-0 ${
                viewType === 'calendar' ? 'bg-[#005BBF] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 bg-transparent'
              }`}
            >
              <span>Dạng Lịch Tháng</span>
            </button>
          </div>
        </div>

        {viewType === 'calendar' ? (
          <div className="w-full">
            <DashboardCalendar
              currentWeekDays={currentWeekDays}
              calendarSlots={calendarSlots}
              isMentor={true}
              setWeekOffset={setWeekOffset}
              weekOffset={weekOffset}
              viewMode={calendarViewMode}
              setViewMode={setCalendarViewMode}
              onManageSlot={handleManageSlot}
            />
          </div>
        ) : (
          <>
            {/* 1. Statistics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.005)] flex items-center gap-4">
                <div className="w-10 h-10 bg-[#DFEFFF] text-[#005BBF] rounded-xl flex items-center justify-center flex-shrink-0">
                  <LuCalendar size={20} />
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-[10px] text-[#64748b] font-black uppercase tracking-wider block truncate">TỔNG LỊCH DẠY</span>
                  <span className="text-xl font-black text-[#0F172A]">{loading ? '...' : total}</span>
                </div>
              </div>

              <div className="bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.005)] flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center flex-shrink-0">
                  <LuClock size={20} />
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-[10px] text-[#64748b] font-black uppercase tracking-wider block truncate">CHỜ XÁC NHẬN</span>
                  <span className="text-xl font-black text-[#D97706]">{loading ? '...' : pendingCount}</span>
                </div>
              </div>

              <div className="bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.005)] flex items-center gap-4">
                <div className="w-10 h-10 bg-[#89FA9B]/35 text-[#005320] rounded-xl flex items-center justify-center flex-shrink-0">
                  <LuCalendar size={20} />
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-[10px] text-[#64748b] font-black uppercase tracking-wider block truncate">ĐÃ XÁC NHẬN</span>
                  <span className="text-xl font-black text-[#005320]">{loading ? '...' : confirmedCount}</span>
                </div>
              </div>

              <div className="bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.005)] flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center flex-shrink-0">
                  <LuCheck size={20} />
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-[10px] text-[#64748b] font-black uppercase tracking-wider block truncate">ĐÃ HOÀN THÀNH</span>
                  <span className="text-xl font-black text-emerald-700">{loading ? '...' : completedCount}</span>
                </div>
              </div>

              <div className="bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.005)] flex items-center gap-4">
                <div className="w-10 h-10 bg-rose-50 text-rose-700 rounded-xl flex items-center justify-center flex-shrink-0">
                  <LuX size={20} />
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-[10px] text-[#64748b] font-black uppercase tracking-wider block truncate">ĐÃ HỦY BỎ</span>
                  <span className="text-xl font-black text-rose-700">{loading ? '...' : cancelledCount}</span>
                </div>
              </div>
            </div>

            {/* 2. Filters & Searches */}
            <div className="bg-white border border-[#E2E8F0] p-4 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.005)] flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Tabs */}
              <div className="flex items-center gap-1.5 bg-[#F8FAFC] p-1.5 rounded-2xl w-full md:w-auto overflow-x-auto [&::-webkit-scrollbar]:hidden">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-5 py-2 rounded-xl text-xs font-black tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'all'
                      ? 'bg-[#005BBF] text-white shadow-sm'
                      : 'text-[#475569] hover:text-[#005BBF] hover:bg-[#DFEFFF]/30'
                  }`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`px-5 py-2 rounded-xl text-xs font-black tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'pending'
                      ? 'bg-[#005BBF] text-white shadow-sm'
                      : 'text-[#475569] hover:text-[#005BBF] hover:bg-[#DFEFFF]/30'
                  }`}
                >
                  Chờ xác nhận
                </button>
                <button
                  onClick={() => setActiveTab('confirmed')}
                  className={`px-5 py-2 rounded-xl text-xs font-black tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'confirmed'
                      ? 'bg-[#005BBF] text-white shadow-sm'
                      : 'text-[#475569] hover:text-[#005BBF] hover:bg-[#DFEFFF]/30'
                  }`}
                >
                  Đã xác nhận
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`px-5 py-2 rounded-xl text-xs font-black tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'completed'
                      ? 'bg-[#005BBF] text-white shadow-sm'
                      : 'text-[#475569] hover:text-[#005BBF] hover:bg-[#DFEFFF]/30'
                  }`}
                >
                  Đã học
                </button>
                <button
                  onClick={() => setActiveTab('cancelled')}
                  className={`px-5 py-2 rounded-xl text-xs font-black tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'cancelled'
                      ? 'bg-[#005BBF] text-white shadow-sm'
                      : 'text-[#475569] hover:text-[#005BBF] hover:bg-[#DFEFFF]/30'
                  }`}
                >
                  Đã hủy
                </button>
              </div>

              {/* Search bar */}
              <div className="relative w-full md:w-[320px]">
                <LuSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={16} />
                <input
                  type="text"
                  placeholder="Tìm theo tên khóa học hoặc Học viên..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl outline-none focus:bg-white focus:border-[#2563eb] text-xs font-semibold transition-all"
                />
              </div>
            </div>

            {/* 3. Bookings Content */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map((n) => (
                  <div key={n} className="bg-white rounded-3xl p-6 border border-slate-100 flex flex-col gap-4 animate-pulse">
                    <div className="h-6 bg-slate-100 rounded w-1/4" />
                    <div className="h-10 bg-slate-100 rounded w-full" />
                    <div className="h-12 bg-slate-100 rounded w-full" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-white border border-red-100 p-6 rounded-3xl text-center">
                <p className="text-sm font-semibold text-rose-500">{error}</p>
                <Button
                  variant="outline"
                  label="Tải lại dữ liệu"
                  onClick={fetchBookings}
                  className="mt-3 rounded-full text-xs font-black"
                />
              </div>
            ) : filteredBookings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredBookings.map((booking, index) => {
                  const meetingDate = new Date(booking.meetingTime);
                  
                  // Status Styling logic
                  let statusLabel = 'Đang xử lý';
                  let statusStyles = 'bg-amber-500 text-white border-none';
                  if (booking.status === 'confirmed') {
                    statusLabel = 'Đã xác nhận';
                    statusStyles = 'bg-emerald-600 text-white border-none';
                  } else if (booking.status === 'completed') {
                    statusLabel = 'Đã hoàn thành';
                    statusStyles = 'bg-slate-400 text-white border-none';
                  } else if (booking.status === 'cancelled') {
                    statusLabel = 'Đã hủy';
                    statusStyles = 'bg-rose-500 text-white border-none';
                  } else if (booking.status === 'rescheduled') {
                    statusLabel = 'Đã đổi lịch';
                    statusStyles = 'bg-[#005BBF] text-white border-none';
                  }

                  // Access rules
                  const canConfirm = booking.status === 'pending';
                  const canComplete = booking.status === 'confirmed' || booking.status === 'rescheduled';
                  const canEdit = booking.status !== 'completed' && booking.status !== 'cancelled';

                  return (
                    <div 
                      key={`${booking.id || 'booking'}-${index}`}
                      className="bg-white rounded-3xl p-6 border border-slate-100/90 shadow-[0_8px_30px_rgba(0,0,0,0.005)] transition-all duration-300 hover:shadow-md flex flex-col justify-between"
                    >
                      <div className="flex flex-col gap-4">
                        {/* Header Status & Edit Icon */}
                        <div className="flex items-center justify-between gap-3">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border uppercase tracking-wider ${statusStyles}`}>
                            {statusLabel}
                          </span>
                          {canEdit && (
                            <button
                              onClick={() => handleOpenEdit(booking)}
                              className="p-2 text-slate-400 hover:text-[#005BBF] hover:bg-[#DFEFFF]/50 rounded-xl transition-all cursor-pointer"
                              title="Cập nhật buổi học"
                            >
                              <LuSettings size={15} />
                            </button>
                          )}
                        </div>

                        {/* Course Title and Booking ID */}
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">KHÓA HỌC</span>
                          <h3 className="text-base font-black text-[#0F172A] tracking-tight leading-snug line-clamp-1">
                            {booking.course?.title}
                          </h3>
                        </div>

                        {/* Student Identity */}
                        <div className="flex items-center gap-3 bg-slate-50/50 p-3 rounded-2xl border border-slate-100/80">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-100">
                            <img 
                              src={booking.mentee?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'} 
                              alt="Học viên" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <span className="text-[9px] font-black text-[#94A3B8] uppercase tracking-wider">HỌC VIÊN</span>
                            <strong className="text-xs text-[#475569] truncate block">{booking.mentee?.name}</strong>
                            <span className="text-[10px] text-[#94A3B8] truncate">{booking.mentee?.email}</span>
                          </div>
                        </div>

                        {/* Class Time Detail */}
                        <div className="bg-[#F8FAFC] border border-[#E2E8F0]/70 p-4 rounded-2xl flex flex-col gap-2 text-xs">
                          <div className="flex items-center justify-between gap-3 font-semibold text-[#475569]">
                            <span className="text-[#94A3B8] font-bold">Thời gian dạy:</span>
                            <span className="flex items-center gap-1">
                              <LuClock size={13} className="text-blue-500" />
                              {meetingDate.toLocaleDateString('vi-VN', { weekday: 'long' })}, {meetingDate.toLocaleDateString('vi-VN')} vào {meetingDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          {booking.googleMeetUrl ? (
                            <div className="flex items-center justify-between gap-3 font-semibold text-[#475569] border-t border-[#E2E8F0] pt-2 mt-1">
                              <span className="text-[#94A3B8] font-bold">Link Google Meet:</span>
                              <a 
                                href={booking.googleMeetUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 flex items-center gap-1 no-underline font-black"
                              >
                                <span>Vào phòng học</span>
                                <LuExternalLink size={12} />
                              </a>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between gap-3 font-semibold text-[#EF4444] border-t border-rose-100 pt-2 mt-1 bg-rose-50/20 px-2 py-1.5 rounded-xl border border-rose-100/50">
                              <span className="text-rose-500 font-bold">Trạng thái:</span>
                              <span className="font-black text-[11px] flex items-center gap-1">
                                <LuTriangleAlert size={12} />
                                Chưa cập nhật link phòng học
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Student notes */}
                        {booking.notesForMentor && (
                          <div className="flex items-start gap-2 text-xs text-slate-500 border border-slate-100 p-3 rounded-2xl bg-white shadow-[0_4px_12px_rgba(0,0,0,0.002)]">
                            <LuMessageSquare className="text-slate-400 flex-shrink-0 mt-0.5" size={14} />
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Lời nhắn từ học viên:</span>
                              <p className="font-medium italic leading-relaxed text-[#475569]">{booking.notesForMentor}</p>
                            </div>
                          </div>
                        )}

                        {/* Cancellation reason if cancelled */}
                        {booking.status === 'cancelled' && booking.cancellationReason && (
                          <div className="flex items-start gap-2 text-xs text-rose-600 bg-rose-50/50 border border-rose-100 p-3 rounded-2xl">
                            <LuTriangleAlert className="text-rose-500 flex-shrink-0 mt-0.5" size={14} />
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[10px] font-black text-rose-500 uppercase tracking-wider">Lý do hủy buổi học:</span>
                              <p className="font-semibold leading-relaxed text-rose-700">{booking.cancellationReason}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions buttons */}
                      {(canConfirm || canComplete) && (
                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-50 w-full">
                          {canConfirm && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(booking)}
                                className="flex-1 bg-white border border-[#CBD5E1] text-[#475569] hover:bg-slate-50 font-black text-[11px] py-3 rounded-xl uppercase tracking-wider text-center cursor-pointer transition-all"
                              >
                                Thêm link phòng học
                              </button>
                              <button
                                onClick={() => handleQuickConfirm(booking.id)}
                                className="flex-1 bg-[#005BBF] hover:bg-[#004493] text-white font-extrabold text-[11px] py-3 rounded-xl uppercase tracking-wider text-center shadow-md shadow-[#005BBF]/10 transition-all cursor-pointer"
                              >
                                Xác nhận lịch học
                              </button>
                            </>
                          )}

                          {canComplete && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(booking)}
                                className="flex-1 bg-white border border-[#CBD5E1] text-[#475569] hover:bg-slate-50 font-black text-[11px] py-3 rounded-xl uppercase tracking-wider text-center cursor-pointer transition-all"
                              >
                                Đổi giờ học / Hủy lịch
                              </button>
                              <button
                                onClick={() => handleQuickComplete(booking.id)}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] py-3 rounded-xl uppercase tracking-wider text-center shadow-md shadow-emerald-500/10 transition-all cursor-pointer"
                              >
                                Hoàn thành buổi học
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 bg-white rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.005)]">
                <EmptyState
                  icon={<LuCalendar size={48} className="text-slate-400 animate-pulse" />}
                  title="Không có lịch dạy nào"
                  description="Hiện tại chưa có học viên nào đặt lịch học thuộc các khóa học do bạn đảm nhận."
                  actionText="Xem danh sách khóa học của bạn"
                  onAction={() => window.location.href = '/mentor/courses'}
                />
              </div>
            )}
          </>
        )}

        {/* Update Study Session Modal */}
        <Modal
          isOpen={editBooking !== null}
          onClose={() => setEditBooking(null)}
          title="Cập nhật thông tin buổi học"
          containerClassName="max-w-md"
          className="p-8 pt-0 font-sans"
        >
          {editBooking && (
            <div className="flex flex-col gap-4 py-2">
              <div className="flex flex-col gap-1 bg-blue-50/50 border border-blue-100 p-4 rounded-2xl text-xs text-slate-500 font-semibold leading-relaxed">
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-wider">Học viên đang cập nhật:</span>
                <strong className="text-slate-700">{editBooking.mentee?.name}</strong>
                <span className="text-slate-400">Khóa học: {editBooking.course?.title}</span>
              </div>

              {/* Status input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Trạng thái buổi học:</label>
                <select
                  value={newStatus}
                  onChange={(e: any) => setNewStatus(e.target.value)}
                  className="w-full border border-slate-200 focus:border-blue-500 rounded-xl p-3 outline-none text-xs font-black text-[#475569] bg-white cursor-pointer"
                >
                  <option value="pending">Đang xử lý (Pending)</option>
                  <option value="confirmed">Đã xác nhận (Confirmed)</option>
                  <option value="completed">Đã hoàn thành (Completed)</option>
                  <option value="cancelled">Hủy bỏ lịch dạy (Cancelled)</option>
                </select>
              </div>

              {/* Google Meet link input */}
              {newStatus !== 'cancelled' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <LuLink size={13} className="text-blue-500" />
                    <span>Link phòng học Google Meet:</span>
                  </label>
                  <input
                    type="url"
                    value={meetUrl}
                    onChange={(e) => setMeetUrl(e.target.value)}
                    placeholder="https://meet.google.com/abc-defg-hij"
                    className="w-full border border-slate-200 focus:border-blue-500 rounded-xl p-3 outline-none text-xs font-semibold"
                  />
                </div>
              )}

              {/* Cancellation reason input if status is cancelled */}
              {newStatus === 'cancelled' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-rose-500 uppercase tracking-wider flex items-center gap-1">
                    <LuTriangleAlert size={13} />
                    <span>Lý do hủy buổi học:</span>
                  </label>
                  <textarea
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    placeholder="Ví dụ: Cố vấn bận lịch nghiên cứu khoa học đột xuất, xin phép chuyển lịch học sang ngày hôm sau..."
                    className="w-full border border-slate-200 focus:border-blue-500 rounded-xl p-3 outline-none text-xs min-h-[80px] resize-none font-semibold leading-relaxed"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 mt-2">
                <button
                  onClick={() => setEditBooking(null)}
                  className="px-5 py-2.5 text-xs font-black text-[#64748b] hover:text-[#475569] uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Đóng lại
                </button>
                <button
                  onClick={handleUpdateBookingSubmit}
                  disabled={submittingEdit}
                  className="bg-[#005BBF] hover:bg-[#004493] text-white font-extrabold text-xs py-2.5 px-6 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#005BBF]/10 active:scale-[0.98] min-w-[120px] cursor-pointer"
                >
                  {submittingEdit ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Cập nhật lịch học</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </Modal>

      </div>
    </div>
  );
}
