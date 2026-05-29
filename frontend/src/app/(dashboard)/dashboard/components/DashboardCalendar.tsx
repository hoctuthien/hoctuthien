import React, { useState, useEffect } from 'react';
import { 
  LuClock, 
  LuVideo, 
  LuChevronLeft, 
  LuChevronRight,
  LuCalendarDays,
  LuCalendarRange
} from 'react-icons/lu';

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
}

export const DashboardCalendar: React.FC<DashboardCalendarProps> = ({
  currentWeekDays,
  calendarSlots,
  isMentor,
  setWeekOffset,
  weekOffset,
}) => {
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [monthOffset, setMonthOffset] = useState(0);
  const [monthDaysGrid, setMonthDaysGrid] = useState<{ date: Date; dateStr: string; isCurrentMonth: boolean; dayNumber: number }[]>([]);
  const [currentMonthLabel, setCurrentMonthLabel] = useState('');

  // Calculate Month Grid whenever monthOffset changes
  useEffect(() => {
    const today = new Date();
    // Calculate targeted year/month based on offset
    const targetDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
    const targetYear = targetDate.getFullYear();
    const targetMonth = targetDate.getMonth(); // 0-indexed

    setCurrentMonthLabel(targetDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' }));

    // First day of current target month (0 = Sunday, 1 = Monday etc.)
    const firstDayIndex = new Date(targetYear, targetMonth, 1).getDay();
    // Convert to Monday-start (0 = Monday, 6 = Sunday)
    const leadingEmptyDays = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    // Total days in target month
    const totalDaysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();

    // Previous month total days
    const totalDaysInPrevMonth = new Date(targetYear, targetMonth, 0).getDate();

    const grid = [];

    // 1. Fill previous month leading days
    for (let i = leadingEmptyDays - 1; i >= 0; i--) {
      const prevDate = new Date(targetYear, targetMonth - 1, totalDaysInPrevMonth - i);
      grid.push({
        date: prevDate,
        dateStr: prevDate.toISOString().split('T')[0],
        isCurrentMonth: false,
        dayNumber: prevDate.getDate(),
      });
    }

    // 2. Fill current month days
    for (let i = 1; i <= totalDaysInMonth; i++) {
      const currDate = new Date(targetYear, targetMonth, i);
      grid.push({
        date: currDate,
        dateStr: currDate.toISOString().split('T')[0],
        isCurrentMonth: true,
        dayNumber: i,
      });
    }

    // 3. Fill next month trailing days to complete full weeks grid (usually 42 cells)
    const remainingCells = 42 - grid.length;
    for (let i = 1; i <= remainingCells; i++) {
      const nextDate = new Date(targetYear, targetMonth + 1, i);
      grid.push({
        date: nextDate,
        dateStr: nextDate.toISOString().split('T')[0],
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
    <div className="bg-white border border-[#E2E8F0] rounded-[32px] p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.005)] flex flex-col gap-6 font-sans">
      
      {/* Calendar Controls & Modes */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#F1F5F9] pb-5">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider">LỊCH PHÂN BỔ THỜI GIAN THỰC</span>
          <h2 className="text-xl font-black text-[#0F172A] font-[Montserrat] flex items-center gap-2">
            {viewMode === 'week' ? 'Lịch Trình Tuần Này' : `Lịch Tháng: ${currentMonthLabel}`}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Week / Month Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all border-0 ${
                viewMode === 'week' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 bg-transparent'
              }`}
            >
              <LuCalendarRange size={14} />
              <span>Tuần</span>
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all border-0 ${
                viewMode === 'month' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 bg-transparent'
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
              className="px-3 py-1 bg-white shadow-sm border border-slate-100 rounded-lg text-[10px] font-black text-blue-600 uppercase cursor-pointer"
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
            const dayBookings = calendarSlots.filter(s => s.dateStr === day.dateStr && s.status !== 'cancelled');
            const isToday = new Date().toISOString().split('T')[0] === day.dateStr;
            
            return (
              <div 
                key={day.dateStr}
                className={`flex flex-col rounded-2xl p-3 border transition-all duration-300 min-h-[160px] ${
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
                    dayBookings.map((slot, index) => {
                      let statusColor = 'bg-amber-100 border-amber-200 text-amber-800';
                      if (slot.status === 'confirmed') statusColor = 'bg-emerald-100 border-emerald-200 text-emerald-800';
                      else if (slot.status === 'completed') statusColor = 'bg-slate-100 border-slate-200 text-slate-500';
                      else if (slot.status === 'rescheduled') statusColor = 'bg-blue-100 border-blue-200 text-blue-800';

                      return (
                        <div 
                          key={`${slot.id || 'slot'}-${index}`}
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
                          <span className="font-extrabold line-clamp-1 break-all text-slate-800">{slot.courseTitle}</span>
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
      )}

      {/* RENDER MODE: GOOGLE CALENDAR MONTH VIEW */}
      {viewMode === 'month' && (
        <div className="flex flex-col gap-1">
          {/* Header weekdays */}
          <div className="grid grid-cols-7 gap-1 text-center font-black text-[10px] text-[#64748B] uppercase tracking-wider py-2 border-b border-[#F1F5F9]">
            <div>Thứ 2</div>
            <div>Thứ 3</div>
            <div>Thứ 4</div>
            <div>Thứ 5</div>
            <div>Thứ 6</div>
            <div>Thứ 7</div>
            <div>CN</div>
          </div>
          
          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5 mt-1.5">
            {monthDaysGrid.map((cell, idx) => {
              const cellBookings = calendarSlots.filter(s => s.dateStr === cell.dateStr && s.status !== 'cancelled');
              const isToday = new Date().toISOString().split('T')[0] === cell.dateStr;
              
              return (
                <div 
                  key={`${cell.dateStr}-${idx}`}
                  className={`flex flex-col border rounded-xl p-2 min-h-[90px] transition-all duration-300 ${
                    cell.isCurrentMonth ? 'bg-white' : 'bg-slate-50/40 opacity-55'
                  } ${
                    isToday ? 'border-blue-400 ring-1 ring-blue-100 bg-blue-50/10' : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  {/* Cell Header */}
                  <div className="flex justify-end mb-1">
                    <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-black ${
                      isToday 
                        ? 'bg-blue-600 text-white' 
                        : cell.isCurrentMonth ? 'text-slate-700' : 'text-slate-400'
                    }`}>
                      {cell.dayNumber}
                    </span>
                  </div>

                  {/* Day's micro-appointments list */}
                  <div className="flex-1 flex flex-col gap-1 overflow-y-auto max-h-[60px] [&::-webkit-scrollbar]:hidden">
                    {cellBookings.slice(0, 3).map((slot, index) => {
                      let statusStyles = 'bg-blue-50 border-blue-100 text-blue-700';
                      if (slot.status === 'confirmed') statusStyles = 'bg-emerald-50 border-emerald-100 text-emerald-700';
                      else if (slot.status === 'completed') statusStyles = 'bg-slate-50 border-slate-100 text-slate-500';

                      return (
                        <div 
                          key={`${slot.id || 'cell-slot'}-${index}`}
                          className={`px-1.5 py-0.5 rounded text-[8px] font-bold border truncate ${statusStyles}`}
                          title={`${slot.timeLabel} - ${slot.courseTitle}`}
                        >
                          <span className="font-extrabold mr-1">{slot.timeLabel}</span>
                          {slot.courseTitle}
                        </div>
                      );
                    })}
                    {cellBookings.length > 3 && (
                      <div className="text-[8px] font-black text-[#64748B] text-center italic mt-0.5">
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
    </div>
  );
};
