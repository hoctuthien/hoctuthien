"use client";

import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from "react";
import { LuTrendingUp, LuDollarSign, LuCheck } from "react-icons/lu";
import { apiService } from "@/core/api/base";
import { formatCurrency as formatVndCurrency } from "@/shared/utils/format";
import { Breadcrumb } from "@shared";

interface MonthlyStat {
  month: string;
  amount: number;
}

interface RecentPayment {
  id: string;
  amount: number;
  currency: string;
  paidAt: string | null;
  description: string | null;
}

interface TransparencyData {
  totalRaised: number;
  totalCompleted: number;
  monthlyStats: MonthlyStat[];
  recentPayments: RecentPayment[];
}

function toFiniteNumber(value: unknown) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function formatCurrency(amount: unknown) {
  return formatVndCurrency(toFiniteNumber(amount));
}

function unwrapTransparencyResponse(response: unknown): unknown {
  const raw = isRecord(response) && "data" in response ? response.data : response;
  const rawData = isRecord(raw) ? raw.data : undefined;
  const nested = Array.isArray(rawData) ? rawData[0] : rawData;
  return nested ?? raw;
}

function normalizeTransparencyData(response: unknown): TransparencyData {
  const raw = unwrapTransparencyResponse(response);
  const monthlyStats = isRecord(raw) && Array.isArray(raw.monthlyStats) ? raw.monthlyStats : [];
  const recentPayments = isRecord(raw) && Array.isArray(raw.recentPayments) ? raw.recentPayments : [];

  return {
    totalRaised: toFiniteNumber(isRecord(raw) ? raw.totalRaised : undefined),
    totalCompleted: toFiniteNumber(isRecord(raw) ? raw.totalCompleted : undefined),
    monthlyStats: monthlyStats.map((item) => ({
      month: String(isRecord(item) ? (item.month ?? "") : ""),
      amount: toFiniteNumber(isRecord(item) ? item.amount : undefined),
    })),
    recentPayments: recentPayments.map((payment, index) => ({
      id: String(isRecord(payment) ? (payment.id ?? `payment-${index}`) : `payment-${index}`),
      amount: toFiniteNumber(isRecord(payment) ? payment.amount : undefined),
      currency: String(isRecord(payment) ? (payment.currency ?? "VND") : "VND"),
      paidAt: isRecord(payment) && typeof payment.paidAt === "string" ? payment.paidAt : null,
      description: isRecord(payment) && typeof payment.description === "string" ? payment.description : null,
    })),
  };
}

function MonthlyBarChart({ data }: { data: MonthlyStat[] }) {
  const tExtracted = useTranslations('Extracted.appPublicTransparencyPage');
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-full text-sm text-slate-400">{tExtracted('chuaCoDuLieu')}</div>;
  }

  const max = Math.max(...data.map((d) => d.amount), 1);

  return (
    <div className="flex items-end gap-2 h-full w-full px-2 pb-2 pt-2">
      {data.map((d, index) => {
        const amount = toFiniteNumber(d.amount);
        const pct = (amount / max) * 100;

        return (
          <div key={`${d.month}-${index}`} className="flex flex-col items-center gap-1 flex-1 min-w-0">
            <span className="text-[9px] font-bold text-slate-500 hidden md:block truncate w-full text-center">
              {formatCurrency(amount)}
            </span>
            <div
              title={`${d.month}: ${formatCurrency(amount)}`}
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

export default function TransparencyClient() {
  const tExtracted = useTranslations('Extracted.appPublicTransparencyPage');
  const [data, setData] = useState<TransparencyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService
      .get<unknown>("/admin/transparency", { cache: "no-store" })
      .then((res) => setData(normalizeTransparencyData(res)))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 flex flex-col gap-8">
        <Breadcrumb items={breadcrumbItems} />

        <div>
          <h1 className="text-3xl font-black text-slate-900">{tExtracted('minhBachTaiChinh')}</h1>
          <p className="text-slate-500 text-sm mt-2 font-semibold">
            {tExtracted('hocTuThienCamKetCongKhaiToan')}</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : !data ? (
          <div className="text-sm text-rose-500 bg-rose-50 p-4 rounded-xl border border-rose-100">
            {tExtracted('khongTheTaiDuLieuVuiLongThu')}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  label: tExtracted('tongQuyenGop'),
                  value: formatCurrency(data.totalRaised),
                  icon: LuDollarSign,
                  color: "text-blue-600",
                  bg: "bg-blue-50",
                },
                {
                  label: tExtracted('giaoDichThanhCong'),
                  value: data.totalCompleted.toString(),
                  icon: LuCheck,
                  color: "text-emerald-600",
                  bg: "bg-emerald-50",
                },
                {
                  label: tExtracted('thangCoDuLieu'),
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

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="text-sm font-black text-slate-500 uppercase tracking-wider mb-4">
                {tExtracted('quyenGopTheoThang12ThangGanNhat')}</h2>
              <div className="h-64">
                <MonthlyBarChart data={data.monthlyStats} />
              </div>
            </div>

            {data.recentPayments.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="text-sm font-black text-slate-500 uppercase tracking-wider mb-4">
                  {tExtracted('giaoDichGanDay')}</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left py-2 pr-4 font-black text-slate-400 uppercase tracking-wide">
                          {tExtracted('ngay')}</th>
                        <th className="text-right py-2 pr-4 font-black text-slate-400 uppercase tracking-wide">
                          {tExtracted('soTien')}</th>
                        <th className="text-left py-2 font-black text-slate-400 uppercase tracking-wide">
                          {tExtracted('moTa')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentPayments.map((p) => (
                        <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <td className="py-3 pr-4 text-slate-500 font-semibold">
                            {p.paidAt ? new Date(p.paidAt).toLocaleDateString("vi-VN") : "-"}
                          </td>
                          <td className="py-3 pr-4 text-right font-black text-emerald-700">
                            {formatCurrency(p.amount)}
                          </td>
                          <td className="py-3 text-slate-500 font-semibold truncate max-w-[200px]">
                            {p.description || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <p className="text-xs text-slate-400 text-center font-semibold">
              {tExtracted('duLieuDuocCapNhatTheoThoiGian')}</p>
          </>
        )}
      </div>
    </div>
  );
}
