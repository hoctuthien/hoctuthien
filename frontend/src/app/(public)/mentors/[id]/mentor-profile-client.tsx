"use client";

import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { LuStar, LuUsers, LuBriefcase, LuLink, LuArrowLeft, LuMapPin, LuBookOpen } from "react-icons/lu";
import { httpClient } from "@/core/api/client";
import { apiService } from "@/core/api/base";
import { Breadcrumb } from "@shared";

interface MentorProfile {
  id: string;
  userId: string;
  jobTitle?: string;
  company?: string;
  bio?: string;
  linkedinUrl?: string;
  yearsOfExperience?: number;
  skills: string[];
  averageRating?: number | null;
  totalStudents?: number | null;
  isApproved: boolean;
  status: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
  };
}

interface Course {
  id: string;
  title: string;
  thumbnailUrl?: string | null;
  price: number;
  status: string;
  durationMinutes: number;
}

function StarRating({ rating }: { rating: number }) {
  const tExtracted = useTranslations('Extracted.appPublicMentorsIdPage');
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <LuStar
          key={star}
          size={14}
          className={star <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}
        />
      ))}
      <span className="ml-1 text-xs font-bold text-slate-600">{Number(rating).toFixed(1)}</span>
    </div>
  );
}

export default function MentorProfileClient() {
  const tExtracted = useTranslations('Extracted.appPublicMentorsIdPage');
  const params = useParams();
  const router = useRouter();
  const mentorId = params?.id as string;

  const [profile, setProfile] = useState<MentorProfile | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!mentorId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const profileRes = await apiService.get<any>(`/mentor-profiles/${mentorId}`);
        const profileData = profileRes.data;
        setProfile(profileData);

        if (profileData?.userId) {
          try {
            const coursesRes = await apiService.get<any>(`/courses?mentorId=${profileData.userId}&status=ACTIVE&limit=20`);
            setCourses(coursesRes.data?.data || coursesRes.data || []);
          } catch {
            setCourses([]);
          }
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mentorId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <p className="text-slate-500 text-sm font-semibold">{tExtracted('khongTimThayHoSoCoVanNay')}</p>
        <button onClick={() => router.push("/mentorship")} className="text-blue-600 text-sm font-bold hover:underline">
          {tExtracted('quayVeDanhSachCoVan')}</button>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: tExtracted('trangChu'), href: "/" },
    { label: tExtracted('coVanHocTap'), href: "/mentorship" },
    { label: profile.user?.name || tExtracted('hoSoCoVan') },
  ];
  const averageRating = Number(profile.averageRating ?? 0);
  const totalStudents = Number(profile.totalStudents ?? 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-10 flex flex-col gap-8">
        <Breadcrumb items={breadcrumbItems} />

        {/* Profile Header */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="h-28 bg-gradient-to-r from-blue-600 to-indigo-500" />
          <div className="px-8 pb-8 -mt-12 flex flex-col md:flex-row md:items-end gap-5">
            <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-slate-100 flex-shrink-0">
              <img
                src={profile.user?.avatarUrl || "/images/avatar_logo.png"}
                alt={profile.user?.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0 mt-2 md:mt-0">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 leading-tight">{profile.user?.name}</h1>
                  {(profile.jobTitle || profile.company) && (
                    <p className="text-sm text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                      <LuBriefcase size={13} />
                      {[profile.jobTitle, profile.company].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
                <Link
                  href={`/courses?mentorId=${profile.userId}`}
                  className="inline-flex items-center gap-2 bg-[#005BBF] hover:bg-[#004493] text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all shadow-sm shadow-blue-200 no-underline"
                >
                  <LuBookOpen size={15} />
                  {tExtracted('xemKhoaHoc')}</Link>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-3">
                <StarRating rating={averageRating} />
                <span className="flex items-center gap-1 text-xs font-bold text-slate-500">
                  <LuUsers size={13} />
                  {totalStudents} {tExtracted('hocVien')}</span>
                {profile.yearsOfExperience && (
                  <span className="flex items-center gap-1 text-xs font-bold text-slate-500">
                    <LuBriefcase size={13} />
                    {profile.yearsOfExperience} {tExtracted('namKinhNghiem')}</span>
                )}
                {profile.linkedinUrl && (
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 no-underline"
                  >
                    <LuLink size={13} />
                    {tExtracted('linkedin')}</a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Bio + Skills */}
          <div className="md:col-span-2 flex flex-col gap-5">
            {profile.bio && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="text-sm font-black text-slate-500 uppercase tracking-wider mb-3">{tExtracted('gioiThieu')}</h2>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
              </div>
            )}

            {profile.skills?.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="text-sm font-black text-slate-500 uppercase tracking-wider mb-3">{tExtracted('kyNang')}</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-xl border border-blue-100"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Courses */}
            {courses.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="text-sm font-black text-slate-500 uppercase tracking-wider mb-4">
                  {tExtracted('khoaHocDangDay')}{courses.length})
                </h2>
                <div className="flex flex-col gap-3">
                  {courses.map((course) => (
                    <Link
                      key={course.id}
                      href={`/courses/detail/${course.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all no-underline group"
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                        <img
                          src={course.thumbnailUrl || "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=80&q=80"}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                          {course.title}
                        </p>
                        <p className="text-xs text-slate-400 font-semibold mt-0.5">
                          {course.durationMinutes} {tExtracted('phut')}{Number(course.price) === 0 ? tExtracted('mienPhi') : `${Number(course.price).toLocaleString("vi-VN")}đ`}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Stats card */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-4">
              <h2 className="text-sm font-black text-slate-500 uppercase tracking-wider">{tExtracted('thongKe')}</h2>
              {[
                { label: tExtracted('danhGiaTrungBinh'), value: `${averageRating.toFixed(1)} ⭐` },
                { label: tExtracted('tongHocVien'), value: totalStudents.toString() },
                { label: tExtracted('kinhNghiem'), value: profile.yearsOfExperience ? `${profile.yearsOfExperience} năm` : "—" },
                { label: tExtracted('khoaHoc'), value: courses.length.toString() },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                  <span className="text-xs text-slate-500 font-semibold">{label}</span>
                  <span className="text-xs font-black text-slate-800">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
