import React from 'react';
import { useTranslations } from 'next-intl';
import { type BugReportSeverity } from '@/core/gateway/bugReportGateway';

export const SEVERITY_STYLE: Record<BugReportSeverity, { color: string; bg: string; dot: string }> = {
  low: {
    color: 'text-sky-700',
    bg: 'bg-sky-50 border-sky-200',
    dot: 'bg-sky-500',
  },
  medium: {
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
    dot: 'bg-amber-500',
  },
  high: {
    color: 'text-orange-700',
    bg: 'bg-orange-50 border-orange-200',
    dot: 'bg-orange-500',
  },
  critical: {
    color: 'text-red-700',
    bg: 'bg-red-50 border-red-200',
    dot: 'bg-red-500',
  },
};

export function SeverityBadge({ severity }: { severity?: BugReportSeverity }) {
  const t = useTranslations('Admin.bugReports');
  if (!severity) return null;
  const cfg = SEVERITY_STYLE[severity];
  
  const labelKey = `severity${severity.charAt(0).toUpperCase() + severity.slice(1)}` as 'severityLow' | 'severityMedium' | 'severityHigh' | 'severityCritical';

  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {t(labelKey)}
    </span>
  );
}
