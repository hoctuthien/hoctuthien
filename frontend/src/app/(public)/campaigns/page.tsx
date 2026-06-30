"use client";

import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { LuTarget, LuCalendar, LuTrendingUp } from "react-icons/lu";
import { apiService } from "@/core/api/base";
import { Breadcrumb } from "@shared";

interface Campaign {
  id: string;
  title: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  targetAmount: number;
  raisedAmount: number;
  startDate?: string | null;
  endDate?: string | null;
  status: "active" | "paused" | "completed";
}

function ProgressBar({ raised, target }: { raised: number; target: number }) {
  const pct = target > 0 ? Math.min((raised / target) * 100, 100) : 0;
  return (
    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
      <div
        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-700"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

const breadcrumbItems = [
  { label: "Trang chủ", href: "/" },
  { label: "Chiến dịch thiện nguyện" },
];

export default function CampaignsPage() {
  const tExtracted = useTranslations('Extracted.appPublicCampaignsPage');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService
      .get<any>("/campaigns?status=active&limit=50")
      .then((res) => setCampaigns(res.data?.data || res.data || []))
      .catch(() => setCampaigns([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-10 flex flex-col gap-8">
        <Breadcrumb items={breadcrumbItems} />

        <div>
          <h1 className="text-3xl font-black text-slate-900">{tExtracted('chienDichThienNguyen')}</h1>
          <p className="text-slate-500 text-sm mt-2 font-semibold">
            {tExtracted('cungChungTayDongGopVaoCacChien')}</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse h-64" />
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="py-16 bg-white rounded-2xl border border-slate-100 text-center">
            <div className="text-4xl mb-3">🌱</div>
            <p className="text-slate-500 text-sm font-semibold">{tExtracted('chuaCoChienDichNaoDangHoatDong')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {campaigns.map((campaign) => {
              const pct = campaign.targetAmount > 0
                ? Math.min(((campaign.raisedAmount / campaign.targetAmount) * 100), 100).toFixed(0)
                : "0";
              return (
                <div
                  key={campaign.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all"
                >
                  <div className="h-40 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                    {campaign.thumbnailUrl ? (
                      <img src={campaign.thumbnailUrl} alt={campaign.title} className="w-full h-full object-cover" />
                    ) : (
                      <LuTarget size={48} className="text-blue-300" />
                    )}
                  </div>
                  <div className="p-5 flex flex-col gap-3 flex-1">
                    <h2 className="font-black text-slate-900 text-sm leading-snug line-clamp-2">{campaign.title}</h2>
                    {campaign.description && (
                      <p className="text-xs text-slate-500 font-semibold line-clamp-2">{campaign.description}</p>
                    )}
                    <div className="flex flex-col gap-1.5 mt-auto">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-blue-600">{Number(campaign.raisedAmount).toLocaleString("vi-VN")}{tExtracted('d')}</span>
                        <span className="text-slate-400">/ {Number(campaign.targetAmount).toLocaleString("vi-VN")}{tExtracted('d2')}{pct}%)</span>
                      </div>
                      <ProgressBar raised={Number(campaign.raisedAmount)} target={Number(campaign.targetAmount)} />
                    </div>
                    {(campaign.startDate || campaign.endDate) && (
                      <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                        <LuCalendar size={11} />
                        {campaign.startDate ? new Date(campaign.startDate).toLocaleDateString("vi-VN") : ""}
                        {campaign.endDate ? ` – ${new Date(campaign.endDate).toLocaleDateString("vi-VN")}` : ""}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
