import React from 'react';
import { useTranslations } from 'next-intl';
import { type BugReportStatus } from '@/core/gateway/bugReportGateway';
import { LuClock, LuRefreshCw, LuCheck, LuArchive } from 'react-icons/lu';

export const STATUS_STYLE: Record<BugReportStatus, { color: string; bg: string; icon: React.ReactNode }> = {
  open: {
    color: 'text-violet-700',
    bg: 'bg-violet-50 border-violet-200',
    icon: <LuClock size={12} />,
  },
  in_progress: {
    color: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-200',
    icon: <LuRefreshCw size={12} />,
  },
  resolved: {
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200',
    icon: <LuCheck size={12} />,
  },
  closed: {
    color: 'text-slate-600',
    bg: 'bg-slate-50 border-slate-200',
    icon: <LuArchive size={12} />,
  },
};

export function StatusBadge({ status }: { status?: BugReportStatus }) {
  const t = useTranslations('Admin.bugReports');
  if (!status) return null;
  const cfg = STATUS_STYLE[status];
  
  const labelKey = status === 'in_progress'
    ? 'statusInProgress'
    : (`status${status.charAt(0).toUpperCase() + status.slice(1)}` as 'statusOpen' | 'statusResolved' | 'statusClosed');

  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>
      {cfg.icon}
      {t(labelKey)}
    </span>
  );
}
