import React from 'react';
import { 
  LuClock, 
  LuVideo, 
  LuChevronLeft, 
  LuChevronRight 
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

interface WeeklyCalendarProps {
  currentWeekDays: { dayName: string; date: Date; dateStr: string }[];
  calendarSlots: CalendarSlot[];
  isMentor: boolean;
  setWeekOffset: React.Dispatch<React.SetStateAction<number>>;
}

export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
  currentWeekDays,
  calendarSlots,
  isMentor,
  setWeekOffset,
}) => {
  return (
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
  );
};
