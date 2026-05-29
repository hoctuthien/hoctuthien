import React from 'react';
import { 
  LuClock, 
  LuVideo 
} from 'react-icons/lu';

interface UpcomingClassCardProps {
  isMentor: boolean;
  allBookings: any[];
}

export const UpcomingClassCard: React.FC<UpcomingClassCardProps> = ({ isMentor, allBookings }) => {
  const activeBookings = allBookings.filter(b => b.status === 'confirmed' || b.status === 'pending');
  const nextBooking = activeBookings[0];

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[32px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.005)] flex flex-col gap-5">
      <div className="flex flex-col gap-1 border-b border-slate-100 pb-3">
        <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">THỜI GIAN BIỂU HÔM NAY</span>
        <h3 className="text-xs font-black text-[#0F172A] font-[Montserrat]">
          {isMentor ? 'Buổi Dạy Sắp Tới' : 'Lớp Học Tiếp Theo'}
        </h3>
      </div>

      {nextBooking ? (
        (() => {
          const bTime = new Date(nextBooking.meetingTime);
          const isConfirmed = nextBooking.status === 'confirmed';
          const partnerAvatar = isMentor ? nextBooking.mentee?.avatarUrl : nextBooking.course?.mentor?.avatarUrl;
          const partnerName = isMentor ? nextBooking.mentee?.name : nextBooking.course?.mentor?.name;

          return (
            <div className="flex flex-col gap-3">
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
                    src={partnerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'} 
                    alt="Partner" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col min-w-0 gap-0.5">
                  <span className="text-[8px] text-[#94A3B8] font-black uppercase tracking-wider">
                    {isMentor ? 'HỌC VIÊN' : 'CỐ VẤN'}
                  </span>
                  <strong className="text-xs text-slate-700 truncate block">
                    {partnerName}
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
                  {isConfirmed ? 'Chờ link phòng học' : 'Chờ cố vấn xác nhận lớp'}
                </div>
              )}
            </div>
          );
        })()
      ) : (
        <div className="text-center py-6 text-[11px] font-semibold text-[#94A3B8] italic">
          Không có lịch học nào sắp tới.
        </div>
      )}
    </div>
  );
};
