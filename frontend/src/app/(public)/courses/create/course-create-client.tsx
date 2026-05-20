"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Breadcrumb } from "@shared";
import {
  LuArrowLeft,
  LuSparkles,
  LuImage,
  LuBookOpen,
  LuClock,
  LuDollarSign,
  LuPlus,
  LuTrash2,
  LuCheck,
  LuStar,
  LuGraduationCap
} from "react-icons/lu";


interface Lesson {
  id: string;
  title: string;
  duration: string;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export default function CourseCreateClient() {
  const router = useRouter();

  // Form states
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [category, setCategory] = useState("UI/UX Design");
  const [level, setLevel] = useState("intermediate");
  const [duration, setDuration] = useState("12");
  const [format, setFormat] = useState("online");
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState("0");
  
  // Dynamic Unsplash preset images for premium visual feel
  const thumbPresets = [
    {
      id: "preset-1",
      url: "https://images.unsplash.com/photo-1541462608141-2f68c48a4077?q=80&w=600&auto=format&fit=crop",
      label: "Thiết kế sản phẩm"
    },
    {
      id: "preset-2",
      url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop",
      label: "Lập trình công nghệ"
    },
    {
      id: "preset-3",
      url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=600&auto=format&fit=crop",
      label: "Kinh tế & Phân tích"
    },
    {
      id: "preset-4",
      url: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?q=80&w=600&auto=format&fit=crop",
      label: "Viết sáng tạo & Báo chí"
    }
  ];

  const [selectedThumb, setSelectedThumb] = useState(thumbPresets[0].url);
  const [customThumbUrl, setCustomThumbUrl] = useState("");
  
  // Curriculum outline list
  const [modules, setModules] = useState<Module[]>([
    {
      id: "mod-1",
      title: "Chương 1: Giới thiệu và Nền tảng cốt lõi",
      lessons: [
        { id: "les-1", title: "Bài 1.1: Tổng quan lộ trình và quy chuẩn học thuật", duration: "15 phút" },
        { id: "les-2", title: "Bài 1.2: Các khái niệm cơ bản đầu tiên", duration: "30 phút" }
      ]
    }
  ]);

  // Form submission and success screen state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Curriculum functions
  const addModule = () => {
    const newMod: Module = {
      id: `mod-${Date.now()}`,
      title: `Chương ${modules.length + 1}: Chương học mới`,
      lessons: []
    };
    setModules([...modules, newMod]);
  };

  const removeModule = (modId: string) => {
    if (modules.length === 1) return; // Keep at least one
    setModules(modules.filter(m => m.id !== modId));
  };

  const updateModuleTitle = (modId: string, value: string) => {
    setModules(modules.map(m => m.id === modId ? { ...m, title: value } : m));
  };

  const addLesson = (modId: string) => {
    setModules(modules.map(m => {
      if (m.id === modId) {
        const newLes: Lesson = {
          id: `les-${Date.now()}`,
          title: `Bài học mới ${m.lessons.length + 1}`,
          duration: "20 phút"
        };
        return { ...m, lessons: [...m.lessons, newLes] };
      }
      return m;
    }));
  };

  const updateLessonTitle = (modId: string, lesId: string, value: string) => {
    setModules(modules.map(m => {
      if (m.id === modId) {
        return {
          ...m,
          lessons: m.lessons.map(l => l.id === lesId ? { ...l, title: value } : l)
        };
      }
      return m;
    }));
  };

  const updateLessonDuration = (modId: string, lesId: string, value: string) => {
    setModules(modules.map(m => {
      if (m.id === modId) {
        return {
          ...m,
          lessons: m.lessons.map(l => l.id === lesId ? { ...l, duration: value } : l)
        };
      }
      return m;
    }));
  };

  const removeLesson = (modId: string, lesId: string) => {
    setModules(modules.map(m => {
      if (m.id === modId) {
        return { ...m, lessons: m.lessons.filter(l => l.id !== lesId) };
      }
      return m;
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    // Simulate API registration request
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  const handleFinishRedirect = () => {
    router.push("/courses");
  };

  const breadcrumbItems = [
    { label: "Trang chủ", href: "/" },
    { label: "Cố vấn", href: "/courses" },
    { label: "Danh sách khóa học", href: "/courses" },
    { label: "Tạo khóa học" },
  ];

  const currentThumb = customThumbUrl.trim() ? customThumbUrl : selectedThumb;

  return (
    <div className="w-full bg-[#FAF9FF] min-h-screen py-8 px-4 md:px-8 font-sans overflow-x-hidden">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        
        {/* Navigation Breadcrumb & Back Arrow */}
        <div className="flex flex-col gap-3">
          <Breadcrumb items={breadcrumbItems} />
          <div className="flex items-center justify-between mt-1">
            <Link 
              href="/courses" 
              className="inline-flex items-center gap-2 text-slate-500 hover:text-[#2563eb] text-sm font-bold transition-colors cursor-pointer group"
            >
              <LuArrowLeft className="group-hover:-translate-x-1 transition-transform" size={16} />
              <span>Quay lại trang danh sách</span>
            </Link>
          </div>
        </div>

        {isSuccess ? (
          /* SUCCESS ANIMATION SCREEN */
          <div className="bg-white border border-[#ECFDF5] rounded-[32px] p-8 md:p-16 text-center shadow-xl shadow-slate-100 max-w-2xl mx-auto flex flex-col items-center gap-6 animate-in zoom-in-95 duration-500 my-12">
            <div className="w-20 h-20 bg-[#ECFDF5] rounded-full flex items-center justify-center text-[#10B981] animate-bounce">
              <LuCheckCircle size={48} />
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Khởi Tạo Khóa Học Thành Công!</h2>
              <p className="text-slate-500 text-sm leading-relaxed max-w-md mx-auto">
                Khóa học <span className="font-extrabold text-[#2563eb]">"{title}"</span> đã được ghi nhận trên hệ thống và chuyển đến ban kiểm duyệt chuyên môn.
              </p>
            </div>

            {/* Structured Syllabus stats */}
            <div className="bg-[#FAF9FF] border border-slate-100 p-5 rounded-2xl w-full flex items-center justify-around gap-4 text-left">
              <div>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">CHƯƠNG TRÌNH</span>
                <span className="text-sm font-black text-slate-800">{modules.length} Chương học</span>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">BÀI GIẢNG</span>
                <span className="text-sm font-black text-slate-800">
                  {modules.reduce((acc, curr) => acc + curr.lessons.length, 0)} Bài học
                </span>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">ĐỊNH DẠNG</span>
                <span className="text-sm font-black text-slate-800 capitalize">{format}</span>
              </div>
            </div>

            <button
              onClick={handleFinishRedirect}
              className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-extrabold text-sm py-4 px-10 rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] cursor-pointer mt-4"
            >
              Về Trang Quản Lý Khóa Học
            </button>
          </div>
        ) : (
          /* FORM & REAL-TIME PREVIEW CONTAINER */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: THE PREMIUM FORM WIZARD */}
            <form onSubmit={handleSubmit} className="lg:col-span-8 flex flex-col gap-8">
              
              {/* Box 1: General Info */}
              <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-[32px] shadow-sm flex flex-col gap-6">
                <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-[#2563eb]">
                    <LuSparkles size={16} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Thông Tin Cơ Bản</h3>
                    <p className="text-[11px] text-slate-400 font-medium">Khởi tạo danh tính và nội dung tóm tắt định vị cho khóa học</p>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 tracking-wider uppercase block mb-1.5">
                      Tên khóa học chính thức <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Thiết kế hệ thống phân cấp thị giác chuyên sâu"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      maxLength={80}
                      className="w-full h-12 px-4 text-sm font-bold bg-[#FAF9FF] border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#2563eb] focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 tracking-wider uppercase block mb-1.5">
                      Mô tả tóm tắt ngắn <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      placeholder="Tóm tắt ngắn gọn mục tiêu, nội dung khóa học và giá trị cốt lõi học sinh nhận được trong 2-3 câu."
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      required
                      maxLength={220}
                      rows={3}
                      className="w-full p-4 text-sm font-semibold bg-[#FAF9FF] border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#2563eb] focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-slate-400 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 tracking-wider uppercase block mb-1.5">
                        Chủ đề / Danh mục đào tạo
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full h-12 px-4 text-xs font-bold bg-[#FAF9FF] border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#2563eb] cursor-pointer"
                      >
                        <option value="UI/UX Design">UI/UX Design</option>
                        <option value="Báo chí">Báo chí</option>
                        <option value="Truyền thông Kỹ thuật số">Truyền thông Kỹ thuật số</option>
                        <option value="Viết sáng tạo">Viết sáng tạo</option>
                        <option value="Đạo đức">Đạo đức</option>
                        <option value="Lập trình di động">Lập trình di động</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 tracking-wider uppercase block mb-1.5">
                        Cấp độ đào tạo
                      </label>
                      <select
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        className="w-full h-12 px-4 text-xs font-bold bg-[#FAF9FF] border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#2563eb] cursor-pointer"
                      >
                        <option value="beginner">Cơ bản (Beginner)</option>
                        <option value="intermediate">Trung cấp (Intermediate)</option>
                        <option value="advanced">Nâng cao (Advanced)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Box 2: Metrics and Format */}
              <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-[32px] shadow-sm flex flex-col gap-6">
                <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-[#2563eb]">
                    <LuClock size={16} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Chi Tiết & Chi Phí</h3>
                    <p className="text-[11px] text-slate-400 font-medium">Cấu hình thời lượng học tập, định dạng học tập và biểu phí</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 tracking-wider uppercase block mb-1.5">
                        Tổng thời lượng (Giờ học)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="Ví dụ: 15"
                          value={duration}
                          onChange={(e) => setDuration(e.target.value)}
                          min={1}
                          required
                          className="w-full h-12 pl-4 pr-12 text-sm font-bold bg-[#FAF9FF] border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#2563eb] transition-all"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold pointer-events-none">giờ học</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 tracking-wider uppercase block mb-1.5">
                        Hình thức giảng dạy
                      </label>
                      <select
                        value={format}
                        onChange={(e) => setFormat(e.target.value)}
                        className="w-full h-12 px-4 text-xs font-bold bg-[#FAF9FF] border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#2563eb] cursor-pointer"
                      >
                        <option value="online">Học trực tuyến (Online)</option>
                        <option value="offline">Học trực tiếp (Offline)</option>
                        <option value="hybrid">Học kết hợp (Hybrid)</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-[#FAF9FF] border border-slate-100 p-5 rounded-2xl flex flex-col gap-4">
                    <span className="text-[10px] font-black text-slate-500 tracking-wider uppercase">THU PHÍ KHÓA HỌC</span>
                    
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => { setIsPaid(false); setPrice("0"); }}
                        className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all ${
                          !isPaid
                            ? "bg-white border-2 border-[#2563eb] text-[#2563eb] shadow-sm"
                            : "bg-transparent border border-slate-200 text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        Miễn phí
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsPaid(true)}
                        className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all ${
                          isPaid
                            ? "bg-white border-2 border-[#2563eb] text-[#2563eb] shadow-sm"
                            : "bg-transparent border border-slate-200 text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        Trả phí
                      </button>
                    </div>

                    {isPaid && (
                      <div className="relative animate-in slide-in-from-top-2 duration-200">
                        <LuDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                          type="number"
                          placeholder="Ví dụ: 250000"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          min={1000}
                          required
                          className="w-full h-12 pl-9 pr-12 text-sm font-bold bg-white border border-slate-200 rounded-xl outline-none focus:border-[#2563eb] transition-all"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold pointer-events-none">VNĐ</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Box 3: Cover image selection */}
              <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-[32px] shadow-sm flex flex-col gap-5">
                <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-[#2563eb]">
                    <LuImage size={16} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Ảnh Bìa Đại Diện</h3>
                    <p className="text-[11px] text-slate-400 font-medium">Lựa chọn các mẫu thiết kế nghệ thuật cao cấp để định hình nhận diện trực quan</p>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Presets Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {thumbPresets.map((preset) => {
                      const isActive = selectedThumb === preset.url && !customThumbUrl.trim();
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            setSelectedThumb(preset.url);
                            setCustomThumbUrl("");
                          }}
                          className={`relative aspect-[3/2] rounded-xl overflow-hidden border-2 transition-all ${
                            isActive 
                              ? "border-[#2563eb] ring-4 ring-blue-50 scale-[1.02]" 
                              : "border-slate-200 hover:border-slate-400"
                          }`}
                        >
                          <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-slate-950/40 flex items-end p-2.5">
                            <span className="text-[9px] text-white font-extrabold text-left leading-tight block">
                              {preset.label}
                            </span>
                          </div>
                          {isActive && (
                            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#2563eb] rounded-full flex items-center justify-center text-white">
                              <LuCheck size={10} strokeWidth={4} />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-3 py-1">
                    <div className="h-px bg-slate-100 flex-1" />
                    <span className="text-[9px] text-slate-400 font-extrabold tracking-wider uppercase">HOẶC DÙNG ẢNH TÙY CHỌN</span>
                    <div className="h-px bg-slate-100 flex-1" />
                  </div>

                  {/* Custom URL Input */}
                  <div>
                    <input
                      type="url"
                      placeholder="Dán đường dẫn ảnh thumbnail của bạn (URL)..."
                      value={customThumbUrl}
                      onChange={(e) => setCustomThumbUrl(e.target.value)}
                      className="w-full h-12 px-4 text-sm font-semibold bg-[#FAF9FF] border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#2563eb] transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* Box 4: Interactive Syllabus Outline Builder */}
              <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-[32px] shadow-sm flex flex-col gap-5">
                <div className="flex items-center justify-between border-b border-slate-50 pb-4 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-[#2563eb]">
                      <LuBookOpen size={16} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 tracking-tight">Khung Giáo Trình Giảng Dạy</h3>
                      <p className="text-[11px] text-slate-400 font-medium">Thiết kế cấu trúc chương học và danh sách bài giảng trực quan</p>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={addModule}
                    className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-extrabold text-[11px] py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-all shadow-sm active:scale-[0.98] cursor-pointer"
                  >
                    <LuPlus size={12} strokeWidth={3} />
                    Thêm Chương học
                  </button>
                </div>

                <div className="flex flex-col gap-6">
                  {modules.map((mod, modIdx) => (
                    <div 
                      key={mod.id} 
                      className="border border-slate-100 bg-[#FAF9FF]/40 rounded-2xl p-5 flex flex-col gap-4 animate-in slide-in-from-top-2 duration-300 relative group"
                    >
                      {/* Chapter header row */}
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="w-7 h-7 bg-slate-900 text-white rounded-lg flex items-center justify-center text-xs font-black">
                            {modIdx + 1}
                          </span>
                          <input
                            type="text"
                            value={mod.title}
                            onChange={(e) => updateModuleTitle(mod.id, e.target.value)}
                            required
                            className="bg-transparent border-b border-transparent hover:border-slate-200 focus:border-[#2563eb] outline-none text-sm font-black text-slate-900 py-0.5 flex-1"
                          />
                        </div>

                        {modules.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeModule(mod.id)}
                            className="text-slate-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50 cursor-pointer"
                            title="Xóa chương học này"
                          >
                            <LuTrash2 size={14} />
                          </button>
                        )}
                      </div>

                      {/* Lessons inside chapter */}
                      <div className="flex flex-col gap-3 pl-9">
                        {mod.lessons.map((les, lesIdx) => (
                          <div 
                            key={les.id} 
                            className="bg-white border border-slate-100 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative animate-in slide-in-from-left-2 duration-200"
                          >
                            <div className="flex items-center gap-2 flex-1 w-full">
                              <span className="text-[10px] text-slate-400 font-extrabold flex-shrink-0">
                                BÀI {modIdx + 1}.{lesIdx + 1}
                              </span>
                              <input
                                type="text"
                                value={les.title}
                                onChange={(e) => updateLessonTitle(mod.id, les.id, e.target.value)}
                                required
                                placeholder="Tên bài giảng cụ thể..."
                                className="bg-transparent border-b border-transparent hover:border-slate-100 focus:border-[#2563eb] outline-none text-xs font-bold text-slate-800 py-0.5 flex-1 w-full"
                              />
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto self-stretch sm:self-auto border-t sm:border-t-0 pt-2 sm:pt-0">
                              <input
                                type="text"
                                value={les.duration}
                                onChange={(e) => updateLessonDuration(mod.id, les.id, e.target.value)}
                                required
                                placeholder="15 phút"
                                className="bg-[#FAF9FF] border border-slate-200 rounded-lg px-2.5 py-1 text-[10px] font-extrabold text-slate-600 outline-none text-center max-w-[80px]"
                              />
                              <button
                                type="button"
                                onClick={() => removeLesson(mod.id, les.id)}
                                className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50 cursor-pointer"
                                title="Xóa bài học này"
                              >
                                <LuTrash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* Add lesson button */}
                        <button
                          type="button"
                          onClick={() => addLesson(mod.id)}
                          className="self-start text-[10px] font-black text-[#2563eb] hover:text-[#1d4ed8] transition-colors flex items-center gap-1 mt-1 cursor-pointer bg-blue-50/50 hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-dashed border-blue-200/50"
                        >
                          <LuPlus size={10} strokeWidth={3} />
                          THÊM BÀI HỌC
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action row at bottom of form */}
              <div className="flex items-center justify-end gap-4 mt-2">
                <Link
                  href="/courses"
                  className="px-6 py-3.5 text-xs font-black text-slate-500 hover:text-slate-700 transition-colors uppercase tracking-wider cursor-pointer"
                >
                  Hủy bỏ & Trở lại
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-extrabold text-xs py-3.5 px-8 rounded-2xl shadow-lg shadow-blue-500/10 active:scale-[0.98] transition-all cursor-pointer h-12 flex items-center justify-center gap-2 min-w-[200px]"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <LuCheck size={16} strokeWidth={2.5} />
                      <span>Hoàn thành và Đăng ký</span>
                    </>
                  )}
                </button>
              </div>

            </form>

            {/* RIGHT COLUMN: STICKY REAL-TIME LIVE PREVIEW CARD */}
            <div className="lg:col-span-4 lg:sticky lg:top-8 flex flex-col gap-4 w-full">
              <div className="bg-slate-900 text-white px-5 py-4 rounded-[20px] shadow-md border border-slate-800 flex items-center gap-2">
                <LuSparkles size={16} className="text-blue-400 animate-pulse" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-blue-400 font-extrabold uppercase tracking-widest leading-none">Bản xem thử trực quan</span>
                  <span className="text-xs text-slate-300 font-medium">Bản thẻ của bạn sẽ xuất hiện trên Dashboard</span>
                </div>
              </div>

              {/* CARD PREVIEW DESIGN (EXACT PORTRAIT MATCH TO THE FIGMA MENTOR CARD SCREENSHOT) */}
              <div className="bg-white rounded-[24px] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.06)] border border-slate-100/90 flex flex-col justify-between aspect-auto">
                <div>
                  {/* Thumbnail Cover Area */}
                  <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden shadow-sm bg-slate-50 border border-slate-100 mb-5">
                    <img
                      src={currentThumb}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover animate-in fade-in duration-300"
                    />
                    <div className="absolute top-3 left-3 bg-[#FFFBEB] text-[#B45309] px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-0.5">
                      <LuStar size={10} className="fill-amber-500 text-amber-500" />
                      <span>5.0</span>
                    </div>

                    <div className="absolute bottom-3 right-3 bg-slate-950/70 text-white px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wider backdrop-blur-[2px]">
                      {format}
                    </div>
                  </div>

                  {/* Name & Mentor Title */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl overflow-hidden shadow-inner bg-slate-100 border border-slate-200/50 flex-shrink-0">
                      {/* Placeholder mentor avatar */}
                      <img
                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80"
                        alt="Mentor placeholder"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-black text-slate-900 tracking-tight leading-none">Bạn (Cố vấn)</span>
                      <span className="text-[9px] text-[#2563eb] font-extrabold uppercase tracking-wider">
                        Đào tạo chuyên môn cấp cao
                      </span>
                    </div>
                  </div>

                  {/* Title & category */}
                  <div className="flex flex-col gap-1.5 mb-3">
                    <span className="self-start text-[9px] bg-slate-100 text-slate-600 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {category}
                    </span>
                    <h4 className="text-base font-black text-[#0F172A] tracking-tight leading-snug line-clamp-2 min-h-[2.5rem]">
                      {title.trim() ? title : "Tên khóa học của bạn sẽ hiển thị ở đây..."}
                    </h4>
                  </div>

                  {/* Description subtitle */}
                  <p className="text-xs leading-relaxed text-[#475569] font-medium mb-4 line-clamp-3 min-h-[3.2rem]">
                    {subtitle.trim() ? subtitle : "Viết mô tả tóm tắt thú vị, nhấn mạnh các mục tiêu đột phá để thu hút người học tiềm năng..."}
                  </p>
                </div>

                {/* Bottom Stats */}
                <div>
                  <div className="h-px bg-[#F1F5F9] w-full my-4" />
                  
                  <div className="flex flex-col gap-1.5 text-[10px] font-bold text-[#64748b]">
                    <div className="flex items-center justify-between">
                      <span>CẤP ĐỘ KHÓA HỌC:</span>
                      <span className="text-[#0F172A] font-black uppercase tracking-wide">{level}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>THỜI LƯỢNG HỌC:</span>
                      <span className="text-[#0F172A] font-black">{duration || "0"} giờ giảng dạy</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>HỌC PHÍ THAM KHẢO:</span>
                      <span className="text-[#10B981] font-black uppercase tracking-wider">
                        {isPaid ? `${Number(price).toLocaleString("vi-VN")} VNĐ` : "MIỄN PHÍ ĐÀO TẠO"}
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-[#FAF9FF] text-center border border-slate-100 text-[10px] font-black text-slate-500 py-3 rounded-xl uppercase tracking-wider block mt-4 select-none">
                    Bản Xem Thử (Preview)
                  </div>
                </div>
              </div>

              {/* High-fidelity summary stats card */}
              <div className="bg-[#FAF9FF] border border-slate-100 rounded-2xl p-5 flex flex-col gap-3.5">
                <span className="text-[10px] font-black text-slate-500 tracking-wider uppercase">TÓM TẮT GIÁO TRÌNH</span>
                
                <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <LuBookOpen size={14} className="text-slate-400" />
                    <span>Số lượng chương:</span>
                  </div>
                  <span className="font-black text-slate-800">{modules.length}</span>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <LuGraduationCap size={14} className="text-slate-400" />
                    <span>Tổng số bài giảng:</span>
                  </div>
                  <span className="font-black text-slate-800">
                    {modules.reduce((acc, curr) => acc + curr.lessons.length, 0)} bài
                  </span>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
