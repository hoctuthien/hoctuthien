import React from 'react';
import { IoInformationCircle, IoCheckmarkCircle, IoWarning, IoAlertCircle } from 'react-icons/io5';

export type NotificationVariant = 'info' | 'success' | 'warning' | 'error';

interface NotificationProps {
  variant?: NotificationVariant;
  title: string;
  description: string;
  timestamp?: string;
  className?: string;
}

const variantConfig = {
  success: {
    icon: <IoCheckmarkCircle size={22} />,
    iconBg: 'bg-[#86f898]',
    iconColor: 'text-[#00722f]',
  },
  info: {
    icon: <IoInformationCircle size={22} />,
    iconBg: 'bg-[#d8e2ff]',
    iconColor: 'text-[#004493]',
  },
  warning: {
    icon: <IoWarning size={22} />,
    iconBg: 'bg-[#ffdea0]',
    iconColor: 'text-[#000000]',
  },
  error: {
    icon: <IoAlertCircle size={22} />,
    iconBg: 'bg-[#ffdad6]',
    iconColor: 'text-[#93000a]',
  },
};

export const Notification = ({ 
  variant = 'info', 
  title, 
  description, 
  timestamp, 
  className = '' 
}: NotificationProps) => {
  const config = variantConfig[variant];
  
  return (
    <div className={`flex items-center gap-4 sm:gap-5 p-4 sm:p-6 rounded-[24px] bg-white/80 backdrop-blur-[24px] border border-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-500 group ${className}`}>
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] shadow-sm group-hover:scale-105 transition-transform duration-300 ${config.iconBg} ${config.iconColor}`}>
        {config.icon}
      </div>
      <div className="flex flex-col gap-1 flex-grow">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h4 className="text-sm font-bold text-[#181C20] tracking-tight">{title}</h4>
          {timestamp && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] whitespace-nowrap">{timestamp}</span>
          )}
        </div>
        <p className="text-[12px] font-medium text-[#414754] leading-[1.65] opacity-90">
          {description}
        </p>
      </div>
    </div>
  );
};
