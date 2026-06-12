"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Breadcrumb } from "@shared";
import { Button } from "@/core/ui";
import { courseGateway, courseBookingGateway, mentorApplicationsGateway, mentorGateway, paymentGateway } from "@/core/gateway";
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
  LuMessageSquare,
  LuCopy,
  LuRefreshCw,
  LuInfo
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

  const syllabusModules = course?.metadata?.modules || [];
  const totalLessons = syllabusModules.reduce((acc: number, mod: any) => acc + (mod.lessons?.length || 0), 0);

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
              {course.description || "Khóa học chưa có mô tả chi tiết."}
            </p>

            <div className="flex flex-wrap items-center gap-6 mt-6 text-xs font-bold text-white/90">
              <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
                <LuBookOpen size={16} />
                <span>{totalLessons} bài học</span>
              </span>
              <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
                <LuClock size={16} />
                <span>Thời lượng mỗi buổi: {course.durationMinutes} phút</span>
              </span>
              {course.metadata?.totalHours && (
                <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
                  <LuClock size={16} />
                  <span>Tổng thời lượng: {course.metadata.totalHours} giờ học</span>
                </span>
              )}
            </div>

          </div>
        </div>

        {/* 2. Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">

          {/* Left Column: Course Detail Info & Tabs */}
          <div className="lg:col-span-8 flex flex-col gap-8">

            {/* Giới thiệu khóa học */}
            <div className="bg-white border border-[#E2E8F0] p-8 rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.015)]">
              <h2 className="text-xl font-black text-[#0F172A] mb-4 tracking-tight flex items-center gap-2 font-[Montserrat]">
                <LuGraduationCap size={22} className="text-[#2563eb]" />
                <span>Giới thiệu khóa học</span>
              </h2>
              <p className="text-xs text-[#475569] font-semibold leading-relaxed whitespace-pre-line">
                {course.description || "Khóa học chưa có mô tả chi tiết từ Cố vấn."}
              </p>
            </div>

            {/* Course Syllabus */}
            <div className="bg-white border border-[#E2E8F0] p-8 rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.015)]">
              <h2 className="text-xl font-black text-[#0F172A] mb-6 tracking-tight flex items-center gap-2 font-[Montserrat]">
                <LuBookOpen size={22} className="text-[#2563eb]" />
                <span>Chi tiết chương trình đào tạo</span>
              </h2>

              <div className="flex flex-col gap-4">
                {syllabusModules.length > 0 ? (
                  syllabusModules.map((section: any, idx: number) => (
                    <div key={idx} className="border border-slate-100 rounded-2xl overflow-hidden">
                      <div className="bg-slate-50/70 p-4 border-b border-slate-100 flex justify-between items-center">
                        <span className="text-sm font-black text-[#0F172A]">{section.title}</span>
                        <span className="text-[11px] font-extrabold text-[#2563eb] bg-blue-50 px-2.5 py-1 rounded-md">
                          {section.lessons?.length || 0} bài học
                        </span>
                      </div>
                      <div className="p-4 bg-white flex flex-col gap-3">
                        {section.lessons?.map((lecture: any, lIdx: number) => (
                          <div key={lIdx} className="flex items-center justify-between text-xs font-semibold text-[#475569]">
                            <span className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                              {lecture.title}
                            </span>
                            <span className="text-slate-400 text-[10px]">{lecture.duration || "Đang cập nhật"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 font-semibold italic">
                    Cố vấn chưa cập nhật chi tiết chương trình đào tạo cho khóa học này.
                  </p>
                )}
              </div>
            </div>

            {/* Requirements / Prerequisites */}
            <div className="bg-white border border-[#E2E8F0] p-8 rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.015)]">
              <h2 className="text-xl font-black text-[#0F172A] mb-4 tracking-tight flex items-center gap-2 font-[Montserrat]">
                <LuAward size={22} className="text-[#2563eb]" />
                <span>Yêu cầu tiên quyết</span>
              </h2>
              {course.prerequisites && course.prerequisites.length > 0 ? (
                <ul className="list-disc pl-5 flex flex-col gap-2.5 text-xs font-semibold text-[#475569] leading-relaxed">
                  {course.prerequisites.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400 font-semibold italic">
                  Khóa học này không yêu cầu đặc biệt về kiến thức tiên quyết.
                </p>
              )}
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
                  {course.price === 0 ? "Chương trình học tập phi lợi nhuận vì cộng đồng" : "Học phí trọn khóa học"}
                </span>
              </div>

              <div className="h-px bg-slate-100 w-full" />

              {/* Course Info Specs */}
              <div className="flex flex-col gap-4 text-xs font-semibold text-[#475569]">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Hình thức học:</span>
                  <span className="font-bold text-[#0F172A]">
                    {course.metadata?.format === 'online'
                      ? 'Online'
                      : course.metadata?.format === 'offline'
                      ? 'Offline'
                      : course.metadata?.format === 'hybrid'
                      ? 'Hybrid (Kết hợp)'
                      : course.metadata?.format || 'Chưa cập nhật'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Cấp độ đào tạo:</span>
                  <span className="font-bold text-[#0F172A]">
                    {course.metadata?.level === 'beginner'
                      ? 'Cơ bản (Beginner)'
                      : course.metadata?.level === 'intermediate'
                      ? 'Trung cấp (Intermediate)'
                      : course.metadata?.level === 'advanced'
                      ? 'Nâng cao (Advanced)'
                      : course.metadata?.level || 'Chưa cập nhật'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Thời lượng mỗi buổi:</span>
                  <span className="font-bold text-[#0F172A]">{course.durationMinutes} phút</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Tổng thời lượng:</span>
                  <span className="font-bold text-[#0F172A]">
                    {course.metadata?.totalHours ? `${course.metadata.totalHours} giờ` : 'Chưa cập nhật'}
                  </span>
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
                    className={`flex items-center justify-center gap-2 border rounded-xl py-3 text-xs font-bold transition-all cursor-pointer ${isBookmarked
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
                    {mentorProfile?.user?.name || "Cố vấn"}
                  </h4>
                  <span className="text-[11px] text-[#2563eb] font-bold">
                    {mentorProfile?.jobTitle ? `${mentorProfile.jobTitle}${mentorProfile.company ? ` tại ${mentorProfile.company}` : ""}` : "Cố vấn Học Tự Thiện"}
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#64748b] leading-relaxed font-semibold">
                {mentorProfile?.bio || "Chưa cập nhật giới thiệu."}
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
                  <span>{mentorProfile?.totalStudents || 0} học viên</span>
                </span>
                <span className="flex items-center gap-1 text-emerald-600">
                  <LuAward size={14} />
                  <span>
                    {mentorProfile?.yearsOfExperience !== undefined && mentorProfile?.yearsOfExperience !== null
                      ? `${mentorProfile.yearsOfExperience} năm kinh nghiệm`
                      : "Kinh nghiệm: Chưa cập nhật"}
                  </span>
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* 3. Stunning, Ultra-Premium Booking Modal Overlay */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        course={course}
      />

    </div>
  );
}

// Extracted BookingModal sub-component for high-performance rendering (prevents full page re-renders)
interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: MockCourse;
}

function BookingModal({ isOpen, onClose, course }: BookingModalProps) {
  const router = useRouter();

  // All booking and payment states
  const [bookingDate, setBookingDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const dd = String(tomorrow.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });
  const [bookingTime, setBookingTime] = useState("09:00");
  const [notesForMentor, setNotesForMentor] = useState("");

  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const [paymentStep, setPaymentStep] = useState<'form' | 'payment_pending' | 'success'>('form');
  const [qrData, setQrData] = useState<any | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [expired, setExpired] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'success' | 'manual_retry' | 'processing' | 'error'>('idle');
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // References cho timers
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const cooldownRef = useRef<NodeJS.Timeout | null>(null);
  const autoRetryRef = useRef<NodeJS.Timeout | null>(null);

  // Reset states when modal is opened/closed
  useEffect(() => {
    if (!isOpen) {
      setPaymentStep('form');
      setQrData(null);
      setBookingError(null);
      setNotesForMentor("");
      setVerifyStatus('idle');
      setVerifyMessage(null);
      setCooldown(0);
      if (timerRef.current) clearInterval(timerRef.current);
      if (cooldownRef.current) clearInterval(cooldownRef.current);
      if (autoRetryRef.current) clearTimeout(autoRetryRef.current);
    }
  }, [isOpen]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (cooldownRef.current) clearInterval(cooldownRef.current);
      if (autoRetryRef.current) clearTimeout(autoRetryRef.current);
    };
  }, []);

  // Đếm ngược thời gian hết hạn mã QR
  useEffect(() => {
    if (!qrData) return;

    const expTime = new Date(qrData.expiredAt || '').getTime();
    const left = Math.max(0, Math.floor((expTime - Date.now()) / 1000));
    setTimeLeft(left);

    if (left <= 0) {
      setExpired(true);
      return;
    }

    setExpired(false);

    timerRef.current = setInterval(() => {
      const currentLeft = Math.max(0, Math.floor((expTime - Date.now()) / 1000));
      setTimeLeft(currentLeft);

      if (currentLeft <= 0) {
        setExpired(true);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [qrData]);

  // Đếm ngược cooldown bấm nút check giao dịch
  useEffect(() => {
    if (cooldown <= 0) return;

    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, [cooldown]);

  // Tự động tìm ngày gần nhất có lịch dạy của cố vấn
  useEffect(() => {
    if (isOpen && course?.metadata?.time) {
      let foundDateStr = "";
      for (let i = 1; i <= 14; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        const dayOfWeek = d.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
        const slots = course.metadata.time[dayOfWeek];
        if (slots && Array.isArray(slots) && slots.length > 0) {
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, "0");
          const dd = String(d.getDate()).padStart(2, "0");
          foundDateStr = `${yyyy}-${mm}-${dd}`;
          break;
        }
      }
      if (foundDateStr) {
        setBookingDate(foundDateStr);
      }
    }
  }, [isOpen, course]);

  // Lấy các khung giờ rảnh thực tế từ database/backend của Khóa học cho ngày được chọn
  const getAvailableSlots = (): string[] => {
    if (course?.metadata?.time) {
      const [year, month, day] = bookingDate.split("-").map(Number);
      const localDate = new Date(year, month - 1, day);
      const dayOfWeek = localDate.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
      const slots = course.metadata.time[dayOfWeek];
      if (slots && Array.isArray(slots) && slots.length > 0) {
        // Ánh xạ sang mốc bắt đầu
        return slots.map((s: string) => s.split("-")[0].trim());
      }
    }
    return [];
  };

  const getSelectedDayLabel = (): string => {
    const [year, month, day] = bookingDate.split("-").map(Number);
    const localDate = new Date(year, month - 1, day);
    const dayName = localDate.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
    const mapping: Record<string, string> = {
      monday: "Thứ Hai",
      tuesday: "Thứ Ba",
      wednesday: "Thứ Tư",
      thursday: "Thứ Năm",
      friday: "Thứ Sáu",
      saturday: "Thứ Bảy",
      sunday: "Chủ Nhật"
    };
    return mapping[dayName] || "";
  };

  const availableSlots = getAvailableSlots();

  // Tự động đồng bộ hóa khung giờ khi chuyển ngày học
  useEffect(() => {
    if (availableSlots.length > 0) {
      setBookingTime(availableSlots[0]);
    } else {
      setBookingTime("");
    }
  }, [bookingDate, course]);

  // Làm mới mã QR nếu hết hạn
  const handleRegenerateQr = async () => {
    if (!qrData || !course) return;
    try {
      setExpired(false);
      setVerifyStatus('idle');
      setVerifyMessage(null);
      const freshQr = await paymentGateway.generateGenericQr('course_booking', qrData.referenceId || qrData.paymentId);
      setQrData({ ...freshQr, referenceId: qrData.referenceId });
    } catch (err: any) {
      console.error("Failed to regenerate QR:", err);
      alert("Không thể làm mới mã QR. Vui lòng thử lại.");
    }
  };

  // Sao chép nội dung chuyển khoản
  const handleCopyCode = async () => {
    if (!qrData) return;
    try {
      await navigator.clipboard.writeText(qrData.transactionCode || '');
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  // Gọi cổng thanh toán xác minh giao dịch
  const handleVerify = async () => {
    if (!qrData || verifying || cooldown > 0) return;

    try {
      setVerifying(true);
      setVerifyMessage(null);

      const result = await paymentGateway.verifyGenericPayment(qrData.paymentId);

      if (result.activated) {
        setVerifyStatus('success');
        setVerifyMessage(result.message || 'Thanh toán khóa học thành công!');
        setPaymentStep('success');

        // Đóng modal sau khi thành công
        setTimeout(() => {
          onClose();
        }, 3500);
      } else {
        const msg = (result.message || '').toLowerCase();
        if (msg.includes('đang xử lý') || msg.includes('cron')) {
          setVerifyStatus('processing');
          setVerifyMessage(result.message || null);
          setCooldown(3);

          autoRetryRef.current = setTimeout(() => {
            handleVerify();
          }, 3000);
        } else {
          setVerifyStatus('manual_retry');
          setVerifyMessage(result.message || 'Chưa tìm thấy giao dịch chuyển khoản phù hợp.');
          setCooldown(5);
        }
      }
    } catch (err: any) {
      console.error('Verify error:', err);
      if (err.status === 422) {
        setVerifyStatus('error');
        setVerifyMessage('Mã QR đã hết hạn. Đang tự động làm mới...');
        setTimeout(() => handleRegenerateQr(), 2000);
      } else {
        setVerifyStatus('error');
        setVerifyMessage(err.message || 'Đã có lỗi xảy ra trong quá trình xác minh.');
        setCooldown(5);
      }
    } finally {
      setVerifying(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;

    try {
      setIsSubmittingBooking(true);
      setBookingError(null);

      // Tạo đối tượng Date kết hợp Date và Time, mặc định theo múi giờ Việt Nam (+07:00)
      const meetingTime = new Date(`${bookingDate}T${bookingTime}:00+07:00`);

      const bookingRes = await courseBookingGateway.bookCourse({
        courseId: course.id,
        meetingTime,
        notesForMentor: notesForMentor || undefined,
      });

      // Trích xuất booking record từ phản hồi
      const booking = bookingRes.data?.[0] || bookingRes;
      if (!booking || !booking.id) {
        throw new Error("Không thể khởi tạo đăng ký khóa học.");
      }

      // Tạo mã QR thanh toán chung cho course_booking
      const qr = await paymentGateway.generateGenericQr('course_booking', booking.id);
      setQrData({ ...qr, referenceId: booking.id });
      setPaymentStep('payment_pending');
      setVerifyStatus('idle');
      setVerifyMessage(null);
    } catch (err: any) {
      console.error("Failed to book course:", err);
      const errMsg = err?.message || err?.error?.message || "Đăng ký khóa học thất bại. Vui lòng thử lại sau.";
      setBookingError(errMsg);
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-2xl max-w-lg w-full p-8 relative flex flex-col gap-6 animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-[#64748b] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-full transition-colors cursor-pointer select-none"
        >
          <LuX size={18} strokeWidth={2.5} />
        </button>

        {/* Step 1: Form Đăng ký */}
        {paymentStep === 'form' && (
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
                {availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map((time) => {
                      const isActive = bookingTime === time;
                      return (
                        <button
                          type="button"
                          key={time}
                          onClick={() => setBookingTime(time)}
                          className={`py-3 rounded-xl text-xs font-bold transition-all border cursor-pointer select-none ${isActive
                            ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/10"
                            : "bg-white border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC]"
                            }`}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-xs text-amber-600 bg-amber-50 border border-amber-100 p-4 rounded-2xl font-bold leading-relaxed">
                    ⚠️ Cố vấn không cấu hình lịch giảng dạy vào ngày {getSelectedDayLabel()}. Vui lòng chọn một ngày khác trong tuần.
                  </div>
                )}
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
                onClick={onClose}
                className="flex-1 py-3.5 border border-[#E2E8F0] text-[#64748b] hover:bg-[#F8FAFC] font-extrabold text-xs rounded-2xl uppercase tracking-wider transition-colors cursor-pointer text-center"
              >
                Hủy bỏ
              </button>

              <button
                type="submit"
                disabled={isSubmittingBooking || availableSlots.length === 0}
                className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold text-xs rounded-2xl uppercase tracking-wider transition-all cursor-pointer text-center shadow-lg shadow-blue-500/10 active:scale-95 disabled:scale-100"
              >
                {isSubmittingBooking ? "Đang xử lý..." : "Xác nhận đăng ký"}
              </button>
            </div>

          </form>
        )}

        {/* Step 2: Cổng Thanh toán QR */}
        {paymentStep === 'payment_pending' && (
          <div className="flex flex-col gap-5">
            {/* Header */}
            <div className="flex flex-col gap-1.5 text-center">
              <span className="text-[#2563eb] text-[10px] font-black uppercase tracking-[0.25em]">Thanh Toán Khóa Học</span>
              <h3 className="text-xl font-black text-[#0F172A] tracking-tight font-[Montserrat]">
                Quét Mã QR Để Đăng Ký Học
              </h3>
              <p className="text-slate-500 text-xs font-semibold">
                Vui lòng quét QR bên dưới bằng ứng dụng Ngân hàng để thanh toán khóa học.
              </p>
            </div>

            <div className="h-px bg-slate-100 w-full" />

            {/* QR Display Card */}
            <div className="flex flex-col items-center justify-center bg-slate-50 border border-slate-100 p-6 rounded-2xl relative overflow-hidden">
              {expired && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center gap-3">
                  <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center border border-rose-100">
                    <LuClock size={22} />
                  </div>
                  <h4 className="text-sm font-black text-slate-800 font-[Montserrat]">Mã QR Đã Hết Hạn</h4>
                  <p className="text-[11px] text-slate-500 max-w-[200px] leading-relaxed">
                    Mã QR chuyển khoản chỉ có hiệu lực trong 15 phút.
                  </p>
                  <button
                    type="button"
                    onClick={handleRegenerateQr}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-5 py-2.5 rounded-xl uppercase tracking-wider transition-all active:scale-95 cursor-pointer border-0 flex items-center gap-1.5"
                  >
                    <LuRefreshCw size={14} />
                    <span>Tạo mã QR mới</span>
                  </button>
                </div>
              )}

              <div className="w-full aspect-square max-w-[200px] bg-white rounded-xl p-3 flex items-center justify-center border border-slate-100 shadow-sm">
                {qrData?.qrUrl && (
                  <img
                    src={qrData.qrUrl}
                    alt="VietQR Code"
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                )}
              </div>

              {!expired && qrData?.qrUrl && (
                <div className="flex items-center gap-2 mt-4 px-4 py-1.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl">
                  <LuClock size={14} className="animate-pulse" />
                  <span className="text-xs font-black tracking-wider font-[Montserrat]">{formatTime(timeLeft)}</span>
                </div>
              )}
            </div>

            {/* Billing Info Details */}
            <div className="flex flex-col gap-3">
              {/* Amount Row */}
              <div className="flex justify-between items-center bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Số tiền cần chuyển</span>
                <span className="text-lg font-black text-blue-600 font-[Montserrat]">
                  {qrData?.amount?.toLocaleString("vi-VN")}đ
                </span>
              </div>

              {/* Copyable Message */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Nội dung chuyển khoản bắt buộc</span>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-mono text-xs font-black text-slate-700 tracking-wider break-all select-all">
                    {qrData?.transactionCode}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    disabled={expired}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex-shrink-0 flex items-center justify-center ${
                      copySuccess
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                        : 'bg-white border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-[#F0F7FF] hover:border-blue-200'
                    }`}
                  >
                    {copySuccess ? <LuCheck size={16} /> : <LuCopy size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Status Feedback Message */}
            {verifyMessage && (
              <div className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs leading-relaxed font-semibold ${
                verifyStatus === 'processing'
                  ? 'bg-blue-50 border-blue-100 text-blue-700'
                  : verifyStatus === 'manual_retry'
                  ? 'bg-amber-50 border-amber-100 text-amber-700'
                  : verifyStatus === 'error'
                  ? 'bg-rose-50 border-rose-100 text-rose-700'
                  : 'bg-slate-50 border-slate-100 text-slate-700'
              }`}>
                <div className="flex-shrink-0 mt-0.5">
                  {verifyStatus === 'processing' && <LuRefreshCw size={14} className="animate-spin text-blue-600" />}
                  {verifyStatus === 'manual_retry' && <LuInfo size={14} className="text-amber-600" />}
                  {verifyStatus === 'error' && <LuInfo size={14} className="text-rose-600" />}
                  {verifyStatus !== 'processing' && verifyStatus !== 'manual_retry' && verifyStatus !== 'error' && <LuInfo size={14} />}
                </div>
                <div className="flex-1">{verifyMessage}</div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-3 mt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 border border-[#E2E8F0] text-[#64748b] hover:bg-[#F8FAFC] font-extrabold text-xs rounded-xl uppercase tracking-wider transition-colors cursor-pointer text-center"
              >
                Thanh toán sau
              </button>

              <button
                type="button"
                onClick={handleVerify}
                disabled={expired || verifying || cooldown > 0}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white disabled:text-slate-400 font-extrabold text-xs rounded-xl uppercase tracking-wider transition-all cursor-pointer text-center shadow-md shadow-blue-500/10 active:scale-95 disabled:scale-100 flex items-center justify-center gap-1.5"
              >
                {verifying ? (
                  <>
                    <LuRefreshCw size={14} className="animate-spin" />
                    <span>Đang kiểm tra...</span>
                  </>
                ) : verifyStatus === 'processing' ? (
                  <>
                    <LuRefreshCw size={14} className="animate-spin" />
                    <span>Đang kiểm tra ({cooldown}s)...</span>
                  </>
                ) : cooldown > 0 ? (
                  <span>Thử lại sau {cooldown}s</span>
                ) : (
                  <span>Tôi đã chuyển khoản</span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Đăng ký & Thanh toán thành công */}
        {paymentStep === 'success' && (
          <div className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-6 shadow-inner animate-bounce">
              <LuCheck size={40} strokeWidth={3.5} />
            </div>
            <h3 className="text-2xl font-black text-[#0F172A] mb-3 font-[Montserrat]">
              Thanh toán thành công!
            </h3>
            <p className="text-[#475569] text-sm font-semibold max-w-sm leading-relaxed mb-4">
              Khóa học của bạn đã được đăng ký và xác nhận thanh toán thành công.
            </p>
            <div className="bg-emerald-50/70 border border-emerald-100 p-4 rounded-2xl w-full text-xs font-semibold text-emerald-700 flex flex-col gap-1.5 items-start mt-2">
              <span>📅 <strong>Thời gian học:</strong> {bookingDate} lúc {bookingTime}</span>
              <span>🔗 <strong>Phòng học:</strong> Link Google Meet sẽ được hiển thị trong trang Khóa học của tôi.</span>
            </div>
            <p className="text-[11px] text-[#94A3B8] font-bold mt-8">
              Cửa sổ này sẽ tự động đóng lại...
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
