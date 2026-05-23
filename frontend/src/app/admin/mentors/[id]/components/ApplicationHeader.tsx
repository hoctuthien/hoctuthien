import React from "react";
import Link from "next/link";
import { Badge, Icon, Button } from "@/core/ui";

interface ApplicationHeaderProps {
  name: string;
  statusLabel: string;
  statusVariant: "warning" | "primary" | "success" | "error" | "neutral";
  titleTranslation: string;
  detailTranslation: string;
  approveLabel: string;
  rejectLabel: string;
}

export function ApplicationHeader({
  name,
  statusLabel,
  statusVariant,
  titleTranslation,
  detailTranslation,
  approveLabel,
  rejectLabel,
}: ApplicationHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/mentors">
          <Button
            variant="outline"
            label={<Icon name="ArrowLeft" size={18} />}
            className="!p-2.5 !rounded-xl text-slate-400 hover:text-slate-900 border-slate-200"
          />
        </Link>
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>{titleTranslation}</span>
            <Icon name="ChevronRight" size={12} />
            <span className="text-slate-600">{detailTranslation}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-950 mt-1 flex items-center gap-3">
            {name}
            <Badge variant={statusVariant} className="!px-3 !py-1 !text-xs !rounded-full">
              {statusLabel}
            </Badge>
          </h1>
        </div>
      </div>

      {/* Action Buttons for Processing */}
      <div className="flex items-center gap-3 shrink-0">
        <Button
          label={rejectLabel}
          variant="outline"
          iconLeft={<Icon name="X" size={14} />}
          className="!px-5 !py-2.5 !rounded-xl !text-xs text-rose-600 hover:bg-rose-50 border-rose-200 hover:border-rose-300 font-bold"
        />
        <Button
          label={approveLabel}
          variant="primary"
          iconLeft={<Icon name="Check" size={14} />}
          className="!px-6 !py-2.5 !rounded-xl !text-xs font-bold shadow-lg shadow-primary/20"
        />
      </div>
    </div>
  );
}
