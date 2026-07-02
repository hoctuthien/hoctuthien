import { useTranslations } from 'next-intl';
import React from "react";
import { Card } from "@/core/ui/Card";
import { Icon } from "@/core/ui";

interface ApplicationBioAndNoteProps {
  bio: string;
  note?: string;
  bioLabel: string;
  noteLabel: string;
  noNoteMessage: string;
}

export function ApplicationBioAndNote({
  bio,
  note,
  bioLabel,
  noteLabel,
  noNoteMessage,
}: ApplicationBioAndNoteProps) {
  const tExtracted = useTranslations('Extracted.appAdminMentorsIdComponentsApplicationBioAndNote');
  return (
    <div className="space-y-8">
      {/* Biography Card */}
      <Card className="p-8 border-none shadow-sm hover:shadow-md transition-all space-y-6">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-3">
          <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
            <Icon name="User" size={18} />
          </span>
          {bioLabel}
        </h3>
        <div className="relative pl-6 border-l-4 border-primary/20 py-1">
          <span className="absolute -top-3 left-1 text-slate-100 text-6xl font-serif select-none pointer-events-none">
            “
          </span>
          <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line italic relative z-10">
            {bio || tExtracted('khongCoDoanGioiThieuBanThan')}
          </p>
        </div>
      </Card>

      {/* Ghi chú từ ứng viên Card */}
      <Card className="p-8 border-none shadow-sm hover:shadow-md transition-all space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Icon name="MessageSquare" size={16} className="text-slate-400" />
          {noteLabel}
        </h3>
        <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 text-slate-600 text-sm leading-relaxed whitespace-pre-line">
          {note || noNoteMessage}
        </div>
      </Card>
    </div>
  );
}
