"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { LuStar, LuUsers, LuTrophy } from "react-icons/lu";
import { apiService } from "@/core/api/base";
import { Breadcrumb } from "@shared";

interface MentorEntry {
  id: string;
  userId: string;
  jobTitle?: string;
  company?: string;
  totalStudents: number;
  averageRating: number;
  user?: { name: string; avatarUrl?: string | null };
}

interface MenteeEntry {
  menteeId: string;
  completedCount: string;
}

const MEDALS = ["🥇", "🥈", "🥉"];

const breadcrumbItems = [
  { label: "Trang chủ", href: "/" },
  { label: "Bảng xếp hạng" },
];

export default function LeaderboardPage() {
  const [tab, setTab] = useState<"mentor" | "mentee">("mentor");
  const [mentors, setMentors] = useState<MentorEntry[]>([]);
  const [mentees, setMentees] = useState<MenteeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiService.get<any>("/admin/leaderboard?type=mentor&limit=10"),
      apiService.get<any>("/admin/leaderboard?type=mentee&limit=10"),
    ])
      .then(([mRes, meRes]) => {
        setMentors(Array.isArray(mRes.data) ? mRes.data : []);
        setMentees(Array.isArray(meRes.data) ? meRes.data : []);
      })
      .catch(() => {
        setMentors([]);
        setMentees([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-10 flex flex-col gap-8">
        <Breadcrumb items={breadcrumbItems} />

        <div className="text-center">
          <div className="text-5xl mb-3">🏆</div>
          <h1 className="text-3xl font-black text-slate-900">Bảng xếp hạng</h1>
          <p className="text-slate-500 text-sm mt-2 font-semibold">
            Vinh danh những Cố vấn và Học viên xuất sắc nhất của Học Từ Thiện
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-white border border-slate-200 rounded-2xl p-1 w-fit mx-auto shadow-sm">
          {(["mentor", "mentee"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-2 rounded-xl text-sm font-black transition-all cursor-pointer border-0 ${
                tab === t ? "bg-[#005BBF] text-white shadow-sm" : "text-slate-500 hover:text-slate-700 bg-transparent"
              }`}
            >
              {t === "mentor" ? "Cố vấn học tập" : "Học viên"}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : tab === "mentor" ? (
          <div className="flex flex-col gap-3">
            {mentors.length === 0 && (
              <p className="text-center text-slate-400 text-sm py-8">Chưa có dữ liệu</p>
            )}
            {mentors.map((mentor, idx) => (
              <Link
                href={`/mentors/${mentor.id}`}
                key={mentor.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 hover:border-blue-200 hover:shadow-md transition-all no-underline group"
              >
                <div className="text-2xl w-10 text-center flex-shrink-0">
                  {idx < 3 ? MEDALS[idx] : <span className="text-slate-400 font-black text-base">{idx + 1}</span>}
                </div>
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-100">
                  <img
                    src={mentor.user?.avatarUrl || "/images/avatar_logo.png"}
                    alt={mentor.user?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-900 text-sm group-hover:text-blue-600 transition-colors truncate">
                    {mentor.user?.name || "Cố vấn"}
                  </p>
                  {(mentor.jobTitle || mentor.company) && (
                    <p className="text-xs text-slate-400 font-semibold truncate">
                      {[mentor.jobTitle, mentor.company].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="flex items-center gap-1 text-xs font-bold text-amber-600">
                    <LuStar size={12} className="fill-amber-400 text-amber-400" />
                    {Number(mentor.averageRating).toFixed(1)}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold text-slate-500">
                    <LuUsers size={12} />
                    {mentor.totalStudents} học viên
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {mentees.length === 0 && (
              <p className="text-center text-slate-400 text-sm py-8">Chưa có dữ liệu</p>
            )}
            {mentees.map((mentee, idx) => (
              <div
                key={mentee.menteeId}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4"
              >
                <div className="text-2xl w-10 text-center flex-shrink-0">
                  {idx < 3 ? MEDALS[idx] : <span className="text-slate-400 font-black text-base">{idx + 1}</span>}
                </div>
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <LuTrophy size={22} className="text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-900 text-sm truncate">Học viên</p>
                  <p className="text-xs text-slate-400 font-mono truncate">{mentee.menteeId?.slice(0, 16)}…</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-black text-emerald-600">{mentee.completedCount}</p>
                  <p className="text-[10px] text-slate-400 font-semibold">buổi hoàn thành</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
