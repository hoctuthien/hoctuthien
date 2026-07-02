"use client";

import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from "react";
import { Icon, type IconName } from "@/core/ui";
import { Card } from "@/core/ui/Card";
import { httpClient } from "@/core/api/client";

interface DashboardStats {
  totalUsers: number;
  totalMentors: number;
  totalMentees: number;
  pendingMentors: number;
  activeCourses: number;
  totalCourses: number;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalDonations: number;
  monthlyStats: { month: string; amount: number }[];
}

interface StatCard {
  label: string;
  value: string;
  icon: IconName;
  color: string;
  bg: string;
}

function formatCurrency(amount: number) {
  return amount.toLocaleString("vi-VN") + "đ";
}

function MonthlyBarChart({ data }: { data: { month: string; amount: number }[] }) {
  const tExtracted = useTranslations('Extracted.appAdminDashboardAdminDashboardClient');
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-full text-sm text-slate-400">{tExtracted('chuaCoDuLieu')}</div>;
  }
  const max = Math.max(...data.map((d) => d.amount), 1);
  return (
    <div className="flex items-end gap-2 h-full w-full px-2 pb-4 pt-2">
      {data.map((d) => {
        const pct = (d.amount / max) * 100;
        const label = d.month ? d.month.slice(0, 7) : "";
        return (
          <div key={d.month} className="flex flex-col items-center gap-1 flex-1 min-w-0">
            <span className="text-[9px] font-bold text-slate-500 truncate w-full text-center">
              {formatCurrency(d.amount)}
            </span>
            <div
              className="w-full rounded-t-lg bg-blue-500 transition-all duration-500"
              style={{ height: `${Math.max(pct, 4)}%` }}
            />
            <span className="text-[9px] text-slate-400 truncate w-full text-center">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminDashboardClient() {
  const tExtracted = useTranslations('Extracted.appAdminDashboardAdminDashboardClient');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    httpClient
      .get<any>("/v1/admin/stats")
      .then((res) => {
        const statsData = res?.data?.[0] || (Array.isArray(res) ? res[0] : res);
        setStats((statsData as DashboardStats) || null);
      })
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  const statCards: StatCard[] = stats
    ? [
        { label: tExtracted('tongNguoiDung'), value: stats.totalUsers.toLocaleString(), icon: "Users", color: "text-blue-600", bg: "bg-blue-50" },
        { label: tExtracted('choDuyetMentor'), value: stats.pendingMentors.toString(), icon: "Clock", color: "text-amber-600", bg: "bg-amber-50" },
        { label: tExtracted('khoaHocDangHoatDong'), value: stats.activeCourses.toString(), icon: "BookOpen", color: "text-green-600", bg: "bg-green-50" },
        { label: tExtracted('tongQuyenGop'), value: formatCurrency(stats.totalDonations), icon: "Heart", color: "text-rose-600", bg: "bg-rose-50" },
        { label: tExtracted('mentor'), value: stats.totalMentors.toString(), icon: "UserCheck", color: "text-purple-600", bg: "bg-purple-50" },
        { label: tExtracted('mentee'), value: stats.totalMentees.toString(), icon: "User", color: "text-cyan-600", bg: "bg-cyan-50" },
        { label: tExtracted('tongDatLich'), value: stats.totalBookings.toString(), icon: "Calendar", color: "text-indigo-600", bg: "bg-indigo-50" },
        { label: tExtracted('buoiHocHoanThanh'), value: stats.completedBookings.toString(), icon: "CheckCircle", color: "text-emerald-600", bg: "bg-emerald-50" },
      ]
    : [];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-[#181C20] mb-2">{tExtracted('bangDieuKhienAdmin')}</h1>
        <p className="text-text-muted">{tExtracted('tongQuanSoLieuHeThongHocTu')}</p>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} padding="lg" className="border-none shadow-sm animate-pulse h-20 bg-slate-100">
              <span className="sr-only">{tExtracted('loading')}</span>
            </Card>
          ))}
        </div>
      )}

      {!loading && stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat) => (
              <Card key={stat.label} padding="lg" className="border-none shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className={`${stat.bg} ${stat.color} p-2.5 rounded-xl flex-shrink-0`}>
                    <Icon name={stat.icon} size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-text-muted mb-1 truncate">{stat.label}</p>
                    <p className="text-xl lg:text-2xl font-bold text-text-heading truncate" title={stat.value}>
                      {stat.value}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 border-none shadow-sm" padding="lg">
              <h3 className="text-sm font-bold text-slate-600 mb-4 uppercase tracking-wider">{tExtracted('doanhThuQuyenGopTheoThang')}</h3>
              <div className="h-[320px]">
                <MonthlyBarChart data={stats.monthlyStats} />
              </div>
            </Card>
            <Card className="lg:col-span-1 border-none shadow-sm" padding="lg">
              <h3 className="text-sm font-bold text-slate-600 mb-4 uppercase tracking-wider">{tExtracted('tinhTrangDatLich')}</h3>
              <div className="flex flex-col gap-4 mt-2">
                {[
                  { label: tExtracted('hoanThanh'), value: stats.completedBookings, color: "bg-emerald-500" },
                  { label: tExtracted('daHuy'), value: stats.cancelledBookings, color: "bg-rose-400" },
                  { label: tExtracted('khac'), value: stats.totalBookings - stats.completedBookings - stats.cancelledBookings, color: "bg-slate-300" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${item.color}`} />
                    <span className="text-sm text-slate-600 flex-1">{item.label}</span>
                    <span className="text-sm font-bold text-slate-800">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100">
                <div className="text-xs text-slate-400">{tExtracted('tongKhoaHoc')}{stats.totalCourses} {tExtracted('active')}{stats.activeCourses}</div>
              </div>
            </Card>
          </div>
        </>
      )}

      {!loading && !stats && (
        <div className="text-sm text-rose-500 bg-rose-50 p-4 rounded-xl border border-rose-100">
          {tExtracted('khongTheTaiSoLieuVuiLongKiem')}</div>
      )}
    </div>
  );
}
