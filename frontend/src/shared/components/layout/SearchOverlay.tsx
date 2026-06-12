"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Icon } from '@/core/ui/Icon';
import { apiService } from '@/core/api/base';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchOverlay = ({ isOpen, onClose }: SearchOverlayProps) => {
  const [query, setQuery] = useState('');
  const [courses, setCourses] = useState<any[]>([]);
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Esc key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle Search Fetching
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setCourses([]);
      setMentors([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    debounceRef.current = setTimeout(async () => {
      try {
        const [coursesRes, mentorsRes] = await Promise.all([
          apiService.get<any>('/courses', { params: { title: trimmed, limit: '5' } }),
          apiService.get<any>('/mentor-profiles', { params: { search: trimmed, limit: '5' } })
        ]);

        setCourses(coursesRes.data?.data || []);
        setMentors(mentorsRes.data?.data || []);
      } catch (err) {
        console.error('Failed to search:', err);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  // Clean state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setCourses([]);
      setMentors([]);
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex flex-col justify-start items-center pt-24 px-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-3xl bg-white rounded-[32px] shadow-2xl border border-slate-100 flex flex-col max-h-[70vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
          <Icon name="Search" className="text-slate-400" size={22} />
          <input
            type="text"
            placeholder="Tìm kiếm khóa học hoặc cố vấn..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full text-base font-semibold outline-none text-slate-800 placeholder-slate-400"
          />
          {loading ? (
            <Icon name="Loader2" className="animate-spin text-primary" size={20} />
          ) : query ? (
            <button 
              onClick={() => setQuery('')}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-all border-0 bg-transparent cursor-pointer"
            >
              <Icon name="X" size={16} />
            </button>
          ) : null}
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-6">
          {query.trim().length < 2 ? (
            <div className="text-center py-12 text-slate-400 font-semibold text-xs flex flex-col items-center gap-2">
              <Icon name="Search" size={32} className="text-slate-300" />
              <span>Nhập tối thiểu 2 ký tự để tìm kiếm</span>
            </div>
          ) : !loading && courses.length === 0 && mentors.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-semibold text-xs flex flex-col items-center gap-2">
              <Icon name="Inbox" size={32} className="text-slate-300" />
              <span>Không tìm thấy kết quả phù hợp cho "{query}"</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Courses Column */}
              <div className="flex flex-col gap-4">
                <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">
                  Khóa Học ({courses.length})
                </span>
                <div className="flex flex-col gap-3">
                  {courses.map((course) => (
                    <Link
                      key={course.id}
                      href={`/courses/detail/${course.id}`}
                      onClick={onClose}
                      className="flex gap-4 p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group no-underline"
                    >
                      <div className="w-14 h-14 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100">
                        <img 
                          src={course.thumbnailUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=150&q=80"} 
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="flex flex-col justify-center min-w-0">
                        <h4 className="text-xs font-black text-slate-800 line-clamp-1 group-hover:text-primary transition-colors">
                          {course.title}
                        </h4>
                        <span className="text-[10px] font-bold text-slate-500 mt-1">
                          {course.price === 0 ? "Miễn phí" : `${course.price.toLocaleString('vi-VN')}đ`} • {course.durationMinutes} phút
                        </span>
                      </div>
                    </Link>
                  ))}
                  {courses.length === 0 && (
                    <p className="text-[11px] text-slate-400 italic">Không có khóa học nào</p>
                  )}
                </div>
              </div>

              {/* Mentors Column */}
              <div className="flex flex-col gap-4">
                <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">
                  Cố Vấn ({mentors.length})
                </span>
                <div className="flex flex-col gap-3">
                  {mentors.map((mentor) => (
                    <Link
                      key={mentor.id}
                      href={`/courses?mentorId=${mentor.userId}`}
                      onClick={onClose}
                      className="flex gap-4 p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group no-underline"
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-100">
                        <img 
                          src={mentor.user?.avatarUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80"} 
                          alt={mentor.user?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col justify-center min-w-0">
                        <h4 className="text-xs font-black text-slate-800 line-clamp-1 group-hover:text-primary transition-colors">
                          {mentor.user?.name}
                        </h4>
                        <span className="text-[10px] font-bold text-slate-500 mt-1 line-clamp-1">
                          {mentor.jobTitle ? `${mentor.jobTitle}${mentor.company ? ` tại ${mentor.company}` : ''}` : 'Cố vấn Học Tự Thiện'}
                        </span>
                      </div>
                    </Link>
                  ))}
                  {mentors.length === 0 && (
                    <p className="text-[11px] text-slate-400 italic">Không có cố vấn nào</p>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};
