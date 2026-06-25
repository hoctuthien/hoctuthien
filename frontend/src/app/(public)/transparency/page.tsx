"use client";

import React, { useEffect, useState } from "react";
import { LuTrendingUp, LuDollarSign, LuCheck } from "react-icons/lu";
import { apiService } from "@/core/api/base";
import { Breadcrumb } from "@shared";

interface TransparencyData {
  totalRaised: number;
  totalCompleted: number;
  monthlyStats: { month: string; amount: number }[];
  recentPayments: { id: string; amount: number; currency: string; paidAt: string | null; description: string | null }[];
}

function formatCurrency(amount: number) {
  return amount.toLocaleString("vi-VN") + "đ";
}

function MonthlyBarChart({ data }: { data: { month: string; amount: number }[] }) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-full text-sm text-slate-400">Chưa có dữ liệu</div>;
  }
  const max = Math.max(...data.map((d) => d.amount), 1);
  return (
    <div className="flex items-end gap-2 h-full w-full px-2 pb-2 pt-2">
      {data.map((d) => {
        const pct = (d.amount / max) * 100;
        return (
          <div key={d.month} className="flex flex-col items-center gap-1 flex-1 min-w-0">
            <span className="text-[9px] font-bold text-slate-500 hidden md:block truncate w-full text-center">
              {formatCurrency(d.amount)}
            </span>
            <div
              title={`${d.month}: ${formatCurrency(d.amount)}`}
              className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-blue-400 transition-all duration-700 hover:from-blue-700 hover:to-blue-500 cursor-default"
              style={{ height: `${Math.max(pct, 4)}%` }}
            />
            <span className="text-[9px] text-slate-400 truncate w-full text-center">{d.month?.slice(5)}</span>
          </div>
        );
      })}
    </div>
  );
}

const breadcrumbItems = [
  { label: "Trang chủ", href: "/" },
  { label: "Minh bạch tài chính" },
];

export default function TransparencyPage() {
  const [data, setData] = useState<TransparencyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService
      .get<any>("/admin/transparency")
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 flex flex-col gap-8">
        <Breadcrumb items={breadcrumbItems} />

        <div>
          <h1 className="text-3xl font-black text-slate-900">Minh bạch tài chính</h1>
          <p className="text-slate-500 text-sm mt-2 font-semibold">
            Học Từ Thiện cam kết công khai toàn bộ thông tin về các khoản quyên góp và sử dụng quỹ.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : !data ? (
          <div className="text-sm text-rose-500 bg-rose-50 p-4 rounded-xl border border-rose-100">
            Không thể tải dữ liệu. Vui lòng thử lại sau.
          </div>
        ) : (
          <>
            {/* Key stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  label: "Tổng quyên góp",
                  value: formatCurrency(data.totalRaised),
                  icon: LuDollarSign,
                  color: "text-blue-600",
                  bg: "bg-blue-50",
                },
                {
                  label: "Giao dịch thành công",
                  value: data.totalCompleted.toString(),
                  icon: LuCheck,
                  color: "text-emerald-600",
                  bg: "bg-emerald-50",
                },
                {
                  label: "Tháng có dữ liệu",
                  value: data.monthlyStats.length.toString(),
                  icon: LuTrendingUp,
                  color: "text-purple-600",
                  bg: "bg-purple-50",
                },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div
                  key={label}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center gap-4"
                >
                  <div className={`${bg} ${color} p-3 rounded-xl flex-shrink-0`}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold">{label}</p>
                    <p className="text-xl font-black text-slate-900 mt-0.5">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Monthly chart */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="text-sm font-black text-slate-500 uppercase tracking-wider mb-4">
                Quyên góp theo tháng (12 tháng gần nhất)
              </h2>
              <div className="h-64">
                <MonthlyBarChart data={data.monthlyStats} />
              </div>
            </div>

            {/* Recent payments */}
            {data.recentPayments.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="text-sm font-black text-slate-500 uppercase tracking-wider mb-4">
                  Giao dịch gần đây
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left py-2 pr-4 font-black text-slate-400 uppercase tracking-wide">
                          Ngày
                        </th>
                        <th className="text-right py-2 pr-4 font-black text-slate-400 uppercase tracking-wide">
                          Số tiền
                        </th>
                        <th className="text-left py-2 font-black text-slate-400 uppercase tracking-wide">
                          Mô tả
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentPayments.map((p) => (
                        <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <td className="py-3 pr-4 text-slate-500 font-semibold">
                            {p.paidAt ? new Date(p.paidAt).toLocaleDateString("vi-VN") : "—"}
                          </td>
                          <td className="py-3 pr-4 text-right font-black text-emerald-700">
                            {formatCurrency(Number(p.amount))}
                          </td>
                          <td className="py-3 text-slate-500 font-semibold truncate max-w-[200px]">
                            {p.description || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <p className="text-xs text-slate-400 text-center font-semibold">
              Dữ liệu được cập nhật theo thời gian thực. Thông tin cá nhân được ẩn danh hoàn toàn để bảo vệ quyền riêng tư.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
