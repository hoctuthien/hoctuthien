"use client";

import { useTranslations } from 'next-intl';
import React, { useState, useEffect } from 'react';
import { Breadcrumb, EmptyState, Modal } from '@shared';
import { courseBookingGateway } from '@/core/gateway';
import { Button } from '@/core/ui';
import {
  LuCalendar,
  LuClock,
  LuSearch,
  LuExternalLink,
  LuUser,
  LuMessageSquare,
  LuTriangleAlert,
  LuSettings,
  LuLink,
  LuTrash2
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
    email?: string;
  };
}

export default function CalendarClient() {
  const tExtracted = useTranslations('Extracted.appDashboardCalendarCalendarClient');
  const { data: session, status } = useSession();
  const [bookings, setBookings] = useState<BookingRelation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');

  // Edit/Cancel Booking States
  const [editBooking, setEditBooking] = useState<BookingRelation | null>(null);
  const [meetUrl, setMeetUrl] = useState('');
  const [newStatus, setNewStatus] = useState<'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled'>('confirmed');
  const [cancellationReason, setCancellationReason] = useState('');
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Calendar States
  const [calendarViewMode, setCalendarViewMode] = useState<'week' | 'month'>('month');
  const [weekOffset, setWeekOffset] = useState(0);
  const [currentWeekDays, setCurrentWeekDays] = useState<{ dayName: string; date: Date; dateStr: string }[]>([]);

  const isMentor = session?.user?.role === 'mentor';

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
    const bTime = b.meetingTime ? new Date(b.meetingTime) : null;
    const isValid = bTime && !isNaN(bTime.getTime());
    return {
      id: b.id,
      timeLabel: isValid ? bTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : tExtracted('chuaDinhGio'),
      dateStr: (isValid && bTime) ? getLocalDateString(bTime) : '',
      courseTitle: b.course?.title || 'Khóa học',
      partnerName: isMentor ? (b.mentee?.name || 'Học viên') : (b.course?.mentor?.name || 'Cố vấn học tập'),
      partnerAvatar: isMentor ? b.mentee?.avatarUrl : b.course?.mentor?.avatarUrl,
      googleMeetUrl: b.googleMeetUrl,
      status: b.status,
    };
  }).filter((s: any) => s.dateStr !== '');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await courseBookingGateway.getMyBookings({ limit: 150 });
      setBookings(res.data || []);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load bookings for calendar:', err);
      setError(tExtracted('khongTheTaiLichTrinhVuiLongThu'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchBookings();
    }
  }, [status]);

  const handleManageSlot = (slotId: string) => {
    const booking = bookings.find((b) => b.id === slotId);
    if (booking) {
      setEditBooking(booking);
      setMeetUrl(booking.googleMeetUrl || '');
      setNewStatus(booking.status);
      setCancellationReason(booking.cancellationReason || '');
    }
  };

  const handleUpdateBookingSubmit = async () => {
    if (!editBooking) return;
    try {
      setSubmittingEdit(true);

      if (isMentor) {
        // Mentor actions: full status/Meet URL updates
        const payload: any = {
          status: newStatus,
          googleMeetUrl: meetUrl.trim() || null,
        };
        if (newStatus === 'cancelled') {
          payload.cancellationReason = cancellationReason.trim() || 'Lịch dạy bị hủy bởi Cố vấn';
        }

        await courseBookingGateway.updateBooking(editBooking.id, payload);

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
      } else {
        // Mentee actions: Cancellation only
        if (newStatus === 'cancelled') {
          await courseBookingGateway.cancelBookingByMentee(editBooking.id, cancellationReason.trim() || 'Học viên hủy lịch');
          setBookings((prev) =>
            prev.map((b) =>
              b.id === editBooking.id
                ? {
                    ...b,
                    status: 'cancelled',
                    cancellationReason: cancellationReason.trim() || 'Học viên hủy lịch'
                  }
                : b
            )
          );
        }
      }
      setEditBooking(null);
    } catch (err) {
      console.error('Failed to update booking:', err);
      alert(tExtracted('capNhatLichHocThatBai'));
    } finally {
      setSubmittingEdit(false);
    }
  };

  const breadcrumbItems = [
    { label: tExtracted('trangChu'), href: '/' },
    { label: tExtracted('bangDieuKhien'), href: '/dashboard' },
    { label: tExtracted('lichTrinhTongQuan2') },
  ];

  return (
    <div className="w-full flex flex-col gap-8 font-sans">

        {/* Header Section */}
        <div className="flex flex-col gap-2">
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="text-3xl font-black text-[#0F172A] tracking-tight mt-1 font-[Montserrat]">
            {tExtracted('lichTrinhTongQuan')}</h1>
          <p className="text-sm text-[#64748b] font-semibold">
            {isMentor
              ? tExtracted('theoDoiToanBoLichGiangDayThien')
              : tExtracted('theoDoiToanBoLichHocCuaBan')}
          </p>
        </div>

        {/* Loading / Error States */}
        {loading ? (
          <div className="w-full bg-white border border-[#E2E8F0] rounded-[32px] p-16 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-[#005BBF]/30 border-t-[#005BBF] rounded-full animate-spin" />
              <p className="text-xs font-black text-[#64748B] uppercase tracking-widest">{tExtracted('dangTaiLichTrinh')}</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white border border-red-100 p-8 rounded-[32px] text-center shadow-sm">
            <p className="text-sm font-semibold text-rose-500">{error}</p>
            <Button
              variant="outline"
              label={tExtracted('taiLaiDuLieu')}
              onClick={fetchBookings}
              className="mt-4 rounded-full text-xs font-black"
            />
          </div>
        ) : (
          <div className="w-full">
            <DashboardCalendar
              currentWeekDays={currentWeekDays}
              calendarSlots={calendarSlots}
              isMentor={isMentor}
              setWeekOffset={setWeekOffset}
              weekOffset={weekOffset}
              viewMode={calendarViewMode}
              setViewMode={setCalendarViewMode}
              onManageSlot={handleManageSlot}
            />
          </div>
        )}

        {/* Quick Action Overlay (Modal) */}
        <Modal
          isOpen={editBooking !== null}
          onClose={() => setEditBooking(null)}
          title={isMentor ? tExtracted('capNhatThongTinBuoiHoc') : tExtracted('huyLichHocVoiCoVan')}
          containerClassName="max-w-md"
          className="p-8 pt-0 font-sans"
        >
          {editBooking && (
            <div className="flex flex-col gap-4 py-2">
              <div className="flex flex-col gap-1 bg-[#DFEFFF]/30 border border-[#DFEFFF]/80 p-4 rounded-2xl text-xs text-slate-600 font-semibold leading-relaxed">
                <span className="text-[10px] font-black text-[#005BBF] uppercase tracking-wider">
                  {isMentor ? tExtracted('hocVienDangKy') : tExtracted('coVanDamNhan')}
                </span>
                <strong className="text-slate-800">
                  {isMentor ? editBooking.mentee?.name : editBooking.course?.mentor?.name}
                </strong>
                <span className="text-slate-500">{tExtracted('khoaHoc')}{editBooking.course?.title}</span>
              </div>

              {isMentor ? (
                <>
                  {/* Status Input for Mentor */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider">{tExtracted('trangThaiBuoiHoc')}</label>
                    <select
                      value={newStatus}
                      onChange={(e: any) => setNewStatus(e.target.value)}
                      className="w-full border border-slate-200 focus:border-[#005BBF] rounded-xl p-3 outline-none text-xs font-black text-[#475569] bg-white cursor-pointer"
                    >
                      <option value="pending">{tExtracted('dangXuLyPending')}</option>
                      <option value="confirmed">{tExtracted('daXacNhanConfirmed')}</option>
                      <option value="completed">{tExtracted('daHoanThanhCompleted')}</option>
                      <option value="cancelled">{tExtracted('huyBoLichDayCancelled')}</option>
                    </select>
                  </div>

                  {/* Google Meet Link for Mentor */}
                  {newStatus !== 'cancelled' && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <LuLink size={13} className="text-[#005BBF]" />
                        <span>{tExtracted('linkPhongHocGoogleMeet')}</span>
                      </label>
                      <input
                        type="url"
                        value={meetUrl}
                        onChange={(e) => setMeetUrl(e.target.value)}
                        placeholder="https://meet.google.com/abc-defg-hij"
                        className="w-full border border-slate-200 focus:border-[#005BBF] rounded-xl p-3 outline-none text-xs font-semibold"
                      />
                    </div>
                  )}

                  {/* Cancellation Reason for Mentor */}
                  {newStatus === 'cancelled' && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-black text-rose-500 uppercase tracking-wider flex items-center gap-1">
                        <LuTriangleAlert size={13} />
                        <span>{tExtracted('lyDoHuyBuoiHoc')}</span>
                      </label>
                      <textarea
                        value={cancellationReason}
                        onChange={(e) => setCancellationReason(e.target.value)}
                        placeholder={tExtracted('viDuCoVanBanViecDotXuat')}
                        className="w-full border border-slate-200 focus:border-[#005BBF] rounded-xl p-3 outline-none text-xs min-h-[80px] resize-none font-semibold leading-relaxed"
                      />
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Cancellation Warning & Reason for Mentee */}
                  <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex gap-3 text-xs text-rose-800 leading-relaxed font-semibold">
                    <LuTriangleAlert size={24} className="text-rose-500 flex-shrink-0" />
                    <p>
                      {tExtracted('hanhDongNaySeGuiYeuCauHuy')}</p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider">{tExtracted('lyDoHuyLichHoc')}</label>
                    <textarea
                      value={cancellationReason}
                      onChange={(e) => setCancellationReason(e.target.value)}
                      placeholder={tExtracted('ghiLyDoHuy')}
                      className="w-full border border-slate-200 focus:border-[#005BBF] rounded-xl p-3 outline-none text-xs min-h-[90px] resize-none font-semibold leading-relaxed"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-3 mt-2 border-t border-slate-100 pt-4">
                <button
                  onClick={() => setEditBooking(null)}
                  className="px-5 py-2.5 text-xs font-black text-[#64748b] hover:text-[#475569] uppercase tracking-wider transition-colors cursor-pointer border-0 bg-transparent"
                >
                  {tExtracted('huyBo')}</button>
                <button
                  onClick={handleUpdateBookingSubmit}
                  disabled={submittingEdit || (!isMentor && !cancellationReason.trim())}
                  className={`text-white font-extrabold text-xs py-2.5 px-6 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-[0.98] min-w-[120px] cursor-pointer border-0 ${
                    !isMentor ? "bg-rose-500 hover:bg-rose-600 shadow-rose-500/10" : "bg-[#005BBF] hover:bg-[#004493] shadow-[#005BBF]/10"
                  }`}
                >
                  {submittingEdit ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>{isMentor ? tExtracted('capNhat') : tExtracted('xacNhanHuy')}</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
  );
}
