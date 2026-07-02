"use client";

import { useTranslations } from 'next-intl';
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Breadcrumb } from "@shared";
import { courseGateway, categoryGateway } from "@/core/gateway";
import { uploadImageToCloud } from "@/core/utils/upload";
import {
  LuArrowLeft,
  LuSparkles,
  LuImage,
  LuClock,
  LuDollarSign,
  LuPlus,
  LuTrash2,
  LuCheck,
  LuStar,
  LuUpload,
  LuCalendar
} from "react-icons/lu";

interface TimeSlot {
  start: string;
  end: string;
}

const WEEKDAYS = [
  { key: "monday", label: "Thứ Hai" },
  { key: "tuesday", label: "Thứ Ba" },
  { key: "wednesday", label: "Thứ Tư" },
  { key: "thursday", label: "Thứ Năm" },
  { key: "friday", label: "Thứ Sáu" },
  { key: "saturday", label: "Thứ Bảy" },
  { key: "sunday", label: "Chủ Nhật" }
];

const TIME_OPTIONS = [
  "07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
  "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"
];

export default function CourseCreateClient() {
  const tExtracted = useTranslations('Extracted.appPublicCoursesCreateCourseCreateClient');
  const router = useRouter();

  // Form states
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [category, setCategory] = useState("Chưa phân loại");
  const [level, setLevel] = useState("intermediate");
  const [duration, setDuration] = useState("12");
  const [format, setFormat] = useState("online");
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState("0");

  // Category states
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Thumbnail uploading states
  const [customThumbUrl, setCustomThumbUrl] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Teaching schedule state (Mandatory)
  const [schedule, setSchedule] = useState<Record<string, string[]>>({
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: []
  });

  // Temporary selectors for adding slot
  const [activeAddDay, setActiveAddDay] = useState<string | null>(null);
  const [tempStart, setTempStart] = useState("09:00");
  const [tempEnd, setTempEnd] = useState("10:30");

  // Dynamic Unsplash preset images for premium visual feel fallback
  const thumbPresets = [
    {
      id: "preset-1",
      url: "https://images.unsplash.com/photo-1541462608141-2f68c48a4077?q=80&w=600&auto=format&fit=crop",
      label: tExtracted('thietKeSanPham')
    },
    {
      id: "preset-2",
      url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop",
      label: tExtracted('lapTrinhCongNghe')
    },
    {
      id: "preset-3",
      url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=600&auto=format&fit=crop",
      label: tExtracted('kinhTePhanTich')
    },
    {
      id: "preset-4",
      url: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?q=80&w=600&auto=format&fit=crop",
      label: tExtracted('vietSangTaoBaoChi')
    }
  ];

  const [selectedThumb, setSelectedThumb] = useState(thumbPresets[0].url);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Load categories
  useEffect(() => {
    async function loadData() {
      try {
        setLoadingCategories(true);
        const cats = await categoryGateway.getCategories();
        setCategories(cats);
        if (cats.length > 0) {
          setSelectedCategoryId(cats[0].id);
          setCategory(cats[0].name);
        }
      } catch (err) {
        console.warn("Failed to load categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    }
    loadData();
  }, []);

  const handleCreateCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      const newCat = await categoryGateway.createCategory({ name: newCatName.trim() });
      if (!newCat || !newCat.id) {
        throw new Error('Phản hồi từ server không hợp lệ');
      }
      setCategories((prev) => [...prev, newCat]);
      setSelectedCategoryId(newCat.id);
      setCategory(newCat.name);
      setIsCategoryModalOpen(false);
      setNewCatName("");
    } catch (err: any) {
      console.error("Failed to create category:", err);
      alert(tExtracted('taoDanhMucThatBai') + (err?.error?.message || err?.message || tExtracted('loiKhongXacDinh')));
    }
  };

  const addTimeSlot = (day: string) => {
    const slotStr = `${tempStart}-${tempEnd}`;
    const daySlots = schedule[day] || [];

    // Check duplication
    if (daySlots.includes(slotStr)) {
      alert(tExtracted('khungGioNayDaTonTaiTrongNgay'));
      return;
    }

    // Sort helper
    const updated = [...daySlots, slotStr].sort((a, b) => {
      return a.split("-")[0].localeCompare(b.split("-")[0]);
    });

    setSchedule({
      ...schedule,
      [day]: updated
    });
    setActiveAddDay(null);
  };

  const removeTimeSlot = (day: string, slotIndex: number) => {
    const daySlots = schedule[day] || [];
    setSchedule({
      ...schedule,
      [day]: daySlots.filter((_, idx) => idx !== slotIndex)
    });
  };

  const countTotalSlots = () => {
    return Object.values(schedule).reduce((acc, curr) => acc + curr.length, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Check mandatory teaching schedule
    const totalSlots = countTotalSlots();
    if (totalSlots === 0) {
      alert(tExtracted('vuiLongThietLapItNhatMotKhung'));
      return;
    }

    if (!selectedCategoryId) {
      alert(tExtracted('vuiLongChonDanhMucChoKhoaHoc'));
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        title,
        description: subtitle,
        category,
        categoryIds: [selectedCategoryId],
        price: isPaid ? Number(price) : 0,
        status: 'published',
        thumbnail: currentThumb,
        durationMinutes: 60,
        prerequisites: [],
        metadata: {
          level,
          totalHours: Number(duration),
          format,
          time: schedule, // Save weekly schedule
        }
      };

      await courseGateway.createCourse(payload);
      setIsSuccess(true);
    } catch (error: any) {
      console.error("Failed to create course:", error);
      let errorMsg = tExtracted('daXayRaLoiKhiTaoKhoaHoc');
      if (error?.error?.details) {
        if (typeof error.error.details === "object") {
          if (error.error.details.message) {
            errorMsg += `\n\nChi tiết: ${error.error.details.message}`;
          } else {
            const detailLines = Object.entries(error.error.details)
              .map(([field, msg]) => `- ${field}: ${msg}`)
              .join("\n");
            if (detailLines) {
              errorMsg += `\n\nChi tiết lỗi nhập liệu:\n${detailLines}`;
            }
          }
        } else if (typeof error.error.details === "string") {
          errorMsg += `\n\nChi tiết: ${error.error.details}`;
        }
      } else if (error?.error?.message) {
        errorMsg += `\n\nChi tiết: ${error.error.message}`;
      } else if (error?.message) {
        errorMsg += `\n\nChi tiết: ${error.message}`;
      }
      alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinishRedirect = () => {
    router.push("/mentor/courses");
  };

  const breadcrumbItems = [
    { label: tExtracted('trangChu'), href: "/" },
    { label: tExtracted('coVan'), href: "/mentor/courses" },
    { label: tExtracted('danhSachKhoaHoc'), href: "/mentor/courses" },
    { label: tExtracted('taoKhoaHoc') },
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
              href="/mentor/courses"
              className="inline-flex items-center gap-2 text-slate-500 hover:text-[#2563eb] text-sm font-bold transition-colors cursor-pointer group"
            >
              <LuArrowLeft className="group-hover:-translate-x-1 transition-transform" size={16} />
              <span>{tExtracted('quayLaiTrangDanhSach')}</span>
            </Link>
          </div>
        </div>

        {isSuccess ? (
          /* SUCCESS ANIMATION SCREEN */
          <div className="bg-white border border-[#ECFDF5] rounded-[32px] p-8 md:p-16 text-center shadow-xl shadow-slate-100 max-w-2xl mx-auto flex flex-col items-center gap-6 my-12">
            <div className="w-20 h-20 bg-[#ECFDF5] rounded-full flex items-center justify-center text-[#10B981] animate-bounce">
              <svg className="w-10 h-10 text-[#10B981]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">{tExtracted('khoiTaoKhoaHocThanhCong')}</h2>
              <p className="text-slate-500 text-sm leading-relaxed max-w-md mx-auto">
                {tExtracted('khoaHoc')}<span className="font-extrabold text-[#2563eb]">"{title}"</span> {tExtracted('daDuocGhiNhanTrenHeThongVa')}</p>
            </div>

            {/* Structured schedule details */}
            <div className="bg-[#FAF9FF] border border-slate-100 p-5 rounded-2xl w-full flex items-center justify-around gap-4 text-left">
              <div>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">{tExtracted('lichGiangDay')}</span>
                <span className="text-sm font-black text-slate-800">{countTotalSlots()} {tExtracted('khungGioHoc')}</span>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">{tExtracted('hinhThuc')}</span>
                <span className="text-sm font-black text-slate-800 capitalize">{format}</span>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">{tExtracted('hocPhi')}</span>
                <span className="text-sm font-black text-[#10B981]">{isPaid ? `${Number(price).toLocaleString("vi-VN")}đ` : tExtracted('mienPhi2')}</span>
              </div>
            </div>

            <button
              onClick={handleFinishRedirect}
              className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-extrabold text-sm py-4 px-10 rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] cursor-pointer mt-4"
            >
              {tExtracted('veTrangQuanLyKhoaHoc')}</button>
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
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">{tExtracted('thongTinCoBan')}</h3>
                    <p className="text-[11px] text-slate-400 font-medium">{tExtracted('khoiTaoDanhTinhVaNoiDungTom')}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 tracking-wider uppercase block mb-1.5">
                      {tExtracted('tenKhoaHocChinhThuc')}<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder={tExtracted('viDuThietKeHeThongPhanCap')}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      maxLength={80}
                      className="w-full h-12 px-4 text-sm font-bold bg-[#FAF9FF] border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#2563eb] focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 tracking-wider uppercase block mb-1.5">
                      {tExtracted('moTaTomTatNgan')}<span className="text-red-500">*</span>
                    </label>
                    <textarea
                      placeholder={tExtracted('tomTatNganGonMucTieuNoiDung')}
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
                        {tExtracted('chuDeDanhMucDaoTao')}</label>
                      <div className="flex gap-2 items-center">
                        <select
                          value={selectedCategoryId}
                          onChange={(e) => {
                            const catId = e.target.value;
                            setSelectedCategoryId(catId);
                            const catObj = categories.find((c) => c.id === catId);
                            if (catObj) setCategory(catObj.name);
                          }}
                          className="flex-1 h-12 px-4 text-xs font-bold bg-[#FAF9FF] border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#2563eb] cursor-pointer"
                        >
                          {loadingCategories ? (
                            <option key="loading" value="">{tExtracted('dangTaiDanhMuc')}</option>
                          ) : categories.length > 0 ? (
                            categories.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name}
                              </option>
                            ))
                          ) : (
                            <option key="empty" value="">{tExtracted('chuaCoDanhMucNao')}</option>
                          )}
                        </select>
                        <button
                          type="button"
                          onClick={() => setIsCategoryModalOpen(true)}
                          className="h-12 px-4 bg-blue-50 text-[#2563eb] text-xs font-bold rounded-xl border border-blue-100 hover:bg-blue-100 transition-all cursor-pointer flex items-center gap-1 flex-shrink-0"
                        >
                          <LuPlus size={14} />
                          <span>{tExtracted('taoMoi')}</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 tracking-wider uppercase block mb-1.5">
                        {tExtracted('trinhDoChuyenMon')}</label>
                      <select
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        className="w-full h-12 px-4 text-xs font-bold bg-[#FAF9FF] border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#2563eb] cursor-pointer"
                      >
                        <option key="beginner" value="beginner">{tExtracted('coBanBeginner')}</option>
                        <option key="intermediate" value="intermediate">{tExtracted('trungCapIntermediate')}</option>
                        <option key="advanced" value="advanced">{tExtracted('nangCaoAdvanced')}</option>
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
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">{tExtracted('chiTietChiPhi')}</h3>
                    <p className="text-[11px] text-slate-400 font-medium">{tExtracted('cauHinhThoiLuongHocTapDinhDang')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 tracking-wider uppercase block mb-1.5">
                        {tExtracted('tongThoiLuongKhoaHoc')}</label>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder={tExtracted('viDu12')}
                          value={duration}
                          onChange={(e) => setDuration(e.target.value)}
                          min={1}
                          required
                          className="w-full h-12 pl-4 pr-12 text-sm font-bold bg-[#FAF9FF] border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#2563eb] transition-all"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold pointer-events-none">{tExtracted('gioHoc')}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 tracking-wider uppercase block mb-1.5">
                        {tExtracted('hinhThucGiangDay')}</label>
                      <select
                        value={format}
                        onChange={(e) => setFormat(e.target.value)}
                        className="w-full h-12 px-4 text-xs font-bold bg-[#FAF9FF] border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#2563eb] cursor-pointer"
                      >
                        <option key="online" value="online">{tExtracted('hocTrucTuyenOnline')}</option>
                        <option key="offline" value="offline">{tExtracted('hocTrucTiepOffline')}</option>
                        <option key="hybrid" value="hybrid">{tExtracted('hocKetHopHybrid')}</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-[#FAF9FF] border border-slate-100 p-5 rounded-2xl flex flex-col gap-4">
                    <span className="text-[10px] font-black text-slate-500 tracking-wider uppercase">{tExtracted('thuPhiKhoaHoc')}</span>

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
                        {tExtracted('mienPhi')}</button>
                      <button
                        type="button"
                        onClick={() => setIsPaid(true)}
                        className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all ${
                          isPaid
                            ? "bg-white border-2 border-[#2563eb] text-[#2563eb] shadow-sm"
                            : "bg-transparent border border-slate-200 text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        {tExtracted('traPhi')}</button>
                    </div>

                    {isPaid && (
                      <div className="relative animate-in slide-in-from-top-2 duration-200">
                        <LuDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                          type="number"
                          placeholder={tExtracted('viDu250000')}
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          min={1000}
                          required
                          className="w-full h-12 pl-9 pr-12 text-sm font-bold bg-white border border-slate-200 rounded-xl outline-none focus:border-[#2563eb] transition-all"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold pointer-events-none">{tExtracted('vnd')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Box 3: Cover image upload */}
              <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-[32px] shadow-sm flex flex-col gap-5">
                <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-[#2563eb]">
                    <LuImage size={16} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">{tExtracted('anhBiaDaiDien')}</h3>
                    <p className="text-[11px] text-slate-400 font-medium">{tExtracted('taiHinhAnhHoacChonPresetThietKe')}</p>
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
                    <span className="text-[9px] text-slate-400 font-extrabold tracking-wider uppercase">{tExtracted('taiAnhTuMayTinh')}</span>
                    <div className="h-px bg-slate-100 flex-1" />
                  </div>

                  {/* Custom upload area */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        id="thumbnail-upload"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            setIsUploadingImage(true);
                            const url = await uploadImageToCloud(file);
                            setCustomThumbUrl(url);
                            setSelectedThumb(url);
                            alert(tExtracted('daUploadAnhThanhCong'));
                          } catch (err: any) {
                            console.error("Upload failed:", err);
                            alert(tExtracted('taiAnhThatBai') + (err.message || tExtracted('loiKhongXacDinh')));
                          } finally {
                            setIsUploadingImage(false);
                          }
                        }}
                      />
                      <label
                        htmlFor="thumbnail-upload"
                        className="flex items-center gap-2 px-5 py-3 border-2 border-dashed border-slate-200 hover:border-[#2563eb] hover:text-[#2563eb] text-slate-600 rounded-xl text-xs font-black transition-all cursor-pointer select-none"
                      >
                        <LuUpload size={14} />
                        {isUploadingImage ? tExtracted('dangTaiLenCloud') : tExtracted('chonTepHinhAnh')}
                      </label>
                      {customThumbUrl && (
                        <span className="text-xs text-emerald-600 font-extrabold flex items-center gap-1.5">
                          <LuCheck size={14} />
                          {tExtracted('taiAnhLenThanhCong')}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Box 4: Teaching Schedule Slots Builder (Weekly Scheduler) */}
              <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-[32px] shadow-sm flex flex-col gap-5">
                <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-[#2563eb]">
                    <LuCalendar size={16} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">{tExtracted('cauHinhLichGiangDay')}</h3>
                    <p className="text-[11px] text-slate-400 font-medium">{tExtracted('chonNgayHocTrongTuanVaThietLap')}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-5">
                  {WEEKDAYS.map((day) => {
                    const slots = schedule[day.key] || [];
                    const isAddingThisDay = activeAddDay === day.key;

                    return (
                      <div key={day.key} className="border border-slate-100 rounded-2xl p-4 bg-[#FAF9FF]/40 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-black text-slate-800">{day.label}</span>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveAddDay(isAddingThisDay ? null : day.key);
                            }}
                            className="bg-blue-50 hover:bg-blue-100 text-[#2563eb] text-[10px] font-black px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer border border-blue-100/50"
                          >
                            <LuPlus size={12} />
                            {tExtracted('themKhungGio')}</button>
                        </div>

                        {/* Inline Adding Form */}
                        {isAddingThisDay && (
                          <div className="bg-white border border-blue-100 rounded-xl p-3.5 flex items-center gap-4 text-xs font-semibold animate-in slide-in-from-top-2 duration-200">
                            <div className="flex items-center gap-1.5">
                              <span>{tExtracted('tu')}</span>
                              <select
                                value={tempStart}
                                onChange={(e) => setTempStart(e.target.value)}
                                className="bg-slate-50 border border-slate-200 px-2 py-1 rounded outline-none font-bold text-slate-700"
                              >
                                {TIME_OPTIONS.map(t => (
                                  <option key={t} value={t}>{t}</option>
                                ))}
                              </select>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span>{tExtracted('den')}</span>
                              <select
                                value={tempEnd}
                                onChange={(e) => setTempEnd(e.target.value)}
                                className="bg-slate-50 border border-slate-200 px-2 py-1 rounded outline-none font-bold text-slate-700"
                              >
                                {TIME_OPTIONS.map(t => (
                                  <option key={t} value={t}>{t}</option>
                                ))}
                              </select>
                            </div>
                            <div className="flex items-center gap-2 ml-auto">
                              <button
                                type="button"
                                onClick={() => setActiveAddDay(null)}
                                className="px-3 py-1.5 border rounded-lg hover:bg-slate-50 font-bold"
                              >
                                {tExtracted('huy')}</button>
                              <button
                                type="button"
                                onClick={() => addTimeSlot(day.key)}
                                className="px-3 py-1.5 bg-[#2563eb] text-white rounded-lg hover:bg-blue-700 font-black"
                              >
                                {tExtracted('xacNhan')}</button>
                            </div>
                          </div>
                        )}

                        {/* Configured Slots List */}
                        {slots.length > 0 ? (
                          <div className="flex flex-wrap gap-2 mt-1">
                            {slots.map((slot, sIdx) => (
                              <span
                                key={sIdx}
                                className="bg-white border border-slate-200 text-xs font-black text-slate-700 px-3 py-1.5 rounded-xl flex items-center gap-2 hover:border-red-200 hover:text-red-500 group transition-all"
                              >
                                <LuClock size={12} className="text-slate-400 group-hover:text-red-400" />
                                <span>{slot}</span>
                                <button
                                  type="button"
                                  onClick={() => removeTimeSlot(day.key, sIdx)}
                                  className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                                  title={tExtracted('xoaKhungGio')}
                                >
                                  <LuTrash2 size={12} />
                                </button>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-semibold italic">{tExtracted('chuaCoLichDayTrongNgayNay')}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action row at bottom of form */}
              <div className="flex items-center justify-end gap-4 mt-2">
                <Link
                  href="/mentor/courses"
                  className="px-6 py-3.5 text-xs font-black text-slate-500 hover:text-slate-700 transition-colors uppercase tracking-wider cursor-pointer"
                >
                  {tExtracted('huyBoTroLai')}</Link>
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
                      <span>{tExtracted('hoanThanhVaDangKy')}</span>
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
                  <span className="text-[10px] text-blue-400 font-extrabold uppercase tracking-widest leading-none">{tExtracted('banXemThuTrucQuan')}</span>
                  <span className="text-xs text-slate-300 font-medium">{tExtracted('banTheCuaBanSeXuatHienTren')}</span>
                </div>
              </div>

              {/* CARD PREVIEW DESIGN */}
              <div className="bg-white rounded-[24px] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.06)] border border-slate-100/90 flex flex-col justify-between aspect-auto">
                <div>
                  {/* Thumbnail Cover Area */}
                  <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden shadow-sm bg-slate-50 border border-slate-100 mb-5">
                    <img
                      src={currentThumb}
                      alt={tExtracted('thumbnailPreview')}
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
                      <img
                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80"
                        alt={tExtracted('mentorPlaceholder')}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-black text-slate-900 tracking-tight leading-none">{tExtracted('banCoVan')}</span>
                      <span className="text-[9px] text-[#2563eb] font-extrabold uppercase tracking-wider">
                        {tExtracted('daoTaoChuyenMonCapCao')}</span>
                    </div>
                  </div>

                  {/* Title & category */}
                  <div className="flex flex-col gap-1.5 mb-3">
                    <span className="self-start text-[9px] bg-slate-100 text-slate-600 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {category}
                    </span>
                    <h4 className="text-base font-black text-[#0F172A] tracking-tight leading-snug line-clamp-2 min-h-[2.5rem]">
                      {title.trim() ? title : tExtracted('tenKhoaHocCuaBanSeHienThi')}
                    </h4>
                  </div>

                  {/* Description subtitle */}
                  <p className="text-xs leading-relaxed text-[#475569] font-medium mb-4 line-clamp-3 min-h-[3.2rem]">
                    {subtitle.trim() ? subtitle : tExtracted('vietMoTaTomTatThuViNhan')}
                  </p>
                </div>

                {/* Bottom Stats */}
                <div>
                  <div className="h-px bg-[#F1F5F9] w-full my-4" />

                  <div className="flex flex-col gap-1.5 text-[10px] font-bold text-[#64748b]">
                    <div className="flex items-center justify-between">
                      <span>{tExtracted('capDoKhoaHoc')}</span>
                      <span className="text-[#0F172A] font-black uppercase tracking-wide">{level}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{tExtracted('thoiLuongHoc')}</span>
                      <span className="text-[#0F172A] font-black">{duration || "0"} {tExtracted('gioGiangDay')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{tExtracted('hocPhiThamKhao')}</span>
                      <span className="text-[#10B981] font-black uppercase tracking-wider">
                        {isPaid ? `${Number(price).toLocaleString("vi-VN")} VNĐ` : tExtracted('mienPhiDaoTao')}
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-[#FAF9FF] text-center border border-slate-100 text-[10px] font-black text-slate-500 py-3 rounded-xl uppercase tracking-wider block mt-4 select-none">
                    {tExtracted('banXemThuPreview')}</div>
                </div>
              </div>

              {/* High-fidelity summary schedule card */}
              <div className="bg-[#FAF9FF] border border-slate-100 rounded-2xl p-5 flex flex-col gap-3.5">
                <span className="text-[10px] font-black text-slate-500 tracking-wider uppercase">{tExtracted('tomTatLichDay')}</span>

                <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                  <span>{tExtracted('soNgayDayTrongTuan')}</span>
                  <span className="font-black text-slate-800">
                    {Object.values(schedule).filter(slots => slots.length > 0).length} {tExtracted('ngay')}</span>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                  <span>{tExtracted('tongSoKhungGio')}</span>
                  <span className="font-black text-slate-800">{countTotalSlots()} {tExtracted('khungGio')}</span>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* category Creation Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] p-6 max-w-sm w-full border border-slate-100 shadow-2xl flex flex-col gap-5">
            <div>
              <h3 className="text-base font-black text-slate-900">{tExtracted('themDanhMucMoi')}</h3>
              <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{tExtracted('nhapTenDanhMucSauKhiTaoSe')}</p>
            </div>

            <form onSubmit={handleCreateCategorySubmit} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder={tExtracted('viDuLapTrinhVueJsTiengNhat')}
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                required
                autoFocus
                className="w-full h-11 px-3 text-sm font-semibold bg-[#FAF9FF] border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#2563eb] focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-slate-400"
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setIsCategoryModalOpen(false); setNewCatName(""); }}
                  className="px-4 py-2 text-xs font-extrabold text-slate-500 hover:text-slate-700 uppercase"
                >
                  {tExtracted('huy')}</button>
                <button
                  type="submit"
                  disabled={!newCatName.trim()}
                  className="px-5 py-2.5 bg-[#2563eb] text-white text-xs font-black rounded-xl hover:bg-blue-700 uppercase shadow-md shadow-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {tExtracted('taoDanhMuc')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
