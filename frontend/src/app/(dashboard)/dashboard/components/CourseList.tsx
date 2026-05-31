import React from 'react';
import { EmptyState } from '@shared';
import { Button } from '@/core/ui';
import { 
  LuBookOpen, 
  LuArrowRight 
} from 'react-icons/lu';

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

interface CourseListProps {
  courses: CourseItem[];
  isMentor: boolean;
}

export const CourseList: React.FC<CourseListProps> = ({ courses, isMentor }) => {
  return (
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
  );
};
