"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Breadcrumb } from "@shared";
import { Button, InlineMessage } from "@/core/ui";
import { courseGateway, courseBookingGateway, mentorGateway } from "@/core/gateway";
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
  LuExternalLink,
  LuCalendar,
  LuX,
  LuMessageSquare
} from "react-icons/lu";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { data: session } = useSession();

  const [course, setCourse] = useState<MockCourse | null>(null);
  const [mentorProfile, setMentorProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Booking UI States
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingDate, setBookingDate] = useState(() => {
    // Ngày mai làm ngày mặc định
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [bookingTime, setBookingTime] = useState("09:00");
  const [notesForMentor, setNotesForMentor] = useState("");
  
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Lấy các khung giờ rảnh thực tế từ database/backend của Mentor cho ngày được chọn
  const getAvailableSlots = (): string[] => {
    if (mentorProfile?.metadata?.time) {
      const dayOfWeek = new Date(bookingDate).toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
      const slots = mentorProfile.metadata.time[dayOfWeek];
      if (slots && Array.isArray(slots) && slots.length > 0) {
        // Ánh xạ sang mốc bắt đầu
        return slots.map((s: string) => s.split("-")[0].trim());
      }
    }
    // Trả về mặc định nếu mentor chưa thiết lập giờ rảnh chi tiết
    return ["09:00", "10:30", "14:00", "15:30", "19:00", "20:30"];
  };

  const availableSlots = getAvailableSlots();

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

          // Tải hồ sơ cố vấn (Mentor Profile) từ backend dựa theo mentorId của khóa học
          if (data.mentorId) {
            try {
              const mProfile = await mentorGateway.getMentorProfileByUserId(data.mentorId);
              setMentorProfile(mProfile);
            } catch (mErr) {
              console.warn("Failed to fetch mentor profile from backend:", mErr);
            }
          }
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

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;

    try {
      setIsSubmittingBooking(true);
      setBookingError(null);

      // Tạo đối tượng Date kết hợp Date và Time
      const meetingTime = new Date(`${bookingDate}T${bookingTime}:00`);

      await courseBookingGateway.bookCourse({
        courseId: course.id,
        meetingTime,
        notesForMentor: notesForMentor || undefined,
      });

      setBookingSuccess(true);
      setTimeout(() => {
        setIsBookingModalOpen(false);
        setBookingSuccess(false);
        setNotesForMentor("");
      }, 3500);
    } catch (err: any) {
      console.error("Failed to book course:", err);
      const errMsg = err?.message || err?.error?.message || "Đăng ký khóa học thất bại. Vui lòng thử lại sau.";
      setBookingError(errMsg);
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const handleStartBooking = () => {
    if (!session) {
      // Nếu chưa đăng nhập, hướng dẫn chuyển hướng đến trang login
      alert("Vui lòng đăng nhập tài khoản Học viên để thực hiện đăng ký khóa học.");
      router.push(`/login?callbackUrl=/courses/detail/${id}`);
      return;
    }
    
    if (session.user?.role !== "mentee") {
      alert("Tài khoản của bạn không phải là Học viên (Mentee). Chỉ học viên mới được quyền đăng ký học khóa học.");
      return;
    }

    setIsBookingModalOpen(true);
  };

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
  if (course.category.toLowerCase().includes("design") || course.category.toLowerCase().includes("ui") || course.category.toLowerCase().includes("ux")) {
    gradientClass = "from-purple-600 via-pink-600 to-rose-700";
  } else if (course.category.toLowerCase().includes("trí tuệ") || course.category.toLowerCase().includes("ai")) {
    gradientClass = "from-violet-600 via-purple-600 to-indigo-700";
  }

  const breadcrumbItems = [
    { label: "Trang chủ", href: "/" },
    { label: "Khóa học", href: "/courses" },
    { label: course.title },
  ];

  // Generate dynamic, adaptive syllabus based on live DB fields
  const getDynamicSyllabus = () => {
    const lectureCount = course?.metadata?.lectureCount || (course?.price === 0 ? 12 : 32);
    const lecturesPerSection = Math.ceil(lectureCount / 4);
    
    const shortCategory = course?.category || "Chuyên môn";
    const shortTitle = course?.title 
      ? (course.title.includes("&") 
          ? course.title.split("&")[0].trim() 
          : (course.title.includes("và") ? course.title.split("và")[0].trim() : course.title)) 
      : "Cơ bản";
    
    return [
      {
        title: `Phần 1: Giới thiệu & Thiết lập Môi trường ${shortCategory}`,
        lectures: Array.from({ length: Math.min(lecturesPerSection, 12) }, (_, i) => `Bài ${i + 1}: Tổng quan chương trình học, chuẩn bị công cụ và thiết lập ban đầu`)
      },
      {
        title: `Phần 2: Kiến thức Nền tảng Cốt lõi của ${shortTitle}`,
        lectures: Array.from({ length: Math.min(lecturesPerSection, 12) }, (_, i) => `Bài ${lecturesPerSection + i + 1}: Các khái niệm quan trọng cần nắm vững, xây dựng giao diện / luồng xử lý cơ bản`)
      },
      {
        title: `Phần 3: Tích hợp Hệ thống, Xử lý Bảo mật & Database`,
        lectures: Array.from({ length: Math.min(lecturesPerSection, 12) }, (_, i) => `Bài ${lecturesPerSection * 2 + i + 1}: Thiết kế cơ sở dữ liệu, kết nối API, xử lý Authentication & Authorization`)
      },
      {
        title: `Phần 4: Tối ưu hóa Hiệu năng & Triển khai Docker, Cloud`,
        lectures: Array.from({ length: Math.min(lecturesPerSection, 12) }, (_, i) => `Bài ${lecturesPerSection * 3 + i + 1}: Dockerize ứng dụng, tối ưu hóa câu lệnh query, nén tài nguyên và deploy VPS`)
      }
    ].filter(section => section.lectures.length > 0);
  };

  const syllabus = getDynamicSyllabus();

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
              {course.description || "Khám phá chương trình đào tạo chuyên sâu được xây dựng bởi các chuyên gia thực chiến hàng đầu. Tự học dễ dàng, bài bản và hiệu quả cùng Mentor giàu kinh nghiệm giúp bạn nhanh chóng làm chủ công nghệ thực tế."}
            </p>

            <div className="flex flex-wrap items-center gap-6 mt-6 text-xs font-bold text-white/90">
              <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
                <LuClock size={16} />
                <span>{course.metadata?.durationWeeks || 8} tuần (tổng {course.metadata?.lectureCount || (course.price === 0 ? 12 : 32)} bài giảng)</span>
              </span>
              <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
                <LuBookOpen size={16} />
                <span>Thời lượng: {Math.round((course.durationMinutes || 60) / 60)} giờ học thực chiến</span>
              </span>
              <span className="flex items-center gap-2 bg-amber-400 text-[#0F172A] px-4 py-2 rounded-xl">
                <LuStar size={14} className="fill-current text-[#0F172A]" />
                <span>{course.rating > 0 ? course.rating.toFixed(1) : "4.9"}/5.0 Đánh giá tốt</span>
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
                {syllabus.map((section, idx) => (
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
                {course.prerequisites && course.prerequisites.length > 0 ? (
                  course.prerequisites.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))
                ) : (
                  <>
                    <li>Phù hợp với các bạn đã có kiến thức nền tảng cơ bản về lập trình nói chung.</li>
                    <li>Có máy tính cá nhân kết nối Internet ổn định để thực hành gõ code trực tiếp.</li>
                    <li>Đặc biệt cần có tinh thần chủ động, kiên trì tự học và tương tác cùng các Mentor.</li>
                  </>
                )}
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
                  onClick={handleStartBooking}
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
                    src={mentorProfile?.user?.avatarUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80"}
                    alt="Mentor avatar"
                    className="w-full h-full object-cover rounded-full border-2 border-white"
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <h4 className="text-base font-black text-[#0F172A] tracking-tight">
                    {mentorProfile?.user?.name || "Mentor Học Tự Thiện"}
                  </h4>
                  <span className="text-[11px] text-[#2563eb] font-bold">
                    {mentorProfile?.jobTitle || "Chuyên gia Lập trình thực chiến"} {mentorProfile?.company ? `tại ${mentorProfile.company}` : ""}
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#64748b] leading-relaxed font-semibold">
                {mentorProfile?.bio || "Chào mọi người, mình là mentor của Học Tự Thiện. Rất vui được đồng hành cùng các bạn chia sẻ tri thức cộng đồng."}
              </p>

              {mentorProfile?.skills && mentorProfile.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {mentorProfile.skills.map((skill: string, sIdx: number) => (
                    <span key={sIdx} className="text-[10px] bg-slate-50 text-slate-500 font-extrabold px-2 py-0.5 rounded-md border border-slate-100">
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              <div className="h-px bg-slate-100 w-full" />

              <div className="flex items-center justify-between text-xs font-bold text-[#475569]">
                <span className="flex items-center gap-1">
                  <LuUsers size={14} className="text-[#2563eb]" />
                  <span>{mentorProfile?.totalStudents || 250}+ học viên</span>
                </span>
                <span className="flex items-center gap-1 text-emerald-600">
                  <LuAward size={14} />
                  <span>{mentorProfile?.yearsOfExperience || 8} năm kinh nghiệm</span>
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* 3. Stunning, Ultra-Premium Booking Modal Overlay */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-2xl max-w-lg w-full p-8 relative flex flex-col gap-6 animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
            
            {/* Close Button */}
            <button 
              onClick={() => setIsBookingModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-[#64748b] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-full transition-colors cursor-pointer select-none"
            >
              <LuX size={18} strokeWidth={2.5} />
            </button>

            {/* Modal Success Overlay */}
            {bookingSuccess ? (
              <div className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-6 shadow-inner animate-bounce">
                  <LuCheck size={40} strokeWidth={3.5} />
                </div>
                <h3 className="text-2xl font-black text-[#0F172A] mb-3 font-[Montserrat]">
                  Đăng ký thành công!
                </h3>
                <p className="text-[#475569] text-sm font-semibold max-w-sm leading-relaxed mb-4">
                  Buổi học của bạn đã được hệ thống tự động xác nhận (`confirmed`).
                </p>
                <div className="bg-emerald-50/70 border border-emerald-100 p-4 rounded-2xl w-full text-xs font-semibold text-emerald-700 flex flex-col gap-1.5 items-start mt-2">
                  <span>📅 <strong>Thời gian:</strong> {bookingDate} lúc {bookingTime}</span>
                  <span>🔗 <strong>Phòng học:</strong> Link Google Meet sẽ được gửi qua email của bạn trước giờ học.</span>
                </div>
                <p className="text-[11px] text-[#94A3B8] font-bold mt-8">
                  Cửa sổ này sẽ tự động đóng lại...
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="flex flex-col gap-6">
                
                {/* Modal Header */}
                <div className="flex flex-col gap-1.5 pr-8">
                  <span className="text-[#2563eb] text-[10px] font-black uppercase tracking-[0.25em]">Đặt lịch học tập</span>
                  <h3 className="text-2xl font-black text-[#0F172A] tracking-tight font-[Montserrat] leading-snug">
                    Đăng Ký Khóa Học
                  </h3>
                  <p className="text-slate-400 text-xs font-semibold">
                    Vui lòng chọn thời gian rảnh của bạn để bắt đầu học tập cùng Mentor.
                  </p>
                </div>

                <div className="h-px bg-slate-100 w-full" />

                {/* Error Banner */}
                {bookingError && (
                  <div className="bg-red-50 border border-red-200/80 rounded-2xl p-4 flex items-start gap-3 text-red-700 animate-in slide-in-from-top-4 duration-300">
                    <svg className="w-[18px] h-[18px] flex-shrink-0 mt-0.5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                      <line x1="12" y1="9" x2="12" y2="13"></line>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                    <div className="flex flex-col gap-0.5 text-xs font-bold">
                      <span className="uppercase text-[9px] tracking-wider text-red-800">Không thể đăng ký</span>
                      <p className="font-semibold text-red-600 mt-0.5 leading-relaxed">{bookingError}</p>
                    </div>
                  </div>
                )}

                {/* Form Fields */}
                <div className="flex flex-col gap-5">
                  
                  {/* Select Date */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black text-[#475569] uppercase tracking-wider flex items-center gap-1.5">
                      <LuCalendar size={14} className="text-[#2563eb]" />
                      <span>Chọn Ngày Học:</span>
                    </label>
                    <input 
                      type="date"
                      required
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      min={new Date(Date.now() + 86400000).toISOString().split("T")[0]} // Tối thiểu ngày mai
                      className="w-full border border-[#E2E8F0] rounded-2xl px-4 py-3.5 outline-none focus:border-[#2563eb] focus:ring-4 focus:ring-blue-50 text-sm font-semibold transition-all"
                    />
                  </div>

                  {/* Select Time Slot */}
                  <div className="flex flex-col gap-2.5">
                    <label className="text-xs font-black text-[#475569] uppercase tracking-wider">
                      Chọn Khung Giờ Bắt Đầu:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots.map((time) => {
                        const isActive = bookingTime === time;
                        return (
                          <button
                            type="button"
                            key={time}
                            onClick={() => setBookingTime(time)}
                            className={`py-3 rounded-xl text-xs font-bold transition-all border cursor-pointer select-none ${
                              isActive 
                                ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/10" 
                                : "bg-white border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC]"
                            }`}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Notes for Mentor */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black text-[#475569] uppercase tracking-wider flex items-center gap-1.5">
                      <LuMessageSquare size={14} className="text-[#2563eb]" />
                      <span>Nhắn gửi tới Mentor (Tùy chọn):</span>
                    </label>
                    <textarea 
                      placeholder="Mô tả mục tiêu của bạn khi học khóa học này, kiến thức hiện tại, hoặc các câu hỏi mong muốn thảo luận cùng Mentor nhé..."
                      value={notesForMentor}
                      onChange={(e) => setNotesForMentor(e.target.value)}
                      rows={3}
                      className="w-full border border-[#E2E8F0] rounded-2xl px-4 py-3 outline-none focus:border-[#2563eb] focus:ring-4 focus:ring-blue-50 text-xs font-semibold leading-relaxed transition-all resize-none"
                    />
                  </div>

                </div>

                <div className="h-px bg-slate-100 w-full mt-2" />

                {/* Footer Actions */}
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setIsBookingModalOpen(false)}
                    className="flex-1 py-3.5 border border-[#E2E8F0] text-[#64748b] hover:bg-[#F8FAFC] font-extrabold text-xs rounded-2xl uppercase tracking-wider transition-colors cursor-pointer text-center"
                  >
                    Hủy bỏ
                  </button>
                  
                  <button
                    type="submit"
                    disabled={isSubmittingBooking}
                    className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-extrabold text-xs rounded-2xl uppercase tracking-wider transition-all cursor-pointer text-center shadow-lg shadow-blue-500/10 active:scale-95 disabled:scale-100"
                  >
                    {isSubmittingBooking ? "Đang xử lý..." : "Xác nhận đăng ký"}
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
