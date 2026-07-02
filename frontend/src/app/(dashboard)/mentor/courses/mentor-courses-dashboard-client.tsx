"use client";

import { useTranslations } from 'next-intl';
import React, { useState } from "react";
import Link from "next/link";
import { Breadcrumb, EmptyState, Modal } from "@shared";
import { courseGateway } from "@/core/gateway";
import { MockCourse } from "@/shared/mocks/mentorCourses.mock";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  LuPlus,
  LuBookOpen,
  LuUsers,
  LuStar,
  LuTrash2,
  LuClock,
  LuTag,
  LuSearch,
  LuChevronDown,
  LuSparkles,
  LuInfo,
  LuExternalLink
} from "react-icons/lu";

export default function MentorCoursesDashboardClient() {
  const tExtracted = useTranslations('Extracted.appDashboardMentorCoursesMentorCoursesDashboardClient');
  const queryClient = useQueryClient();
  const [deleteCourseId, setDeleteCourseId] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch courses via TanStack Query
  const { data: courses = [], isLoading: loading } = useQuery<MockCourse[]>({
    queryKey: ["mentorCourses"],
    queryFn: () => courseGateway.getMyCourses(),
  });

  // Handle course deletion via TanStack Query Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => courseGateway.deleteCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentorCourses"] });
      queryClient.invalidateQueries({ queryKey: ["publicCourses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
      setDeleteCourseId(null);
    },
    onError: (error) => {
      console.error("Failed to delete course:", error);
    }
  });

  const isDeleting = deleteMutation.isPending;

  const handleDeleteConfirm = async () => {
    if (!deleteCourseId) return;
    deleteMutation.mutate(deleteCourseId);
  };

  // Filtered courses
  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const totalCourses = courses.length;
  const publishedCount = courses.filter(c => c.status === "published").length;
  const pendingCount = courses.filter(c => c.status === "pending").length;
  const draftOrRejectedCount = courses.filter(c => c.status === "draft" || c.status === "rejected").length;

  const breadcrumbItems = [
    { label: tExtracted('trangChu'), href: "/" },
    { label: tExtracted('coVan'), href: "#" },
    { label: tExtracted('quanLyKhoaHoc') },
  ];

  return (
    <div className="w-full flex flex-col gap-8 font-sans overflow-x-hidden">

        {/* Header Breadcrumb & Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Breadcrumb items={breadcrumbItems} />
            <h1 className="text-3xl font-black text-[#0F172A] tracking-tight mt-1 font-[Montserrat]">
              {tExtracted('quanLyKhoaHocCuaBan')}</h1>
            <p className="text-sm text-[#64748b] font-medium">
              {tExtracted('xemCapNhatTrangThaiVaTaoCac')}</p>
          </div>

          <Link
            href="/courses/create"
            className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-extrabold text-sm py-3.5 px-6 rounded-2xl flex items-center gap-2 shadow-lg shadow-blue-500/10 active:scale-[0.98] transition-all justify-center cursor-pointer whitespace-nowrap self-start md:self-auto"
          >
            <LuPlus size={18} strokeWidth={2.5} />
            <span>{tExtracted('taoKhoaHocMoi')}</span>
          </Link>
        </div>

        {/* 1. Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Total Courses */}
          <div className="bg-white border border-[#E2E8F0] p-6 rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.01)] flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-[#2563eb] rounded-2xl flex items-center justify-center">
              <LuBookOpen size={22} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-[#64748b] font-black uppercase tracking-wider">{tExtracted('tongKhoaHoc')}</span>
              {loading ? (
                <div className="h-7 w-12 bg-slate-100 rounded-md animate-pulse" />
              ) : (
                <span className="text-2xl font-black text-[#0F172A]">{totalCourses}</span>
              )}
            </div>
          </div>

          {/* Card 2: Published */}
          <div className="bg-white border border-[#E2E8F0] p-6 rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.01)] flex items-center gap-4">
            <div className="w-12 h-12 bg-[#ECFDF5] text-[#10B981] rounded-2xl flex items-center justify-center">
              <LuSparkles size={22} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-[#64748b] font-black uppercase tracking-wider">{tExtracted('daXuatBan')}</span>
              {loading ? (
                <div className="h-7 w-12 bg-slate-100 rounded-md animate-pulse" />
              ) : (
                <span className="text-2xl font-black text-[#10B981]">{publishedCount}</span>
              )}
            </div>
          </div>

          {/* Card 3: Pending */}
          <div className="bg-white border border-[#E2E8F0] p-6 rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.01)] flex items-center gap-4">
            <div className="w-12 h-12 bg-[#FFFBEB] text-[#D97706] rounded-2xl flex items-center justify-center">
              <LuClock size={22} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-[#64748b] font-black uppercase tracking-wider">{tExtracted('choPheDuyet')}</span>
              {loading ? (
                <div className="h-7 w-12 bg-slate-100 rounded-md animate-pulse" />
              ) : (
                <span className="text-2xl font-black text-[#D97706]">{pendingCount}</span>
              )}
            </div>
          </div>

          {/* Card 4: Draft/Rejected */}
          <div className="bg-white border border-[#E2E8F0] p-6 rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.01)] flex items-center gap-4">
            <div className="w-12 h-12 bg-[#F8FAFC] text-[#64748b] rounded-2xl flex items-center justify-center">
              <LuInfo size={22} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-[#64748b] font-black uppercase tracking-wider">{tExtracted('nhapTuChoi')}</span>
              {loading ? (
                <div className="h-7 w-12 bg-slate-100 rounded-md animate-pulse" />
              ) : (
                <span className="text-2xl font-black text-[#475569]">{draftOrRejectedCount}</span>
              )}
            </div>
          </div>
        </div>

        {/* 2. Filters & Searches */}
        <div className="bg-white border border-[#E2E8F0] p-5 rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.01)] flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full md:w-[350px]">
            <LuSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={16} />
            <input
              type="text"
              placeholder={tExtracted('timKiemTheoTieuDeHoacDanhMuc')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none focus:bg-white focus:border-[#2563eb] text-sm font-semibold transition-all"
            />
          </div>

          {/* Status Dropdown */}
          <div className="relative w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-[200px] appearance-none bg-[#F8FAFC] border border-[#E2E8F0] pl-4 pr-10 py-2.5 rounded-xl text-xs font-black text-[#475569] outline-none focus:bg-white focus:border-[#2563eb] cursor-pointer"
            >
              <option value="all">{tExtracted('tatCaTrangThai')}</option>
              <option value="published">{tExtracted('daXuatBanPublished')}</option>
              <option value="pending">{tExtracted('dangChoDuyetPending')}</option>
              <option value="draft">{tExtracted('banNhapDraft')}</option>
              <option value="rejected">{tExtracted('biTuChoiRejected')}</option>
            </select>
            <LuChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] pointer-events-none" size={14} />
          </div>
        </div>

        {/* 3. Course List/Grid */}
        {loading ? (
          /* Loading Skeleton Layout */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-[24px] border border-slate-100 p-5 flex flex-col gap-4 animate-pulse">
                <div className="aspect-[16/10] bg-slate-100 rounded-xl w-full" />
                <div className="h-4 bg-slate-100 rounded w-1/3" />
                <div className="h-6 bg-slate-100 rounded w-full" />
                <div className="h-6 bg-slate-100 rounded w-2/3" />
                <div className="h-px bg-slate-100 w-full my-1" />
                <div className="flex justify-between items-center">
                  <div className="h-8 bg-slate-100 rounded w-1/4" />
                  <div className="h-8 bg-slate-100 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              // Status Styling logic
              let statusLabel = "";
              let statusStyles = "";
              switch(course.status) {
                case "published":
                  statusLabel = "Đã xuất bản";
                  statusStyles = "bg-[#ECFDF5] text-[#10B981] border-[#A7F3D0]";
                  break;
                case "pending":
                  statusLabel = "Chờ kiểm duyệt";
                  statusStyles = "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]";
                  break;
                case "draft":
                  statusLabel = "Bản nháp";
                  statusStyles = "bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]";
                  break;
                case "rejected":
                  statusLabel = "Bị từ chối";
                  statusStyles = "bg-[#FEF2F2] text-[#EF4444] border-[#FEE2E2]";
                  break;
              }

              return (
                <div
                  key={course.id}
                  className="bg-white rounded-[24px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.01)] border border-slate-100/90 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col justify-between"
                >
                  <div>
                    {/* Course Thumbnail */}
                    <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden shadow-sm bg-slate-50 border border-slate-100 mb-4 group">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Floating Status Badge */}
                      <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-black border uppercase tracking-wider backdrop-blur-[1px] ${statusStyles}`}>
                        {statusLabel}
                      </span>

                      {/* Created date at bottom right */}
                      <div className="absolute bottom-3 right-3 bg-slate-900/60 text-white px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wider flex items-center gap-1 backdrop-blur-[2px]">
                        <LuClock size={10} />
                        <span>{course.createdAt}</span>
                      </div>
                    </div>

                    {/* Category Tag */}
                    <div className="flex items-center gap-1 text-[#2563eb] text-[10px] font-black uppercase tracking-wider mb-2">
                      <LuTag size={10} />
                      <span>{course.category}</span>
                    </div>

                    {/* Course Title */}
                    <h3 className="text-[16px] font-black text-[#0F172A] tracking-tight leading-snug mb-3 line-clamp-2 min-h-[2.5rem]">
                      {course.title}
                    </h3>
                  </div>

                  <div>
                    {/* Stats details */}
                    <div className="h-px bg-slate-100 w-full my-3" />
                    <div className="grid grid-cols-3 gap-2 text-[10px] text-[#64748b] font-bold">
                      <div className="flex flex-col gap-0.5">
                        <span>{tExtracted('hocVien')}</span>
                        <span className="text-[#0F172A] font-black flex items-center gap-0.5">
                          <LuUsers size={11} className="text-slate-400" />
                          {course.studentsCount}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span>{tExtracted('danhGia')}</span>
                        <span className="text-[#0F172A] font-black flex items-center gap-0.5">
                          <LuStar size={11} className="fill-amber-500 text-amber-500" />
                          {course.rating > 0 ? `${course.rating.toFixed(1)} (${course.reviewsCount})` : tExtracted('chuaCo')}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span>{tExtracted('hocPhi')}</span>
                        <span className="text-[#10B981] font-black tracking-wide">
                          {course.price > 0 ? `${(course.price).toLocaleString("vi-VN")}đ` : tExtracted('mienPhi')}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 mt-4">
                      <Link
                        href={`/courses/detail/${course.id}`}
                        className="flex-1 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#1e293b] font-black text-[11px] py-3 rounded-xl transition-all uppercase tracking-wider text-center flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <LuExternalLink size={12} />
                        <span>{tExtracted('xemChiTiet')}</span>
                      </Link>

                      <button
                        onClick={() => setDeleteCourseId(course.id)}
                        className="p-3 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 rounded-xl transition-colors cursor-pointer border border-red-100"
                        title={tExtracted('xoaKhoaHoc')}
                      >
                        <LuTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State when no course matches search/filters */
          <div className="py-12 bg-white rounded-[28px] border border-slate-100">
            <EmptyState
              icon={<LuBookOpen size={48} className="text-slate-400 animate-bounce" />}
              title={tExtracted('khongTimThayKhoaHocNao')}
              description={tExtracted('banChuaTaoKhoaHocNaoHoacBo')}
              actionText={tExtracted('taoKhoaHocNgay')}
              onAction={() => window.location.href = "/courses/create"}
            />
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteCourseId !== null}
          onClose={() => setDeleteCourseId(null)}
          title={tExtracted('xacNhanXoaKhoaHoc')}
          containerClassName="max-w-md"
          className="p-8 pt-0"
        >
          <div className="flex flex-col gap-4 py-2">
            <p className="text-sm text-slate-500 leading-relaxed font-semibold">
              {tExtracted('banCoChacChanMuonXoaKhoaHoc')}</p>
            <div className="flex items-center justify-end gap-3 mt-2">
              <button
                onClick={() => setDeleteCourseId(null)}
                className="px-5 py-2.5 text-xs font-black text-slate-500 hover:text-slate-700 transition-colors uppercase tracking-wider"
              >
                {tExtracted('huyBo')}</button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="bg-red-500 hover:bg-red-600 text-white font-extrabold text-xs py-2.5 px-6 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-red-500/10 active:scale-[0.98] min-w-[100px]"
              >
                {isDeleting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LuTrash2 size={12} />
                    <span>{tExtracted('dongYXoa')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>

      </div>
  );
}
