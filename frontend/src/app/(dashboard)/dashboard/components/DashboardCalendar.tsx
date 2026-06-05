import React, { useState, useEffect } from 'react';
import { 
  LuClock, 
  LuVideo, 
  LuChevronLeft, 
  LuChevronRight,
  LuCalendarDays,
  LuCalendarRange,
  LuX,
  LuUser,
  LuExternalLink
} from 'react-icons/lu';
import { Modal } from '@shared';

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

interface DashboardCalendarProps {
  currentWeekDays: { dayName: string; date: Date; dateStr: string }[];
  calendarSlots: CalendarSlot[];
  isMentor: boolean;
  setWeekOffset: React.Dispatch<React.SetStateAction<number>>;
  weekOffset: number;
  viewMode: 'week' | 'month';
  setViewMode: React.Dispatch<React.SetStateAction<'week' | 'month'>>;
  onManageSlot?: (slotId: string) => void;
}

export const getLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const DashboardCalendar: React.FC<DashboardCalendarProps> = ({
  currentWeekDays,
  calendarSlots,
  isMentor,
  setWeekOffset,
  weekOffset,
  viewMode,
  setViewMode,
  onManageSlot,
}) => {
  const [monthOffset, setMonthOffset] = useState(0);
  const [monthDaysGrid, setMonthDaysGrid] = useState<{ date: Date; dateStr: string; isCurrentMonth: boolean; dayNumber: number }[]>([]);
  const [currentMonthLabel, setCurrentMonthLabel] = useState('');
  
  // Selected slot for details modal
  const [selectedSlot, setSelectedSlot] = useState<CalendarSlot | null>(null);

  // Calculate Month Grid whenever monthOffset changes
  useEffect(() => {
    const today = new Date();
    const targetDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
    const targetYear = targetDate.getFullYear();
    const targetMonth = targetDate.getMonth();

    setCurrentMonthLabel(targetDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' }));

    const firstDayIndex = new Date(targetYear, targetMonth, 1).getDay();
    const leadingEmptyDays = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    const totalDaysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
    const totalDaysInPrevMonth = new Date(targetYear, targetMonth, 0).getDate();

    const grid = [];

    // 1. Fill previous month leading days
    for (let i = leadingEmptyDays - 1; i >= 0; i--) {
      const prevDate = new Date(targetYear, targetMonth - 1, totalDaysInPrevMonth - i);
      grid.push({
        date: prevDate,
        dateStr: getLocalDateString(prevDate),
        isCurrentMonth: false,
        dayNumber: prevDate.getDate(),
      });
    }

    // 2. Fill current month days
    for (let i = 1; i <= totalDaysInMonth; i++) {
      const currDate = new Date(targetYear, targetMonth, i);
      grid.push({
        date: currDate,
        dateStr: getLocalDateString(currDate),
        isCurrentMonth: true,
        dayNumber: i,
      });
    }

    // 3. Fill next month trailing days to complete 42 cells grid
    const remainingCells = 42 - grid.length;
    for (let i = 1; i <= remainingCells; i++) {
      const nextDate = new Date(targetYear, targetMonth + 1, i);
      grid.push({
        date: nextDate,
        dateStr: getLocalDateString(nextDate),
        isCurrentMonth: false,
        dayNumber: i,
      });
    }

    setMonthDaysGrid(grid);
  }, [monthOffset]);

  const handlePrev = () => {
    if (viewMode === 'week') {
      setWeekOffset(prev => prev - 1);
    } else {
      setMonthOffset(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (viewMode === 'week') {
      setWeekOffset(prev => prev + 1);
    } else {
      setMonthOffset(prev => prev + 1);
    }
  };

  const handleToday = () => {
    if (viewMode === 'week') {
      setWeekOffset(0);
    } else {
      setMonthOffset(0);
    }
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[32px] p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.005)] flex flex-col gap-6 font-sans w-full transition-all duration-300">
      
      {/* Calendar Controls & Modes */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#F1F5F9] pb-5">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black text-[#005BBF] uppercase tracking-wider">LỊCH PHÂN BỔ THỜI GIAN THỰC</span>
          <h2 className="text-xl font-black text-[#0F172A] font-[Montserrat] flex items-center gap-2">
            {viewMode === 'week' ? 'Lịch Trình Tuần Này' : `Lịch Tháng: ${currentMonthLabel}`}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Week / Month Tabs */}
          <div className="flex bg-[#F1F5F9] p-1 rounded-2xl border border-[#E2E8F0]">
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all border-0 ${
                viewMode === 'week' ? 'bg-[#005BBF] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 bg-transparent'
              }`}
            >
              <LuCalendarRange size={14} />
              <span>Tuần</span>
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all border-0 ${
                viewMode === 'month' ? 'bg-[#005BBF] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 bg-transparent'
              }`}
            >
              <LuCalendarDays size={14} />
              <span>Tháng (Google Cal)</span>
            </button>
          </div>
          
          {/* Week/Month Switch Navigation */}
          <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-1 w-max">
            <button 
              onClick={handlePrev}
              className="p-1.5 hover:bg-white rounded-lg transition-all text-[#64748B] hover:text-[#0F172A] cursor-pointer border-0 bg-transparent"
            >
              <LuChevronLeft size={16} />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1 bg-white shadow-sm border border-slate-100 rounded-lg text-[10px] font-black text-[#005BBF] uppercase cursor-pointer"
            >
              Hôm Nay
            </button>
            <button 
              onClick={handleNext}
              className="p-1.5 hover:bg-white rounded-lg transition-all text-[#64748B] hover:text-[#0F172A] cursor-pointer border-0 bg-transparent"
            >
              <LuChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* RENDER MODE: WEEK VIEW */}
      {viewMode === 'week' && (
        <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
          {currentWeekDays.map((day) => {
            const dayBookings = calendarSlots.filter(s => s.dateStr === day.dateStr);
            const isToday = getLocalDateString(new Date()) === day.dateStr;
            
            return (
              <div 
                key={day.dateStr}
                className={`flex flex-col rounded-2xl p-3 border transition-all duration-300 min-h-[170px] ${
                  isToday 
                    ? 'bg-[#DFEFFF]/20 border-[#005BBF]/30 ring-2 ring-[#DFEFFF]/55' 
                    : 'bg-[#F8FAFC]/55 border-[#E2E8F0] hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                  <span className="text-[10px] font-black text-[#475569]">{day.dayName}</span>
                  <span className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-extrabold ${
                    isToday ? 'bg-[#005BBF] text-white shadow-md shadow-[#005BBF]/10' : 'text-[#94A3B8]'
                  }`}>
                    {day.date.getDate()}
                  </span>
                </div>

                {/* Day's appointments */}
                <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
                  {dayBookings.length > 0 ? (
                    dayBookings.map((slot, index) => {
                      let statusColor = 'bg-amber-500 text-white hover:bg-amber-600 border-none';
                      if (slot.status === 'confirmed') statusColor = 'bg-emerald-600 text-white hover:bg-emerald-700 border-none';
                      else if (slot.status === 'completed') statusColor = 'bg-slate-400 text-white hover:bg-slate-500 border-none';
                      else if (slot.status === 'rescheduled') statusColor = 'bg-[#005BBF] text-white hover:bg-[#004493] border-none';

                      return (
                        <div 
                          key={`${slot.id || 'slot'}-${index}`}
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-2.5 rounded-xl flex flex-col gap-1 shadow-[0_2px_8px_rgba(0,0,0,0.01)] text-[10px] cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all ${statusColor}`}
                          title="Bấm để xem chi tiết buổi học"
                        >
                          <div className="flex items-center justify-between font-black">
                            <span className="flex items-center gap-0.5">
                              <LuClock size={10} />
                              {slot.timeLabel}
                            </span>
                            {slot.googleMeetUrl && (
                              <LuVideo size={11} className="text-white/95 flex-shrink-0" />
                            )}
                          </div>
                          <span className="font-extrabold line-clamp-2 leading-tight text-white">{slot.courseTitle}</span>
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
      )}

      {/* RENDER MODE: GOOGLE CALENDAR MONTH VIEW (Large Grid cells: min-h-[145px]) */}
      {viewMode === 'month' && (
        <div className="flex flex-col gap-1 w-full animate-fade-in">
          {/* Header weekdays */}
          <div className="grid grid-cols-7 gap-1 text-center font-black text-[11px] text-[#475569] uppercase tracking-wider py-3.5 border-b border-[#E2E8F0]">
            <div>Thứ Hai</div>
            <div>Thứ Ba</div>
            <div>Thứ Tư</div>
            <div>Thứ Năm</div>
            <div>Thứ Sáu</div>
            <div>Thứ Bảy</div>
            <div className="text-rose-500">Chủ Nhật</div>
          </div>
          
          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2 mt-2 w-full">
            {monthDaysGrid.map((cell, idx) => {
              const cellBookings = calendarSlots.filter(s => s.dateStr === cell.dateStr);
              const isToday = getLocalDateString(new Date()) === cell.dateStr;
              
              return (
                <div 
                  key={`${cell.dateStr}-${idx}`}
                  className={`flex flex-col border rounded-2xl p-2.5 min-h-[145px] transition-all duration-300 ${
                    cell.isCurrentMonth ? 'bg-white' : 'bg-slate-50/30 opacity-40'
                  } ${
                    isToday ? 'border-[#005BBF]/30 ring-2 ring-[#DFEFFF]/55 bg-[#DFEFFF]/10' : 'border-[#E2E8F0] hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  {/* Cell Header */}
                  <div className="flex justify-end mb-1.5">
                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-black ${
                      isToday 
                        ? 'bg-[#005BBF] text-white shadow-md shadow-[#005BBF]/15' 
                        : cell.isCurrentMonth ? 'text-slate-700' : 'text-slate-400'
                    }`}>
                      {cell.dayNumber}
                    </span>
                  </div>

                  {/* Day's appointments list */}
                  <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto max-h-[90px] [&::-webkit-scrollbar]:hidden">
                    {cellBookings.slice(0, 3).map((slot, index) => {
                      let statusStyles = 'bg-amber-500 text-white border-none';
                      if (slot.status === 'confirmed') statusStyles = 'bg-emerald-600 text-white border-none';
                      else if (slot.status === 'completed') statusStyles = 'bg-slate-400 text-white border-none';
                      else if (slot.status === 'rescheduled') statusStyles = 'bg-[#005BBF] text-white border-none';

                      return (
                        <div 
                          key={`${slot.id || 'cell-slot'}-${index}`}
                          onClick={() => setSelectedSlot(slot)}
                          className={`px-2 py-1 rounded-lg text-[9px] font-black truncate cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all ${statusStyles}`}
                          title={`${slot.timeLabel} - ${slot.courseTitle}`}
                        >
                          <span className="font-extrabold mr-1 bg-white/20 text-white px-1 rounded">{slot.timeLabel}</span>
                          <span>{slot.courseTitle}</span>
                        </div>
                      );
                    })}
                    {cellBookings.length > 3 && (
                      <div className="text-[9px] font-black text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 transition-all rounded-lg py-0.5 text-center cursor-pointer">
                        + {cellBookings.length - 3} lịch khác
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* POPUP MODAL: SLOT DETAILS */}
      <Modal
        isOpen={selectedSlot !== null}
        onClose={() => setSelectedSlot(null)}
        title="Thông tin chi tiết buổi học"
        containerClassName="max-w-md"
        className="p-8 pt-0 font-sans"
      >
        {selectedSlot && (
          <div className="flex flex-col gap-5 py-2">
            
            {/* Title / Header */}
            <div className="flex flex-col gap-1 border-b border-slate-100 pb-3">
              <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">KHÓA HỌC</span>
              <h3 className="text-base font-black text-slate-800 leading-snug">
                {selectedSlot.courseTitle}
              </h3>
            </div>

            {/* Time slot details */}
            <div className="flex items-center justify-between text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="text-[#64748B] font-bold">Thời gian học:</span>
              <strong className="text-slate-800 flex items-center gap-1 font-black">
                <LuClock size={14} className="text-blue-500" />
                {selectedSlot.timeLabel}, ngày {new Date(selectedSlot.dateStr).toLocaleDateString('vi-VN')}
              </strong>
            </div>

            {/* Partner Details */}
            <div className="flex items-center gap-3 border border-[#E2E8F0] p-4 rounded-2xl">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 border border-slate-200/50 flex-shrink-0">
                <img 
                  src={selectedSlot.partnerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'} 
                  alt="Partner Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[8px] text-[#94A3B8] font-black uppercase tracking-wider">
                  {isMentor ? 'HỌC VIÊN ĐĂNG KÝ' : 'CỐ VẤN GIẢNG DẠY'}
                </span>
                <strong className="text-xs text-slate-700 truncate block font-black">
                  {selectedSlot.partnerName}
                </strong>
              </div>
            </div>

            {/* Google Meet details */}
            {selectedSlot.googleMeetUrl ? (
              <div className="flex flex-col gap-2 border border-blue-100 bg-[#F4F9FF]/30 p-4 rounded-2xl">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1">
                  <LuVideo size={13} />
                  <span>Phòng học trực tuyến Google Meet:</span>
                </span>
                <a 
                  href={selectedSlot.googleMeetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1.5 no-underline font-black text-xs mt-0.5"
                >
                  <span>Mở liên kết vào lớp học</span>
                  <LuExternalLink size={14} />
                </a>
              </div>
            ) : (
              <div className="bg-rose-50/50 text-[#EF4444] border border-rose-100 font-extrabold text-[10px] py-4 px-4 rounded-2xl text-center">
                Mentor chưa cập nhật liên kết phòng học trực tuyến cho buổi học này.
              </div>
            )}

            <div className="flex items-center justify-end gap-3 mt-2 border-t border-slate-100 pt-3">
              <button
                onClick={() => setSelectedSlot(null)}
                className="px-5 py-2.5 text-xs font-black text-[#64748b] hover:text-[#475569] uppercase tracking-wider transition-colors cursor-pointer border-0 bg-transparent"
              >
                Đóng lại
              </button>
              {onManageSlot && selectedSlot.status !== 'completed' && selectedSlot.status !== 'cancelled' && (
                <button
                  onClick={() => {
                    onManageSlot(selectedSlot.id);
                    setSelectedSlot(null);
                  }}
                  className="bg-[#DFEFFF] hover:bg-[#DFEFFF]/80 text-[#005BBF] border border-[#005BBF]/20 font-black text-xs py-2.5 px-5 rounded-xl transition-all cursor-pointer active:scale-[0.98]"
                >
                  {isMentor ? 'Quản lý buổi học' : 'Hủy lịch học'}
                </button>
              )}
              {selectedSlot.googleMeetUrl && (
                <a
                  href={selectedSlot.googleMeetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#005BBF] hover:bg-[#004493] text-white font-extrabold text-xs py-2.5 px-6 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#005BBF]/10 active:scale-[0.98] cursor-pointer no-underline"
                >
                  <LuVideo size={14} />
                  <span>Vào phòng học</span>
                </a>
              )}
            </div>

          </div>
        )}
      </Modal>

    </div>
  );
};
