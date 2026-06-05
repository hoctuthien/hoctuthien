import React from 'react';
import { 
  LuBookOpen, 
  LuCalendar, 
  LuCheck, 
  LuClock, 
  LuUsers,
  LuLayers 
} from 'react-icons/lu';

interface MetricsGridProps {
  isMentor: boolean;
  stat1: number;
  stat2: number;
  stat3: number;
  stat4: number;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ isMentor, stat1, stat2, stat3, stat4 }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* Stat 1 */}
      <div className="bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.005)] flex items-center gap-4 hover:shadow-md transition-all duration-300">
        <div className="w-10 h-10 bg-[#DFEFFF] text-[#005BBF] rounded-xl flex items-center justify-center flex-shrink-0">
          {isMentor ? <LuLayers size={20} /> : <LuBookOpen size={20} />}
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[10px] text-[#64748b] font-black uppercase tracking-wider block truncate">
            {isMentor ? 'KHÓA HỌC ĐÃ TẠO' : 'KHÓA HỌC ĐÃ ĐĂNG KÝ'}
          </span>
          <span className="text-xl font-black text-[#0F172A]">{stat1}</span>
        </div>
      </div>

      {/* Stat 2 */}
      <div className="bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.005)] flex items-center gap-4 hover:shadow-md transition-all duration-300">
        <div className="w-10 h-10 bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center flex-shrink-0">
          <LuCalendar size={20} />
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[10px] text-[#64748b] font-black uppercase tracking-wider block truncate">LỊCH HẸN SẮP TỚI</span>
          <span className="text-xl font-black text-[#D97706]">{stat2}</span>
        </div>
      </div>

      {/* Stat 3 */}
      <div className="bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.005)] flex items-center gap-4 hover:shadow-md transition-all duration-300">
        <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center flex-shrink-0">
          <LuCheck size={20} />
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[10px] text-[#64748b] font-black uppercase tracking-wider block truncate">ĐÃ HOÀN THÀNH</span>
          <span className="text-xl font-black text-[#10B981]">{stat3}</span>
        </div>
      </div>

      {/* Stat 4 */}
      <div className="bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.005)] flex items-center gap-4 hover:shadow-md transition-all duration-300">
        <div className="w-10 h-10 bg-[#89FA9B]/35 text-[#005320] rounded-xl flex items-center justify-center flex-shrink-0">
          {isMentor ? <LuUsers size={20} /> : <LuClock size={20} />}
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[10px] text-[#64748b] font-black uppercase tracking-wider block truncate">
            {isMentor ? 'HỌC VIÊN ĐANG GIẢNG DẠY' : 'SỐ GIỜ HỌC TÍCH LŨY'}
          </span>
          <span className="text-xl font-black text-[#005BBF]">
            {isMentor ? stat4 : `${stat4}h`}
          </span>
        </div>
      </div>
    </div>
  );
};
