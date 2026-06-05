"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Breadcrumb, EmptyState, Modal } from '@shared';
import { courseBookingGateway, paymentGateway } from '@/core/gateway';
import { Button } from '@/core/ui';
import { 
  LuBookOpen, 
  LuCalendar, 
  LuCheck, 
  LuX, 
  LuClock, 
  LuSearch, 
  LuExternalLink, 
  LuUser, 
  LuMessageSquare, 
  LuTriangleAlert,
  LuTrash2,
  LuCopy,
  LuRefreshCw,
  LuInfo
} from 'react-icons/lu';
import { useSession } from 'next-auth/react';
import { DashboardCalendar, getLocalDateString } from '../dashboard/components/DashboardCalendar';

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
    mentor?: {
      id: string;
      name: string;
      avatarUrl: string | null;
      email?: string;
    };
  };
  mentee?: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

export default function MyCoursesClient() {
  const { data: session, status } = useSession();
  const [bookings, setBookings] = useState<BookingRelation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');

  // Cancel Booking Modal States
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [submittingCancel, setSubmittingCancel] = useState(false);

  // Trạng thái tích hợp thanh toán khóa học
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentBooking, setPaymentBooking] = useState<BookingRelation | null>(null);
  const [qrData, setQrData] = useState<any | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [expired, setExpired] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'success' | 'manual_retry' | 'processing' | 'error'>('idle');
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // References cho timers
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const cooldownRef = useRef<NodeJS.Timeout | null>(null);
  const autoRetryRef = useRef<NodeJS.Timeout | null>(null);

  // Đếm ngược thời gian hết hạn mã QR
  useEffect(() => {
    if (!qrData) return;

    const expTime = new Date(qrData.expiredAt || '').getTime();
    const left = Math.max(0, Math.floor((expTime - Date.now()) / 1000));
    setTimeLeft(left);

    if (left <= 0) {
      setExpired(true);
      return;
    }

    setExpired(false);

    timerRef.current = setInterval(() => {
      const currentLeft = Math.max(0, Math.floor((expTime - Date.now()) / 1000));
      setTimeLeft(currentLeft);

      if (currentLeft <= 0) {
        setExpired(true);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [qrData]);

  // Đếm ngược cooldown bấm nút check giao dịch
  useEffect(() => {
    if (cooldown <= 0) return;

    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, [cooldown]);

  // Dọn dẹp timers khi unmount
  useEffect(() => {
    return () => {
      if (autoRetryRef.current) clearTimeout(autoRetryRef.current);
    };
  }, []);

  // Mở cổng thanh toán cho booking cụ thể
  const handleOpenPayment = async (booking: BookingRelation) => {
    try {
      setPaymentBooking(booking);
      setVerifyStatus('idle');
      setVerifyMessage(null);
      setExpired(false);
      setCooldown(0);
      
      const qr = await paymentGateway.generateGenericQr('course_booking', booking.id);
      setQrData({ ...qr, referenceId: booking.id });
      setPaymentModalOpen(true);
    } catch (err: any) {
      console.error("Failed to generate payment QR:", err);
      alert("Không thể khởi tạo cổng thanh toán. Vui lòng thử lại sau.");
    }
  };

  // Làm mới mã QR chuyển khoản
  const handleRegenerateQr = async () => {
    if (!qrData || !paymentBooking) return;
    try {
      setExpired(false);
      setVerifyStatus('idle');
      setVerifyMessage(null);
      const freshQr = await paymentGateway.generateGenericQr('course_booking', paymentBooking.id);
      setQrData({ ...freshQr, referenceId: paymentBooking.id });
    } catch (err: any) {
      console.error("Failed to regenerate QR:", err);
      alert("Không thể làm mới mã QR. Vui lòng thử lại.");
    }
  };

  // Sao chép mã chuyển khoản
  const handleCopyCode = async () => {
    if (!qrData) return;
    try {
      await navigator.clipboard.writeText(qrData.transactionCode || '');
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  // Xác minh giao dịch thanh toán
  const handleVerifyPayment = async () => {
    if (!qrData || verifying || cooldown > 0) return;

    try {
      setVerifying(true);
      setVerifyMessage(null);

      const result = await paymentGateway.verifyGenericPayment(qrData.paymentId);

      if (result.activated) {
        setVerifyStatus('success');
        setVerifyMessage(result.message || 'Thanh toán khóa học thành công!');
        
        // Cập nhật trạng thái booking local sang confirmed
        if (paymentBooking) {
          setBookings((prev) =>
            prev.map((b) =>
              b.id === paymentBooking.id
                ? { ...b, status: 'confirmed' }
                : b
            )
          );
        }

        setTimeout(() => {
          setPaymentModalOpen(false);
          setQrData(null);
          setPaymentBooking(null);
          setVerifyStatus('idle');
        }, 3000);
      } else {
        const msg = (result.message || '').toLowerCase();
        if (msg.includes('đang xử lý') || msg.includes('cron')) {
          setVerifyStatus('processing');
          setVerifyMessage(result.message || null);
          setCooldown(3);

          autoRetryRef.current = setTimeout(() => {
            handleVerifyPayment();
          }, 3000);
        } else {
          setVerifyStatus('manual_retry');
          setVerifyMessage(result.message || 'Chưa tìm thấy giao dịch chuyển khoản phù hợp.');
          setCooldown(5);
        }
      }
    } catch (err: any) {
      console.error('Verify error:', err);
      if (err.status === 422) {
        setVerifyStatus('error');
        setVerifyMessage('Mã QR đã hết hạn. Đang tự động làm mới...');
        setTimeout(() => handleRegenerateQr(), 2000);
      } else {
        setVerifyStatus('error');
        setVerifyMessage(err.message || 'Đã có lỗi xảy ra trong quá trình xác minh.');
        setCooldown(5);
      }
    } finally {
      setVerifying(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
      partnerName: b.course?.mentor?.name || 'Cố vấn học tập',
      partnerAvatar: b.course?.mentor?.avatarUrl,
      googleMeetUrl: b.googleMeetUrl,
      status: b.status,
    };
  }).filter((s: any) => s.dateStr !== '');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await courseBookingGateway.getMyBookings({ limit: 100 });
      setBookings(res.data || []);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load bookings:', err);
      setError('Không thể tải danh sách buổi học của bạn. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchBookings();
    }
  }, [status]);

  const handleCancelBooking = async () => {
    if (!cancelBookingId || !cancelReason.trim()) return;
    try {
      setSubmittingCancel(true);
      await courseBookingGateway.cancelBookingByMentee(cancelBookingId, cancelReason);
      
      // Update local state instantly with premium feel
      setBookings((prev) =>
        prev.map((b) =>
          b.id === cancelBookingId
            ? { ...b, status: 'cancelled', cancellationReason: cancelReason }
            : b
        )
      );
      setCancelBookingId(null);
      setCancelReason('');
    } catch (err) {
      console.error('Failed to cancel booking:', err);
      alert('Hủy buổi học thất bại, vui lòng thử lại.');
    } finally {
      setSubmittingCancel(false);
    }
  };

  // Filter Bookings logic
  const filteredBookings = bookings.filter((b) => {
    const title = b.course?.title || '';
    const mentorName = b.course?.mentor?.name || '';
    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentorName.toLowerCase().includes(searchQuery.toLowerCase());

    const isUpcoming = b.status === 'pending' || b.status === 'confirmed' || b.status === 'rescheduled';
    
    if (activeTab === 'upcoming') return matchesSearch && isUpcoming;
    if (activeTab === 'completed') return matchesSearch && b.status === 'completed';
    if (activeTab === 'cancelled') return matchesSearch && b.status === 'cancelled';
    return matchesSearch;
  });

  // Math Statistics
  const total = bookings.length;
  const upcomingCount = bookings.filter((b) => b.status === 'pending' || b.status === 'confirmed' || b.status === 'rescheduled').length;
  const completedCount = bookings.filter((b) => b.status === 'completed').length;
  const cancelledCount = bookings.filter((b) => b.status === 'cancelled').length;

  const breadcrumbItems = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Bảng điều khiển', href: '#' },
    { label: 'Khóa học của tôi' },
  ];

  return (
    <div className="w-full bg-[#FAFBFD] min-h-screen py-8 px-4 md:px-8 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        
        {/* Title and Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Breadcrumb items={breadcrumbItems} />
            <h1 className="text-3xl font-black text-[#0F172A] tracking-tight mt-1 font-[Montserrat]">
              Khóa học & Lịch học của Tôi
            </h1>
            <p className="text-sm text-[#64748b] font-semibold">
              Theo dõi tiến trình học tập, quản lý lịch hẹn học và kết nối với các Cố vấn (Mentor) tâm huyết.
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
              isMentor={false}
              setWeekOffset={setWeekOffset}
              weekOffset={weekOffset}
              viewMode={calendarViewMode}
              setViewMode={setCalendarViewMode}
              onManageSlot={(id) => setCancelBookingId(id)}
            />
          </div>
        ) : (
          <>
            {/* 1. Thống kê */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.005)] flex items-center gap-4">
                <div className="w-10 h-10 bg-[#DFEFFF] text-[#005BBF] rounded-xl flex items-center justify-center flex-shrink-0">
                  <LuBookOpen size={20} />
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-[10px] text-[#64748b] font-black uppercase tracking-wider block truncate">TỔNG BUỔI HỌC</span>
                  <span className="text-xl font-black text-[#0F172A]">{loading ? '...' : total}</span>
                </div>
              </div>

              <div className="bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.005)] flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center flex-shrink-0">
                  <LuCalendar size={20} />
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-[10px] text-[#64748b] font-black uppercase tracking-wider block truncate">LỊCH SẮP TỚI</span>
                  <span className="text-xl font-black text-[#D97706]">{loading ? '...' : upcomingCount}</span>
                </div>
              </div>

              <div className="bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.005)] flex items-center gap-4">
                <div className="w-10 h-10 bg-[#89FA9B]/35 text-[#005320] rounded-xl flex items-center justify-center flex-shrink-0">
                  <LuCheck size={20} />
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-[10px] text-[#64748b] font-black uppercase tracking-wider block truncate">HOÀN THÀNH</span>
                  <span className="text-xl font-black text-[#005320]">{loading ? '...' : completedCount}</span>
                </div>
              </div>

              <div className="bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.005)] flex items-center gap-4">
                <div className="w-10 h-10 bg-rose-50 text-rose-700 rounded-xl flex items-center justify-center flex-shrink-0">
                  <LuX size={20} />
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-[10px] text-[#64748b] font-black uppercase tracking-wider block truncate">ĐÃ HỦY</span>
                  <span className="text-xl font-black text-rose-700">{loading ? '...' : cancelledCount}</span>
                </div>
              </div>
            </div>

            {/* 2. Filters & Searches */}
            <div className="bg-white border border-[#E2E8F0] p-4 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.005)] flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Tabs */}
              <div className="flex items-center gap-1.5 bg-[#F8FAFC] p-1.5 rounded-2xl w-full md:w-auto">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`flex-1 md:flex-none px-5 py-2 rounded-xl text-xs font-black tracking-wide transition-all cursor-pointer ${
                    activeTab === 'all'
                      ? 'bg-[#005BBF] text-white shadow-sm'
                      : 'text-[#475569] hover:text-[#005BBF] hover:bg-[#DFEFFF]/30'
                  }`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={`flex-1 md:flex-none px-5 py-2 rounded-xl text-xs font-black tracking-wide transition-all cursor-pointer ${
                    activeTab === 'upcoming'
                      ? 'bg-[#005BBF] text-white shadow-sm'
                      : 'text-[#475569] hover:text-[#005BBF] hover:bg-[#DFEFFF]/30'
                  }`}
                >
                  Lịch sắp tới
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`flex-1 md:flex-none px-5 py-2 rounded-xl text-xs font-black tracking-wide transition-all cursor-pointer ${
                    activeTab === 'completed'
                      ? 'bg-[#005BBF] text-white shadow-sm'
                      : 'text-[#475569] hover:text-[#005BBF] hover:bg-[#DFEFFF]/30'
                  }`}
                >
                  Đã học
                </button>
                <button
                  onClick={() => setActiveTab('cancelled')}
                  className={`flex-1 md:flex-none px-5 py-2 rounded-xl text-xs font-black tracking-wide transition-all cursor-pointer ${
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
                  placeholder="Tìm theo tên khóa học hoặc Cố vấn..."
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
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl" />
                      <div className="flex-1 flex flex-col gap-2">
                        <div className="h-4 bg-slate-100 rounded w-1/3" />
                        <div className="h-6 bg-slate-100 rounded w-5/6" />
                      </div>
                    </div>
                    <div className="h-px bg-slate-100" />
                    <div className="h-10 bg-slate-100 rounded-xl" />
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
                  
                  // Status Badge logic
                  let statusLabel = 'Đang xử lý';
                  let statusStyles = 'bg-amber-500 text-white border-none';
                  if (booking.status === 'pending') {
                    statusLabel = 'Chưa thanh toán';
                    statusStyles = 'bg-rose-500 text-white border-none';
                  } else if (booking.status === 'confirmed') {
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

                  // Active Cancel/Modify states
                  const isCancellable = booking.status === 'pending' || booking.status === 'confirmed';

                  return (
                    <div 
                      key={`${booking.id || 'booking'}-${index}`}
                      className="bg-white rounded-3xl p-6 border border-slate-100/90 shadow-[0_8px_30px_rgba(0,0,0,0.005)] transition-all duration-300 hover:shadow-md flex flex-col justify-between"
                    >
                      <div className="flex flex-col gap-4">
                        {/* Header: Status & Price */}
                        <div className="flex items-center justify-between gap-3">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border uppercase tracking-wider ${statusStyles}`}>
                            {statusLabel}
                          </span>
                          <span className="text-[11px] font-black text-[#10B981] bg-[#ECFDF5] px-2.5 py-1 rounded-lg">
                            {booking.course?.price === 0 ? '100% Miễn phí' : `${(booking.course?.price || 0).toLocaleString('vi-VN')}đ`}
                          </span>
                        </div>

                        {/* Content Identity */}
                        <div className="flex items-start gap-4">
                          {/* Avatar/Thumbnail */}
                          <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 flex-shrink-0">
                            <img
                              src={booking.course?.thumbnailUrl || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=120&q=80'}
                              alt={booking.course?.title || 'Khóa học'}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          {/* Title and Mentor */}
                          <div className="flex flex-col gap-1 min-w-0">
                            <h3 className="text-[15px] font-black text-[#0F172A] tracking-tight leading-snug truncate">
                              {booking.course?.title}
                            </h3>
                            <div className="flex items-center gap-1.5 text-xs text-[#64748b] font-semibold">
                              <LuUser size={13} className="text-slate-400" />
                              <span>Cố vấn: <strong className="text-[#475569]">{booking.course?.mentor?.name || 'Chưa phân công'}</strong></span>
                            </div>
                          </div>
                        </div>

                        {/* Class Schedule detail */}
                        <div className="bg-[#F8FAFC] border border-[#E2E8F0]/70 p-4 rounded-2xl flex flex-col gap-2 text-xs">
                          <div className="flex items-center justify-between gap-3 font-semibold text-[#475569]">
                            <span className="text-[#94A3B8] font-bold">Thời gian học:</span>
                            <span className="flex items-center gap-1">
                              <LuClock size={13} className="text-blue-500" />
                              {meetingDate.toLocaleDateString('vi-VN', { weekday: 'long' })}, {meetingDate.toLocaleDateString('vi-VN')} vào {meetingDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          {booking.googleMeetUrl && (
                            <div className="flex items-center justify-between gap-3 font-semibold text-[#475569] border-t border-[#E2E8F0] pt-2 mt-1">
                              <span className="text-[#94A3B8] font-bold">Phòng học online:</span>
                              <a 
                                href={booking.googleMeetUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 flex items-center gap-1 no-underline font-black"
                              >
                                <span>Google Meet Link</span>
                                <LuExternalLink size={12} />
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Mentee notes */}
                        {booking.notesForMentor && (
                          <div className="flex items-start gap-2 text-xs text-slate-500 border border-slate-100 p-3 rounded-2xl bg-white shadow-[0_4px_12px_rgba(0,0,0,0.002)]">
                            <LuMessageSquare className="text-slate-400 flex-shrink-0 mt-0.5" size={14} />
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Lời nhắn của bạn:</span>
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
                      {isCancellable && (
                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-50">
                          {booking.status === 'pending' ? (
                            <button
                              onClick={() => handleOpenPayment(booking)}
                              className="flex-1 text-center bg-gradient-to-r from-[#005BBF] to-[#004493] hover:from-[#004493] hover:to-[#002D62] text-white font-extrabold text-[11px] py-3.5 rounded-xl uppercase tracking-wider shadow-md shadow-[#005BBF]/15 transition-all cursor-pointer border-0"
                            >
                              Thanh toán ngay
                            </button>
                          ) : booking.googleMeetUrl ? (
                            <a 
                              href={booking.googleMeetUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 text-center bg-[#005BBF] hover:bg-[#004493] text-white font-extrabold text-[11px] py-3.5 rounded-xl uppercase tracking-wider no-underline shadow-md shadow-[#005BBF]/10 transition-all cursor-pointer"
                            >
                              Vào phòng học (Google Meet)
                            </a>
                          ) : (
                            <div className="flex-1 bg-slate-50 text-slate-400 font-extrabold text-[11px] py-3.5 rounded-xl uppercase tracking-wider text-center border border-slate-100">
                              Chờ Mentor gửi link Meet
                            </div>
                          )}

                          <button
                            onClick={() => setCancelBookingId(booking.id)}
                            className="px-4 py-3.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all cursor-pointer border border-rose-100 flex items-center justify-center"
                            title="Hủy buổi học này"
                          >
                            <LuTrash2 size={15} />
                          </button>
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
                  title="Không có lịch học nào"
                  description="Bạn chưa đăng ký lịch học hoặc bộ lọc hiện tại không khớp với kết quả nào."
                  actionText="Khám phá khóa học ngay"
                  onAction={() => window.location.href = '/courses'}
                />
              </div>
            )}
          </>
        )}

        {/* Cancellation Reason Modal */}
        <Modal
          isOpen={cancelBookingId !== null}
          onClose={() => {
            setCancelBookingId(null);
            setCancelReason('');
          }}
          title="Xác nhận hủy buổi học"
          containerClassName="max-w-md"
          className="p-8 pt-0 font-sans"
        >
          <div className="flex flex-col gap-4 py-2">
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex gap-3 text-xs text-amber-800 leading-relaxed font-semibold">
              <LuTriangleAlert size={24} className="text-amber-600 flex-shrink-0" />
              <p>
                Hành động này sẽ hủy bỏ buổi học của bạn với Cố vấn. Vui lòng cho biết lý do cụ thể để Cố vấn được biết và sắp xếp lịch phù hợp.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Lý do hủy lịch học:</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Ví dụ: Bận lịch kiểm tra đột xuất tại trường, xin phép dời lịch học sau..."
                className="w-full border border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-xl p-3 outline-none text-xs min-h-[90px] transition-colors resize-none font-semibold leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-3 mt-2">
              <button
                onClick={() => {
                  setCancelBookingId(null);
                  setCancelReason('');
                }}
                className="px-5 py-2.5 text-xs font-black text-[#64748b] hover:text-[#475569] uppercase tracking-wider transition-colors cursor-pointer"
              >
                Không hủy nữa
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={submittingCancel || !cancelReason.trim()}
                className="bg-red-500 hover:bg-red-600 text-white font-extrabold text-xs py-2.5 px-6 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-red-500/10 active:scale-[0.98] min-w-[120px] cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                {submittingCancel ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LuTrash2 size={12} />
                    <span>Xác nhận hủy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>

        {/* Course Booking Payment Modal */}
        <Modal
          isOpen={paymentModalOpen}
          onClose={() => {
            setPaymentModalOpen(false);
            setQrData(null);
            setPaymentBooking(null);
          }}
          title="Thanh toán Đăng ký Khóa học"
          containerClassName="max-w-md"
          className="p-8 pt-0 font-sans"
        >
          {verifyStatus === 'success' ? (
            <div className="flex flex-col items-center justify-center py-6 text-center animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-4 shadow-inner animate-bounce">
                <LuCheck size={32} strokeWidth={3.5} />
              </div>
              <h3 className="text-xl font-black text-[#0F172A] mb-2 font-[Montserrat]">
                Thanh toán thành công!
              </h3>
              <p className="text-[#475569] text-xs font-semibold max-w-sm leading-relaxed mb-4">
                Khóa học của bạn đã được xác nhận thanh toán thành công. Cửa sổ này sẽ tự động đóng lại...
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 py-2">
              <p className="text-slate-500 text-xs font-semibold">
                Quét mã QR dưới đây bằng App Ngân hàng của bạn để tiến hành thanh toán cho khóa học: <strong className="text-[#0F172A]">"{paymentBooking?.course?.title}"</strong>.
              </p>

              {/* QR display */}
              <div className="flex flex-col items-center justify-center bg-slate-50 border border-slate-100 p-6 rounded-2xl relative overflow-hidden">
                {expired && (
                  <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center gap-3">
                    <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center border border-rose-100">
                      <LuClock size={22} />
                    </div>
                    <h4 className="text-sm font-black text-slate-800 font-[Montserrat]">Mã QR Đã Hết Hạn</h4>
                    <button
                      type="button"
                      onClick={handleRegenerateQr}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-4 py-2 rounded-xl uppercase tracking-wider transition-all active:scale-95 cursor-pointer border-0 flex items-center gap-1"
                    >
                      <LuRefreshCw size={12} />
                      <span>Làm mới QR</span>
                    </button>
                  </div>
                )}

                <div className="w-full aspect-square max-w-[180px] bg-white rounded-xl p-3 flex items-center justify-center border border-slate-100 shadow-sm">
                  {qrData?.qrUrl && (
                    <img
                      src={qrData.qrUrl}
                      alt="VietQR Code"
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  )}
                </div>

                {!expired && qrData?.qrUrl && (
                  <div className="flex items-center gap-1.5 mt-3 px-3 py-1 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl">
                    <LuClock size={12} className="animate-pulse" />
                    <span className="text-xs font-black tracking-wider font-[Montserrat]">{formatTime(timeLeft)}</span>
                  </div>
                )}
              </div>

              {/* Info Details */}
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                  <span className="text-slate-500 font-bold uppercase tracking-wider">Số tiền cần chuyển</span>
                  <span className="font-black text-blue-600 font-[Montserrat]">
                    {qrData?.amount?.toLocaleString("vi-VN")}đ
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Nội dung chuyển khoản</span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl font-mono text-xs font-black text-slate-700 tracking-wider break-all select-all">
                      {qrData?.transactionCode}
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      disabled={expired}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex-shrink-0 flex items-center justify-center ${
                        copySuccess
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                          : 'bg-white border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-[#F0F7FF] hover:border-blue-200'
                      }`}
                    >
                      {copySuccess ? <LuCheck size={14} /> : <LuCopy size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Verify feedback message */}
              {verifyMessage && (
                <div className={`p-3 rounded-xl border flex items-start gap-2 text-xs leading-relaxed font-semibold ${
                  verifyStatus === 'processing'
                    ? 'bg-blue-50 border-blue-100 text-blue-700'
                    : verifyStatus === 'manual_retry'
                    ? 'bg-amber-50 border-amber-100 text-amber-700'
                    : verifyStatus === 'error'
                    ? 'bg-rose-50 border-rose-100 text-rose-700'
                    : 'bg-slate-50 border-slate-100 text-slate-700'
                }`}>
                  <div className="flex-shrink-0 mt-0.5">
                    {verifyStatus === 'processing' && <LuRefreshCw size={12} className="animate-spin text-blue-600" />}
                    {verifyStatus === 'manual_retry' && <LuInfo size={12} className="text-amber-600" />}
                    {verifyStatus === 'error' && <LuInfo size={12} className="text-rose-600" />}
                    {verifyStatus !== 'processing' && verifyStatus !== 'manual_retry' && verifyStatus !== 'error' && <LuInfo size={12} />}
                  </div>
                  <div className="flex-1">{verifyMessage}</div>
                </div>
              )}

              {/* Verify Button Actions */}
              <div className="flex items-center gap-3 mt-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentModalOpen(false);
                    setQrData(null);
                    setPaymentBooking(null);
                  }}
                  className="flex-1 py-2.5 border border-[#E2E8F0] text-[#64748b] hover:bg-[#F8FAFC] font-extrabold text-xs rounded-xl uppercase tracking-wider transition-colors cursor-pointer text-center"
                >
                  Thanh toán sau
                </button>

                <button
                  type="button"
                  onClick={handleVerifyPayment}
                  disabled={expired || verifying || cooldown > 0}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white disabled:text-slate-400 font-extrabold text-xs rounded-xl uppercase tracking-wider transition-all cursor-pointer text-center shadow-md shadow-blue-500/10 active:scale-95 disabled:scale-100 flex items-center justify-center gap-1.5 border-0"
                >
                  {verifying ? (
                    <>
                      <LuRefreshCw size={12} className="animate-spin" />
                      <span>Đang kiểm tra...</span>
                    </>
                  ) : verifyStatus === 'processing' ? (
                    <>
                      <LuRefreshCw size={12} className="animate-spin" />
                      <span>Đang kiểm tra ({cooldown}s)...</span>
                    </>
                  ) : cooldown > 0 ? (
                    <span>Thử lại sau {cooldown}s</span>
                  ) : (
                    <span>Tôi đã chuyển khoản</span>
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
