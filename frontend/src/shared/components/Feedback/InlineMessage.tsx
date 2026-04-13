import React from 'react';
import { IoInformationCircle, IoCheckmarkCircle, IoWarning, IoAlertCircle } from 'react-icons/io5';

export type InlineMessageVariant = 'info' | 'success' | 'warning' | 'error';

interface InlineMessageProps {
  variant?: InlineMessageVariant;
  title: string;
  description?: string;
  className?: string;
}

const variantStyles: Record<InlineMessageVariant, string> = {
  success: 'bg-[#86f898]/30 border-[#006e2c]',
  info: 'bg-[#d8e2ff]/30 border-[#1b4fbf]',
  warning: 'bg-[#ffdea0]/30 border-[#795900]',
  error: 'bg-[#ffdad6]/30 border-[#ba1a1a]',
};

const iconConfig = {
  success: {
    icon: <IoCheckmarkCircle size={20} />,
    color: 'text-[#006e2c]'
  },
  info: {
    icon: <IoInformationCircle size={20} />,
    color: 'text-[#1b4fbf]'
  },
  warning: {
    icon: <IoWarning size={20} />,
    color: 'text-[#795900]'
  },
  error: {
    icon: <IoAlertCircle size={20} />,
    color: 'text-[#ba1a1a]'
  },
};

export const InlineMessage = ({ 
  variant = 'info', 
  title, 
  description, 
  className = '' 
}: InlineMessageProps) => {
  const config = iconConfig[variant];
  return (
    <div className={`flex items-center gap-4 p-4 sm:p-5 rounded-2xl border-l-[3.5px] shadow-sm transition-all duration-300 ${variantStyles[variant]} ${className}`}>
      <div className={`mt-0.5 shrink-0 ${config.color}`}>
        {config.icon}
      </div>
      <div className="flex flex-col gap-1">
        <h5 className="text-[14px] font-bold text-[#181C20] leading-tight tracking-tight">{title}</h5>
        {description && (
          <p className="text-[12px] font-medium text-[#414754]/80 leading-relaxed font-sans">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};
