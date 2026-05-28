"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Breadcrumb } from "@shared";
import { Button, InlineMessage } from "@/core/ui";
import { courseGateway } from "@/core/gateway";
import { MockCourse } from "@/shared/mocks/mentorCourses.mock";
import { 
  LuBookOpen, 
  LuClock, 
  LuDollarSign, 
  LuGraduationCap, 
  LuStar, 
  LuArrowLeft, 
  LuCheck, 
  LuShare2, 
  LuBookmark, 
  LuAward, 
  LuUsers,
  LuExternalLink
} from "react-icons/lu";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [course, setCourse] = useState<MockCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function loadCourse() {
      try {
        setLoading(true);
        const data = await courseGateway.getCourseDetail(id);
        if (!data) {
          setError("Khóa học không tồn tại hoặc đã bị gỡ bỏ.");
        } else {
          setCourse(data);
        }
      } catch (err: any) {
        console.error("Failed to load course detail:", err);
        setError("Không thể kết nối với máy chủ để lấy thông tin khóa học.");
      } finally {
        setLoading(false);
      }
    }

    loadCourse();
  }, [id]);

  if (loading) {
    return (
      <div className="w-full bg-[#FAFBFD] min-h-screen py-12 px-4 md:px-8 font-sans flex flex-col items-center justify-center">
        <div className="max-w-4xl mx-auto w-full flex flex-col gap-6 animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/4 mb-4" />
          <div className="h-[250px] bg-slate-200 rounded-[24px] w-full mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 flex flex-col gap-4">
              <div className="h-10 bg-slate-200 rounded w-3/4" />
              <div className="h-6 bg-slate-200 rounded w-1/2" />
              <div className="h-20 bg-slate-200 rounded w-full mt-4" />
            </div>
            <div className="lg:col-span-4 h-[300px] bg-slate-200 rounded-[24px]" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="w-full bg-[#FAFBFD] min-h-screen py-12 px-4 md:px-8 font-sans flex flex-col items-center justify-center">
        <div className="max-w-md mx-auto w-full bg-white rounded-[32px] p-8 border border-slate-100 shadow-[0_12px_35px_rgba(0,0,0,0.015)] text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-black text-[#0F172A] mb-3">Đã xảy ra lỗi</h3>
          <p className="text-slate-500 text-sm font-semibold mb-8 leading-relaxed">
            {error || "Không tìm thấy khóa học yêu cầu."}
          </p>
          <Button
            variant="primary"
            label="Quay lại danh sách khóa học"
            onClick={() => router.push("/courses")}
            className="rounded-full font-black text-sm px-6 py-3 shadow-md shadow-blue-500/10 cursor-pointer w-full"
          />
        </div>
      </div>
    );
  }

  // Dynamic premium gradient based on course category
  let gradientClass = "from-blue-600 via-indigo-600 to-violet-700";
  let tagColorClass = "bg-blue-50 text-blue-600 border-blue-100";
  if (course.category.toLowerCase().includes("design") || course.category.toLowerCase().includes("ui") || course.category.toLowerCase().includes("ux")) {
    gradientClass = "from-purple-600 via-pink-600 to-rose-700";
    tagColorClass = "bg-pink-50 text-pink-600 border-pink-100";
  } else if (course.category.toLowerCase().includes("trí tuệ") || course.category.toLowerCase().includes("ai")) {
    gradientClass = "from-violet-600 via-purple-600 to-indigo-700";
    tagColorClass = "bg-violet-50 text-violet-600 border-violet-100";
  }

  const breadcrumbItems = [
    { label: "Trang chủ", href: "/" },
    { label: "Khóa học", href: "/courses" },
    { label: course.title },
  ];

  // Syllabus mock data
  const mockSyllabus = [
    { title: "Phần 1: Giới thiệu & Thiết lập môi trường", lectures: ["Bài 1: Tổng quan chương trình học và lộ trình", "Bài 2: Chuẩn bị công cụ và cài đặt môi trường phát triển", "Bài 3: Hello World đầu tiên và hiểu cơ chế hoạt động"] },
    { title: "Phần 2: Nền tảng chuyên sâu kiến thức cốt lõi", lectures: ["Bài 4: Các khái niệm cơ bản quan trọng cần nắm vững", "Bài 5: Quản lý vòng đời và luồng xử lý dữ liệu", "Bài 6: Thực hành xây dựng giao diện / API cơ sở"] },
    { title: "Phần 3: Tích hợp Hệ thống & Cơ sở dữ liệu", lectures: ["Bài 7: Thiết kế cơ sở dữ liệu và tích hợp ORM", "Bài 8: Xử lý bảo mật, xác thực người dùng (Auth)", "Bài 9: Xử lý lỗi nâng cao và tối ưu truy vấn"] },
    { title: "Phần 4: Triển khai & Tối ưu hóa dự án", lectures: ["Bài 10: Tối ưu hóa hiệu năng và nén tài nguyên", "Bài 11: Dockerize ứng dụng và chuẩn bị môi trường production", "Bài 12: Đưa ứng dụng lên Cloud (Deploy VPS, CI/CD)"] },
  ];

  return (
    <div className="w-full bg-[#FAFBFD] min-h-screen py-8 px-4 md:px-8 font-sans overflow-x-hidden">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        
        {/* Breadcrumb & Quay lại */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Breadcrumb items={breadcrumbItems} />
          <Link href="/courses" className="inline-flex items-center gap-2 text-xs font-black text-[#2563eb] hover:text-[#1d4ed8] transition-colors cursor-pointer select-none">
            <LuArrowLeft size={16} strokeWidth={2.5} />
            <span>DANH SÁCH KHÓA HỌC</span>
          </Link>
        </div>

        {/* 1. Header Hero Banner với Gradient */}
        <div className={`relative w-full rounded-[32px] bg-gradient-to-r ${gradientClass} text-white p-8 md:p-12 shadow-2xl overflow-hidden`}>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3" />
          <div className="relative z-10 max-w-4xl flex flex-col gap-4">
            
            {/* Category Tag */}
            <span className="self-start px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-extrabold tracking-wider uppercase">
              {course.category} • ACADEMY
            </span>

            <h1 className="text-3xl md:text-4xl lg:text-[46px] font-black tracking-tight leading-tight font-[Montserrat] mt-2 text-white">
              {course.title}
            </h1>

            <p className="text-white/85 text-sm md:text-base font-semibold max-w-3xl leading-relaxed mt-2">
              Khám phá chương trình đào tạo chuyên sâu được xây dựng bởi các chuyên gia thực chiến hàng đầu. Tự học dễ dàng, bài bản và hiệu quả cùng Mentor giàu kinh nghiệm giúp bạn nhanh chóng làm chủ công nghệ thực tế.
            </p>

            <div className="flex flex-wrap items-center gap-6 mt-6 text-xs font-bold text-white/90">
              <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
                <LuClock size={16} />
                <span>8 tuần (tổng {course.price === 0 ? "12" : "32"} bài giảng)</span>
              </span>
              <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
                <LuBookOpen size={16} />
                <span>Thời lượng: 6 - 10 giờ học thực chiến</span>
              </span>
              <span className="flex items-center gap-2 bg-amber-400 text-[#0F172A] px-4 py-2 rounded-xl">
                <LuStar size={14} className="fill-current text-[#0F172A]" />
                <span>4.9/5.0 Đánh giá tốt</span>
              </span>
            </div>

          </div>
        </div>

        {/* 2. Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
          
          {/* Left Column: Course Detail Info & Tabs */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* What you'll learn */}
            <div className="bg-white border border-[#E2E8F0] p-8 rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.015)]">
              <h2 className="text-xl font-black text-[#0F172A] mb-6 tracking-tight flex items-center gap-2 font-[Montserrat]">
                <LuGraduationCap size={22} className="text-[#2563eb]" />
                <span>Nội dung bạn sẽ gặt hái được</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Hiểu sâu sắc các kiến thức cốt lõi và tư duy thiết kế hệ thống.",
                  "Thực hành xây dựng thành công dự án thực tế làm portfolio cực xịn.",
                  "Nắm vững các phương pháp tối ưu hóa hiệu năng ứng dụng chuẩn doanh nghiệp.",
                  "Làm chủ cách vận hành và triển khai dự án lên các nền tảng đám mây.",
                  "Nhận sự cố vấn trực tiếp từ các chuyên gia hàng đầu trong ngành.",
                  "Gia nhập cộng đồng Học Tự Thiện, kết nối và học hỏi không giới hạn."
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <LuCheck size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-xs font-semibold text-[#475569] leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Syllabus */}
            <div className="bg-white border border-[#E2E8F0] p-8 rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.015)]">
              <h2 className="text-xl font-black text-[#0F172A] mb-6 tracking-tight flex items-center gap-2 font-[Montserrat]">
                <LuBookOpen size={22} className="text-[#2563eb]" />
                <span>Chi tiết chương trình đào tạo</span>
              </h2>
              
              <div className="flex flex-col gap-4">
                {mockSyllabus.map((section, idx) => (
                  <div key={idx} className="border border-slate-100 rounded-2xl overflow-hidden">
                    <div className="bg-slate-50/70 p-4 border-b border-slate-100 flex justify-between items-center">
                      <span className="text-sm font-black text-[#0F172A]">{section.title}</span>
                      <span className="text-[11px] font-extrabold text-[#2563eb] bg-blue-50 px-2.5 py-1 rounded-md">
                        {section.lectures.length} bài học
                      </span>
                    </div>
                    <div className="p-4 bg-white flex flex-col gap-3">
                      {section.lectures.map((lecture, lIdx) => (
                        <div key={lIdx} className="flex items-center justify-between text-xs font-semibold text-[#475569]">
                          <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                            {lecture}
                          </span>
                          <span className="text-slate-400 text-[10px]">Đang cập nhật</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements / Prerequisites */}
            <div className="bg-white border border-[#E2E8F0] p-8 rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.015)]">
              <h2 className="text-xl font-black text-[#0F172A] mb-4 tracking-tight flex items-center gap-2 font-[Montserrat]">
                <LuAward size={22} className="text-[#2563eb]" />
                <span>Yêu cầu tiên quyết</span>
              </h2>
              <ul className="list-disc pl-5 flex flex-col gap-2.5 text-xs font-semibold text-[#475569] leading-relaxed">
                <li>Phù hợp với các bạn đã có kiến thức nền tảng cơ bản về lập trình nói chung.</li>
                <li>Có máy tính cá nhân kết nối Internet ổn định để thực hành gõ code trực tiếp.</li>
                <li>Đặc biệt cần có tinh thần chủ động, kiên trì tự học và tương tác cùng các Mentor.</li>
              </ul>
            </div>

          </div>

          {/* Right Column: Enrollment Card & Mentor Bio */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Sticky Action Card */}
            <div className="bg-white border border-[#E2E8F0] p-6 rounded-[28px] shadow-[0_12px_35px_rgba(0,0,0,0.02)] flex flex-col gap-6 relative overflow-hidden">
              
              {/* Circular light gradient on top right */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#2563eb]/5 rounded-full blur-2xl pointer-events-none" />

              {/* Price Banner */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-[#94A3B8] tracking-widest uppercase">HỌC PHÍ TOÀN KHÓA</span>
                <span className={`text-3xl font-black font-[Montserrat] mt-1 ${course.price === 0 ? "text-[#10B981]" : "text-blue-600"}`}>
                  {course.price === 0 ? "100% MIỄN PHÍ" : `${course.price.toLocaleString("vi-VN")}đ`}
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  {course.price === 0 ? "Chương trình học tập phi lợi nhuận vì cộng đồng" : "Học phí đã hỗ trợ 70% từ quỹ hỗ trợ cộng đồng"}
                </span>
              </div>

              <div className="h-px bg-slate-100 w-full" />

              {/* Course Info Specs */}
              <div className="flex flex-col gap-4 text-xs font-semibold text-[#475569]">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Hình thức học:</span>
                  <span className="font-bold text-[#0F172A]">Online qua Zoom & Platform</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Chứng nhận hoàn thành:</span>
                  <span className="font-bold text-[#0F172A] text-right flex items-center gap-1.5 justify-end">
                    <LuAward size={14} className="text-[#2563eb]" />
                    <span>Cấp chứng nhận Blockchain</span>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Số lượng học viên:</span>
                  <span className="font-bold text-[#0F172A]">250+ đăng ký học tập</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Lịch khai giảng:</span>
                  <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">Mở lớp liên tục</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 mt-2">
                <Button
                  variant="primary"
                  label="Đăng ký học ngay"
                  onClick={() => alert("Đăng ký thành công! Hãy chờ email hướng dẫn học tập tiếp theo nhé.")}
                  className="w-full rounded-2xl font-black py-4 shadow-lg shadow-blue-500/10 cursor-pointer text-center text-sm"
                />
                
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setIsBookmarked(!isBookmarked)}
                    className={`flex items-center justify-center gap-2 border rounded-xl py-3 text-xs font-bold transition-all cursor-pointer ${
                      isBookmarked 
                        ? "bg-amber-50 border-amber-300 text-amber-600" 
                        : "bg-white border-[#E2E8F0] text-[#64748b] hover:bg-[#F8FAFC]"
                    }`}
                  >
                    <LuBookmark size={14} className={isBookmarked ? "fill-amber-500" : ""} />
                    <span>{isBookmarked ? "Đã lưu" : "Lưu khóa học"}</span>
                  </button>

                  <button 
                    onClick={() => alert("Đã sao chép liên kết chia sẻ khóa học!")}
                    className="flex items-center justify-center gap-2 bg-white border border-[#E2E8F0] text-[#64748b] hover:bg-[#F8FAFC] rounded-xl py-3 text-xs font-bold transition-all cursor-pointer"
                  >
                    <LuShare2 size={14} />
                    <span>Chia sẻ</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Mentor Info Box */}
            <div className="bg-white border border-[#E2E8F0] p-6 rounded-[28px] shadow-[0_12px_35px_rgba(0,0,0,0.02)] flex flex-col gap-5 relative overflow-hidden">
              <span className="text-[10px] font-black text-[#94A3B8] tracking-widest uppercase">CỐ VẤN CHƯƠNG TRÌNH</span>
              
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-blue-500 to-indigo-600 shadow-md">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80"
                    alt="Mentor avatar"
                    className="w-full h-full object-cover rounded-full border-2 border-white"
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <h4 className="text-base font-black text-[#0F172A] tracking-tight">Mentor Học Tự Thiện</h4>
                  <span className="text-[11px] text-[#2563eb] font-bold">Chuyên gia Lập trình thực chiến</span>
                </div>
              </div>

              <p className="text-xs text-[#64748b] leading-relaxed font-semibold">
                Là chuyên gia có hơn 8 năm làm việc tại các tập đoàn lớn, nhiệt huyết chia sẻ tri thức thực tế để thúc đẩy cộng đồng lập trình viên Việt Nam cống hiến giá trị.
              </p>

              <div className="h-px bg-slate-100 w-full" />

              <div className="flex items-center justify-between text-xs font-bold text-[#475569]">
                <span className="flex items-center gap-1">
                  <LuUsers size={14} className="text-[#2563eb]" />
                  <span>250+ buổi học</span>
                </span>
                <span className="flex items-center gap-1 text-emerald-600">
                  <LuAward size={14} />
                  <span>100% Hỗ trợ học viên</span>
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
