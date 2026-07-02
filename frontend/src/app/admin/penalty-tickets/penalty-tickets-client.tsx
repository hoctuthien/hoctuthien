'use client';

import { useTranslations } from 'next-intl';
import React, { useState, useEffect, useCallback } from 'react';
import { penaltyTicketGateway } from '@/core/gateway';
import {
  LuTriangleAlert,
  LuCheck,
  LuX,
  LuClock,
  LuBan,
  LuRefreshCw,
  LuChevronDown,
  LuUser,
  LuCalendar,
  LuFileText,
} from 'react-icons/lu';

type TicketStatus = 'pending' | 'rejected' | 'penalty' | 'cancel';

interface PenaltyTicket {
  id: string;
  userId: string;
  reportedById?: string | null;
  updatedBy?: string | null;
  reason: string;
  pointsDeducted: number;
  evidenceUrl?: string | null;
  metadata?: Record<string, any>;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
}

const STATUS_CONFIG: Record<
  TicketStatus,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  pending: {
    label: 'Đang chờ',
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
    icon: <LuClock size={13} />,
  },
  penalty: {
    label: 'Phạt',
    color: 'text-red-700',
    bg: 'bg-red-50 border-red-200',
    icon: <LuTriangleAlert size={13} />,
  },
  rejected: {
    label: 'Từ chối',
    color: 'text-slate-600',
    bg: 'bg-slate-50 border-slate-200',
    icon: <LuX size={13} />,
  },
  cancel: {
    label: 'Hủy bỏ',
    color: 'text-gray-500',
    bg: 'bg-gray-50 border-gray-200',
    icon: <LuBan size={13} />,
  },
};

function StatusBadge({ status }: { status: TicketStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG['pending'];
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

interface UpdateModalProps {
  ticket: PenaltyTicket;
  onClose: () => void;
  onUpdated: () => void;
}

function UpdateModal({ ticket, onClose, onUpdated }: UpdateModalProps) {
  const tExtracted = useTranslations('Extracted.appAdminPenaltyTicketsPenaltyTicketsClient');
  const [status, setStatus] = useState<TicketStatus>(ticket.status);
  const [pointsDeducted, setPointsDeducted] = useState(ticket.pointsDeducted);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await penaltyTicketGateway.updateById(ticket.id, { status, pointsDeducted });
      onUpdated();
      onClose();
    } catch (err: any) {
      setError(err?.message || tExtracted('capNhatThatBai'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-5">
          <h2 className="text-white font-black text-lg">{tExtracted('capNhatBaoCaoViPham')}</h2>
          <p className="text-slate-300 text-xs mt-1 truncate">{tExtracted('id')}{ticket.id}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Reason (read-only) */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              {tExtracted('lyDoBaoCao')}</label>
            <p className="text-sm text-slate-700 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
              {ticket.reason}
            </p>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              {tExtracted('trangThaiXuLy')}</label>
            <div className="relative">
              <select
                id="modal-status-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as TicketStatus)}
                className="w-full appearance-none bg-white border-2 border-slate-200 rounded-xl px-4 py-3 pr-10 text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
              >
                <option value="pending">{tExtracted('dangChoPending')}</option>
                <option value="penalty">{tExtracted('phatPenalty')}</option>
                <option value="rejected">{tExtracted('tuChoiRejected')}</option>
                <option value="cancel">{tExtracted('huyBoCancel')}</option>
              </select>
              <LuChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                size={16}
              />
            </div>
          </div>

          {/* Points */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              {tExtracted('diemTruPhat')}</label>
            <input
              id="modal-points-input"
              type="number"
              min={0}
              value={pointsDeducted}
              onChange={(e) => setPointsDeducted(Number(e.target.value))}
              className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
            />
            {status === 'penalty' && pointsDeducted === 0 && (
              <p className="text-xs text-amber-600 mt-1 font-medium">
                {tExtracted('trangThaiPenaltyNhungChuaNhapDiemTru')}</p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-medium">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border-2 border-slate-200 text-slate-600 font-bold text-sm rounded-xl py-3 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              {tExtracted('huy')}</button>
            <button
              id="modal-submit-btn"
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-sm rounded-xl py-3 hover:opacity-90 transition-opacity disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <LuRefreshCw size={14} className="animate-spin" />
              ) : (
                <LuCheck size={14} />
              )}
              {loading ? tExtracted('dangLuu') : tExtracted('luuThayDoi')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'pending', label: 'Đang chờ' },
  { value: 'penalty', label: 'Phạt' },
  { value: 'rejected', label: 'Từ chối' },
  { value: 'cancel', label: 'Hủy bỏ' },
];

export function PenaltyTicketsClient() {
  const tExtracted = useTranslations('Extracted.appAdminPenaltyTicketsPenaltyTicketsClient');
  const [tickets, setTickets] = useState<PenaltyTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<PenaltyTicket | null>(null);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  );

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await penaltyTicketGateway.getAll();
      // handle both array and wrapped response
      const data = Array.isArray(res) ? res : res?.data ?? [];
      setTickets(data);
    } catch (err: any) {
      setError(err?.message || tExtracted('khongTheTaiDanhSachBaoCaoVi'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleUpdated = () => {
    showToast("success", tExtracted('capNhatBaoCaoViPhamThanhCong'));
    fetchTickets();
  };

  const filteredTickets =
    filterStatus === 'all' ? tickets : tickets.filter((t) => t.status === filterStatus);

  const counts = {
    all: tickets.length,
    pending: tickets.filter((t) => t.status === 'pending').length,
    penalty: tickets.filter((t) => t.status === 'penalty').length,
    rejected: tickets.filter((t) => t.status === 'rejected').length,
    cancel: tickets.filter((t) => t.status === 'cancel').length,
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="max-w-6xl mx-auto">
      {/* Toast */}
      {toastMsg && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border text-sm font-semibold animate-in slide-in-from-bottom duration-300 ${
            toastMsg.type === 'success'
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {toastMsg.type === 'success' ? <LuCheck size={16} /> : <LuX size={16} />}
          {toastMsg.text}
        </div>
      )}

      {/* Update Modal */}
      {selectedTicket && (
        <UpdateModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdated={handleUpdated}
        />
      )}

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
            <LuTriangleAlert className="text-red-600" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">{tExtracted('baoCaoViPham')}</h1>
            <p className="text-slate-500 text-sm">
              {tExtracted('quanLyCacBaoCaoVangMatVi')}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: tExtracted('tong'), value: counts.all, color: "from-slate-600 to-slate-700" },
          { label: tExtracted('choXuLy'), value: counts.pending, color: "from-amber-500 to-amber-600" },
          { label: tExtracted('daPhat'), value: counts.penalty, color: "from-red-500 to-red-600" },
          {
            label: tExtracted('tuChoiHuy'),
            value: counts.rejected + counts.cancel,
            color: "from-slate-400 to-slate-500",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`bg-gradient-to-br ${stat.color} rounded-2xl p-5 text-white shadow-lg`}
          >
            <p className="text-white/70 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
            <p className="text-3xl font-black mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            id={`filter-${opt.value}`}
            onClick={() => setFilterStatus(opt.value)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              filterStatus === opt.value
                ? "bg-slate-900 text-white shadow-md"
                : "bg-white text-slate-600 border border-slate-200 hover:border-slate-400"
            }`}
          >
            {opt.label}
            <span
              className={`ml-2 text-xs px-1.5 py-0.5 rounded-md ${
                filterStatus === opt.value ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
              }`}
            >
              {counts[opt.value as keyof typeof counts] ?? counts.all}
            </span>
          </button>
        ))}
        <button
          id="refresh-btn"
          onClick={fetchTickets}
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-white border border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-all cursor-pointer"
        >
          <LuRefreshCw size={14} className={loading ? "animate-spin" : ''} />
          {tExtracted('taiLai')}</button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3">
            <LuRefreshCw size={32} className="animate-spin text-blue-500" />
            <p className="text-slate-500 text-sm font-medium">{tExtracted('dangTaiDuLieu')}</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <LuTriangleAlert size={36} className="text-red-400 mx-auto mb-3" />
          <p className="text-red-700 font-semibold">{error}</p>
          <button
            onClick={fetchTickets}
            className="mt-4 px-5 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors cursor-pointer"
          >
            {tExtracted('thuLai')}</button>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center shadow-sm">
          <LuFileText size={48} className="text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-semibold text-lg">{tExtracted('khongCoBaoCaoNao')}</p>
          <p className="text-slate-400 text-sm mt-1">
            {filterStatus === 'all'
              ? tExtracted('heThongChuaCoBaoCaoViPham')
              : `Không có báo cáo ở trạng thái "${FILTER_OPTIONS.find((o) => o.value === filterStatus)?.label}".`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all overflow-hidden"
            >
              <div className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Left: Icon */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <LuTriangleAlert className="text-slate-500" size={18} />
                  </div>

                  {/* Center: Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <StatusBadge status={ticket.status} />
                      {ticket.pointsDeducted > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full uppercase tracking-wide">
                          -{ticket.pointsDeducted} {tExtracted('diem')}</span>
                      )}
                    </div>

                    <p className="text-sm font-semibold text-slate-800 mb-2 leading-relaxed">
                      {ticket.reason}
                    </p>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <LuUser size={11} />
                        {tExtracted('nguoiBiBaoCao')}{' '}
                        <code className="font-mono text-slate-600">{ticket.userId.slice(0, 8)}…</code>
                      </span>
                      {ticket.reportedById && (
                        <span className="flex items-center gap-1">
                          <LuUser size={11} />
                          {tExtracted('nguoiBaoCao')}{' '}
                          <code className="font-mono text-slate-600">
                            {ticket.reportedById.slice(0, 8)}…
                          </code>
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <LuCalendar size={11} />
                        {formatDate(ticket.createdAt)}
                      </span>
                    </div>

                    {/* Metadata preview */}
                    {ticket.metadata && Object.keys(ticket.metadata).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {Object.entries(ticket.metadata).map(([key, val]) => (
                          <span
                            key={key}
                            className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                          >
                            {key}: {String(val)}
                          </span>
                        ))}
                      </div>
                    )}

                    {ticket.evidenceUrl && (
                      <a
                        href={ticket.evidenceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-2 text-xs text-blue-600 hover:underline font-medium"
                      >
                        {tExtracted('xemBangChung')}</a>
                    )}
                  </div>

                  {/* Right: Action */}
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <button
                      id={`edit-ticket-${ticket.id}`}
                      onClick={() => setSelectedTicket(ticket)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      {tExtracted('xuLy')}</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
