import { useTranslations } from 'next-intl';
import React from "react";
import { Avatar } from "@ui";

interface MentorCardProps {
  name: string;
  title: string;
  description: string;
  avatarSrc: string;
  onConnect?: () => void;
  onProfile?: () => void;
}

export const MentorCard: React.FC<MentorCardProps> = ({
  name,
  title,
  description,
  avatarSrc,
  onConnect,
  onProfile,
}) => {
  const tExtracted = useTranslations('Extracted.sharedComponentsMentorCardMentorCard');
  return (
    <div className="w-full bg-white rounded-[24px] p-7 shadow-[0_12px_30px_rgba(0,0,0,0.06)] max-w-[340px] transition-all duration-300 hover:shadow-[0_15px_40px_rgba(0,0,0,0.1)] select-none border border-white/50">
      <div className="flex items-center gap-4 mb-5">
        <Avatar
          src={avatarSrc}
          className="w-16 h-16 rounded-xl border-none shadow-sm flex-shrink-0"
        />
        <div className="flex flex-col gap-0.5 min-w-0">
          <h4 className="text-[18px] font-bold text-[#1e293b] m-0 leading-tight tracking-tight break-words">
            {name}
          </h4>
          <p className="text-[13px] text-[#64748b] m-0 font-medium break-words">{title}</p>
        </div>
      </div>

      <p className="text-[14px] leading-relaxed text-[#475569] mb-7 font-normal break-words">
        {description}
      </p>

      <div className="flex gap-3">
        <button
          className="flex-1 bg-[#3b60c0] text-white text-[11px] font-bold py-3 px-6 rounded-lg hover:bg-[#2d4aa0] transition-all active:scale-[0.98] uppercase tracking-[0.05em] shadow-lg shadow-blue-600/10"
          onClick={onConnect}
        >
          {tExtracted('connect')}</button>
        <button
          className="flex-1 bg-[#e2e8f0] text-[#1e293b] text-[11px] font-bold py-3 px-6 rounded-lg hover:bg-[#cbd5e1] transition-all active:scale-[0.98] uppercase tracking-[0.05em]"
          onClick={onProfile}
        >
          {tExtracted('profile')}</button>
      </div>
    </div>
  );
};
