import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { bugReportGateway, type BugReport, type BugReportSeverity, type BugReportStatus } from '@/core/gateway/bugReportGateway';
import { Modal } from '@/shared/components/Modal';
import { Button, Select } from '@/core/ui';
import { LuBug, LuChevronDown, LuMonitor } from 'react-icons/lu';

interface UpdateModalProps {
  report: BugReport;
  onClose: () => void;
  onUpdated: () => void;
}

export function UpdateModal({ report, onClose, onUpdated }: UpdateModalProps) {
  const tExtracted = useTranslations('Extracted.appAdminBugReportsComponentsUpdateModal');  const t = useTranslations('Admin.bugReports');
  const [status, setStatus] = useState<BugReportStatus>(report.status || 'open');
  const [severity, setSeverity] = useState<BugReportSeverity>(report.severity || 'medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeviceInfo, setShowDeviceInfo] = useState(false);

  const SEVERITY_SELECT_OPTIONS = [
    { value: 'low', label: `🔵 ${t('severityLow')}` },
    { value: 'medium', label: `🟡 ${t('severityMedium')}` },
    { value: 'high', label: `🟠 ${t('severityHigh')}` },
    { value: 'critical', label: `🔴 ${t('severityCritical')}` },
  ];

  const STATUS_SELECT_OPTIONS = [
    { value: 'open', label: `⏳ ${t('statusOpen')}` },
    { value: 'in_progress', label: `🔄 ${t('statusInProgress')}` },
    { value: 'resolved', label: `✅ ${t('statusResolved')}` },
    { value: 'closed', label: `🗄️ ${t('statusClosed')}` },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await bugReportGateway.updateById(report.id || '', { status, severity });
      onUpdated();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || t('updateError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      showCloseButton={!loading}
      containerClassName="max-w-md overflow-hidden !rounded-[24px]"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0D1A33] to-[#1e3a5f] px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
            <LuBug size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-white font-black text-base leading-tight">{t('modalTitle')}</h2>
            <p className="text-white/50 text-xs mt-0.5 truncate max-w-[280px]">{report.title}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Report content (read-only) */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            {t('descriptionLabel')}
          </label>
          <p className="text-sm text-slate-700 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 leading-relaxed">
            {report.description}
          </p>
        </div>

        {report.stepsToReproduce && (
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              {t('stepsLabel')}
            </label>
            <pre className="text-xs text-slate-700 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 whitespace-pre-wrap font-mono">
              {report.stepsToReproduce}
            </pre>
          </div>
        )}

        {/* Device Info accordion */}
        {report.deviceInfo && Object.keys(report.deviceInfo).length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => setShowDeviceInfo(!showDeviceInfo)}
              className="flex items-center gap-2 text-xs text-slate-500 font-bold hover:text-slate-700 transition-colors cursor-pointer"
            >
              <LuMonitor size={14} />
              {t('deviceInfoLabel')}
              <LuChevronDown size={12} className={`transition-transform ${showDeviceInfo ? "rotate-180" : ''}`} />
            </button>
            {showDeviceInfo && (
              <div className="mt-2 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 space-y-1">
                {Object.entries(report.deviceInfo).map(([k, v]) => (
                  <p key={k} className="text-xs text-slate-600 font-mono">
                    <span className="text-slate-400">{k}:</span> {String(v)}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        <Select
          label={t('severityLabel')}
          options={SEVERITY_SELECT_OPTIONS}
          value={severity}
          onChange={(val) => setSeverity(val as BugReportSeverity)}
        />

        <Select
          label={t('statusLabel')}
          options={STATUS_SELECT_OPTIONS}
          value={status}
          onChange={(val) => setStatus(val as BugReportStatus)}
        />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-medium">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <Button
            variant="outline"
            label={t('cancel')}
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          />
          <Button
            variant="primary"
            type="submit"
            label={loading ? t('saving') : t('save')}
            loading={loading}
            className="flex-1"
          />
        </div>
      </form>
    </Modal>
  );
}
