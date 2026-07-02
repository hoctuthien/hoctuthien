'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { bugReportGateway, type BugReport } from '@/core/gateway/bugReportGateway';
import { Button } from '@/core/ui';
import { SeverityBadge } from './components/SeverityBadge';
import { StatusBadge } from './components/StatusBadge';
import { UpdateModal } from './components/UpdateModal';
import {
  LuBug,
  LuCheck,
  LuX,
  LuClock,
  LuRefreshCw,
  LuUser,
  LuCalendar,
  LuFileText,
  LuTriangle,
  LuTriangleAlert,
  LuTrash2,
} from 'react-icons/lu';

export function BugReportsClient() {
  const tExtracted = useTranslations('Extracted.appAdminBugReportsBugReportsClient');  const t = useTranslations('Admin.bugReports');
  const [reports, setReports] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedReport, setSelectedReport] = useState<BugReport | null>(null);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const FILTER_OPTIONS = [
    { value: 'all', label: t('filterAll') },
    { value: 'open', label: t('filterOpen') },
    { value: 'in_progress', label: t('filterInProgress') },
    { value: 'resolved', label: t('filterResolved') },
    { value: 'closed', label: t('filterClosed') },
  ];

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await bugReportGateway.getAll();
      const data = Array.isArray(res) ? res : res?.data ?? [];
      setReports(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || t('loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('deleteConfirm'))) return;
    try {
      await bugReportGateway.removeById(id);
      showToast("success", t('deleteSuccess'));
      fetchReports();
    } catch {
      showToast("error", t('deleteError'));
    }
  };

  const filteredReports =
    filterStatus === 'all' ? reports : reports.filter((r) => r.status === filterStatus);

  const counts = {
    all: reports.length,
    open: reports.filter((r) => r.status === 'open').length,
    in_progress: reports.filter((r) => r.status === 'in_progress').length,
    resolved: reports.filter((r) => r.status === 'resolved').length,
    closed: reports.filter((r) => r.status === 'closed').length,
  };

  const criticalCount = reports.filter((r) => r.severity === 'critical').length;
  const highCount = reports.filter((r) => r.severity === 'high').length;

  const formatDate = (iso?: string) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
      {selectedReport && (
        <UpdateModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onUpdated={() => {
            showToast("success", t('updateSuccess'));
            fetchReports();
          }}
        />
      )}

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center">
            <LuBug className="text-violet-600" size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">{t('title')}</h1>
            <p className="text-slate-500 text-sm">
              {t('subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: t('statTotal'), value: counts.all, color: "from-slate-700 to-slate-800", icon: <LuFileText size={18} className="text-white/70" /> },
          { label: t('statPending'), value: counts.open, color: "from-violet-500 to-violet-600", icon: <LuClock size={18} className="text-white/70" /> },
          { label: t('statCritical'), value: criticalCount, color: "from-red-500 to-rose-600", icon: <LuTriangleAlert size={18} className="text-white/70" /> },
          { label: t('statResolved'), value: counts.resolved, color: "from-emerald-500 to-emerald-600", icon: <LuCheck size={18} className="text-white/70" /> },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`bg-gradient-to-br ${stat.color} rounded-2xl p-5 text-white shadow-lg`}
          >
            <div className="flex items-center justify-between mb-2">
              {stat.icon}
            </div>
            <p className="text-white/70 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
            <p className="text-3xl font-black mt-0.5">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Warning Banner for critical/high */}
      {(criticalCount > 0 || highCount > 0) && (
        <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
          <LuTriangle size={20} className="text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700 font-semibold">
            {criticalCount > 0 && highCount > 0
              ? t('warningBanner', { criticalCount, highCount })
              : criticalCount > 0
              ? t('warningBannerCriticalOnly', { criticalCount })
              : t('warningBannerHighOnly', { highCount })}
          </p>
        </div>
      )}

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
        <Button
          onClick={fetchReports}
          variant="outline"
          label={t('reload')}
          iconLeft={<LuRefreshCw size={14} className={loading ? "animate-spin" : ''} />}
          size="sm"
          className="ml-auto rounded-xl"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3">
            <LuRefreshCw size={32} className="animate-spin text-violet-500" />
            <p className="text-slate-500 text-sm font-medium">{t('loadingText')}</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <LuTriangleAlert size={36} className="text-red-400 mx-auto mb-3" />
          <p className="text-red-700 font-semibold">{error}</p>
          <button
            onClick={fetchReports}
            className="mt-4 px-5 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors cursor-pointer"
          >
            {t('reload')}
          </button>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center shadow-sm">
          <LuBug size={48} className="text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-semibold text-lg">{t('noReports')}</p>
          <p className="text-slate-400 text-sm mt-1">
            {filterStatus === 'all'
              ? t('emptyDesc')
              : t('emptyDescFilter', { status: FILTER_OPTIONS.find((o) => o.value === filterStatus)?.label || '' })}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all overflow-hidden"
            >
              {/* Critical accent bar */}
              {report.severity === 'critical' && (
                <div className="h-0.5 bg-gradient-to-r from-red-500 to-rose-500" />
              )}

              <div className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Left: Icon */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                    report.severity === 'critical'
                      ? "bg-red-100"
                      : report.severity === 'high'
                      ? "bg-orange-100"
                      : "bg-slate-100"
                  }`}>
                    <LuBug
                      className={
                        report.severity === 'critical'
                          ? "text-red-600"
                          : report.severity === 'high'
                          ? "text-orange-600"
                          : "text-slate-500"
                      }
                      size={18}
                    />
                  </div>

                  {/* Center: Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <StatusBadge status={report.status} />
                      <SeverityBadge severity={report.severity} />
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 mb-1 leading-snug">
                      {report.title}
                    </h3>

                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-2">
                      {report.description}
                    </p>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                      {report.userId && (
                        <span className="flex items-center gap-1">
                          <LuUser size={11} />
                          {tExtracted('user')}{' '}
                          <code className="font-mono text-slate-600">{report.userId.slice(0, 8)}…</code>
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <LuCalendar size={11} />
                        {formatDate(report.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <Button
                      onClick={() => setSelectedReport(report)}
                      variant="primary"
                      label={t('process')}
                      size="sm"
                      className="rounded-xl px-4 text-xs font-bold"
                    />
                    <Button
                      onClick={() => handleDelete(report.id || '')}
                      variant="danger"
                      label={<LuTrash2 size={14} />}
                      className="!p-2.5 rounded-xl !h-10 !w-10 !min-w-0"
                    />
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
