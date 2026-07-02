import React from 'react';
import { IoRibbon, IoSchool, IoShieldCheckmark } from 'react-icons/io5';

export type BadgeType = 'verified' | 'top-rated' | 'expert';

/**
 * Props for the IdentityBadge component
 */
interface IdentityBadgeProps {
  /** The type/category of the badge */
  type: BadgeType;
  /** Primary label for the badge */
  title: string;
  /** Secondary label or description underneath the title */
  subtitle: string;
  /** Additional CSS classes */
  className?: string;
}

const config = {
  verified: {
    icon: <IoShieldCheckmark size={24} />,
    bgColor: '#D8E2FF',
    textColor: '#005BBF',
  },
  'top-rated': {
    icon: <IoRibbon size={24} />,
    bgColor: '#89FA9B',
    textColor: '#005320',
  },
  expert: {
    icon: <IoSchool size={24} />,
    bgColor: '#FFDEA0',
    textColor: '#795900',
  },
};

/**
 * A specialized card component used to showcase user achievements, verification status, or expertise.
 */
export const IdentityBadge = ({ type, title, subtitle, className = '' }: IdentityBadgeProps) => {  const item = config[type];

  return (
    <div className={`flex items-center gap-4 p-4 rounded-[24px] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-slate-100/50 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300 group max-w-sm ${className}`}>
      <div
        style={{
          backgroundColor: item.bgColor,
          color: item.textColor,
          width: "40px",
          height: "40px"
        }}
        className="flex items-center justify-center rounded-full shrink-0 transition-all duration-500 group-hover:scale-105"
      >
        {item.icon}
      </div>
      <div className="flex flex-col">
        <h4 className="text-[14px] font-black text-[#181C20] leading-tight tracking-tight">
          {title}
        </h4>
        <p className="text-[10px] font-black text-[#727785] tracking-widest uppercase mt-1 opacity-70">
          {subtitle}
        </p>
      </div>
    </div>
  );
};
