"use client";

import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from "react";
import { httpClient } from "@/core/api/client";
import { LuPlus, LuPencil, LuTrash2, LuX, LuCheck } from "react-icons/lu";

interface Campaign {
  id?: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  targetAmount: number;
  raisedAmount?: number;
  startDate?: string;
  endDate?: string;
  status: "active" | "paused" | "completed";
}

const EMPTY: Campaign = {
  title: "",
  description: "",
  thumbnailUrl: "",
  targetAmount: 0,
  startDate: "",
  endDate: "",
  status: "active",
};

export default function AdminCampaignsPage() {
  const tExtracted = useTranslations('Extracted.appAdminCampaignsPage');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Campaign>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await httpClient.get<any>("/v1/campaigns?limit=100");
      setCampaigns(res?.data || res || []);
    } catch {
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...editing,
        targetAmount: Number(editing.targetAmount),
        startDate: editing.startDate || null,
        endDate: editing.endDate || null,
      };
      if (editing.id) {
        await httpClient.patch(`/v1/campaigns/${editing.id}`, payload);
      } else {
        await httpClient.post("/v1/campaigns", payload);
      }
      setFormOpen(false);
      setEditing(EMPTY);
      fetch();
    } catch {
      alert(tExtracted('luuThatBaiVuiLongThuLai'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await httpClient.delete(`/v1/campaigns/${id}`);
      setDeleteId(null);
      fetch();
    } catch {
      alert(tExtracted('xoaThatBai'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900">{tExtracted('quanLyChienDichThienNguyen')}</h1>
          <p className="text-slate-500 text-sm mt-1">{tExtracted('taoVaQuanLyCacChienDichGay')}</p>
        </div>
        <button
          onClick={() => { setEditing(EMPTY); setFormOpen(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all cursor-pointer border-0 shadow-sm"
        >
          <LuPlus size={16} />
          {tExtracted('taoChienDich')}</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wide">
                <th className="text-left p-4">{tExtracted('tieuDe')}</th>
                <th className="text-right p-4">{tExtracted('mucTieu')}</th>
                <th className="text-right p-4">{tExtracted('daThu')}</th>
                <th className="text-center p-4">{tExtracted('trangThai')}</th>
                <th className="text-right p-4">{tExtracted('thaoTac')}</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 && (
                <tr><td colSpan={5} className="text-center py-10 text-slate-400 text-sm">{tExtracted('chuaCoChienDichNao')}</td></tr>
              )}
              {campaigns.map((c: any) => (
                <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-semibold text-slate-800">{c.title}</td>
                  <td className="p-4 text-right text-slate-600">{Number(c.targetAmount).toLocaleString("vi-VN")}{tExtracted('d')}</td>
                  <td className="p-4 text-right text-emerald-600 font-bold">{Number(c.raisedAmount || 0).toLocaleString("vi-VN")}{tExtracted('d')}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      c.status === "active" ? "bg-emerald-50 text-emerald-700" : c.status === "completed" ? "bg-slate-100 text-slate-500" : "bg-amber-50 text-amber-700"
                    }`}>{c.status}</span>
                  </td>
                  <td className="p-4 text-right flex items-center justify-end gap-2">
                    <button onClick={() => { setEditing(c); setFormOpen(true); }} className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 cursor-pointer border-0 bg-transparent transition-colors">
                      <LuPencil size={14} />
                    </button>
                    <button onClick={() => setDeleteId(c.id)} className="p-2 rounded-lg hover:bg-rose-50 text-rose-500 cursor-pointer border-0 bg-transparent transition-colors">
                      <LuTrash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl w-full max-w-lg mx-4 p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-slate-900">{editing.id ? tExtracted('capNhatChienDich') : tExtracted('taoChienDichMoi')}</h2>
              <button onClick={() => setFormOpen(false)} className="p-2 rounded-xl hover:bg-slate-100 cursor-pointer border-0 bg-transparent text-slate-400">
                <LuX size={16} />
              </button>
            </div>
            {[
              { label: tExtracted('tieuDe2'), key: "title", type: "text" },
              { label: tExtracted('moTa'), key: "description", type: "textarea" },
              { label: tExtracted('urlAnhBia'), key: "thumbnailUrl", type: "text" },
              { label: tExtracted('mucTieuDong'), key: "targetAmount", type: "number" },
              { label: tExtracted('ngayBatDau'), key: "startDate", type: "date" },
              { label: tExtracted('ngayKetThuc'), key: "endDate", type: "date" },
            ].map(({ label, key, type }) => (
              <div key={key} className="flex flex-col gap-1">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wide">{label}</label>
                {type === "textarea" ? (
                  <textarea
                    value={(editing as any)[key] || ""}
                    onChange={(e) => setEditing({ ...editing, [key]: e.target.value })}
                    className="border border-slate-200 rounded-xl p-3 text-sm outline-none focus:border-blue-500 resize-none min-h-[80px]"
                  />
                ) : (
                  <input
                    type={type}
                    value={(editing as any)[key] || ""}
                    onChange={(e) => setEditing({ ...editing, [key]: e.target.value })}
                    className="border border-slate-200 rounded-xl p-3 text-sm outline-none focus:border-blue-500"
                  />
                )}
              </div>
            ))}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wide">{tExtracted('trangThai')}</label>
              <select
                value={editing.status}
                onChange={(e) => setEditing({ ...editing, status: e.target.value as any })}
                className="border border-slate-200 rounded-xl p-3 text-sm outline-none focus:border-blue-500 bg-white cursor-pointer"
              >
                <option value="active">{tExtracted('active')}</option>
                <option value="paused">{tExtracted('paused')}</option>
                <option value="completed">{tExtracted('completed')}</option>
              </select>
            </div>
            <div className="flex gap-3 justify-end mt-2">
              <button onClick={() => setFormOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 cursor-pointer border-0 bg-transparent">{tExtracted('huy')}</button>
              <button
                onClick={handleSave}
                disabled={saving || !editing.title.trim()}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-5 py-2 rounded-xl transition-all cursor-pointer border-0 disabled:opacity-50"
              >
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <LuCheck size={14} />}
                {tExtracted('luu')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl w-full max-w-sm mx-4 p-6 flex flex-col gap-4">
            <h2 className="font-black text-slate-900">{tExtracted('xacNhanXoa')}</h2>
            <p className="text-sm text-slate-500">{tExtracted('banCoChacMuonXoaChienDichNay')}</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm font-bold text-slate-500 cursor-pointer border-0 bg-transparent">{tExtracted('huy')}</button>
              <button onClick={() => handleDelete(deleteId)} className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm px-5 py-2 rounded-xl transition-all cursor-pointer border-0">
                <LuTrash2 size={14} />
                {tExtracted('xoa')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
