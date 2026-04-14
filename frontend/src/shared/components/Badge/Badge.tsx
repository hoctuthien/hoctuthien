import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'growth' | 'neutral';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: BadgeVariant;
  icon?: React.ReactNode;
  dot?: boolean;
  count?: number;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  primary: 'bg-[#E0E7FF] text-[#3730A3]',
  success: 'bg-[#BBF7D0] text-[#166534]',
  warning: 'bg-[#FEF3C7] text-[#92400E]', 
  error: 'bg-[#FEE2E2] text-[#991B1B]',
  growth: 'bg-[#DCFCE7] text-[#166534]',
  neutral: 'bg-[#F1F5F9] text-[#475569]',
};

const dotStyles: Record<BadgeVariant, string> = {
  primary: 'bg-[#3730A3]',
  success: 'bg-[#166534]',
  warning: 'bg-[#92400E]',
  error: 'bg-[#B91C1C]',
  growth: 'bg-[#166534]',
  neutral: 'bg-[#475569]',
};

export const Badge = ({
  children,
  variant = 'primary',
  icon,
  dot,
  count,
  className
}: BadgeProps) => {
  return (
    <div className={cn('relative inline-flex items-center', className)}>
      {icon && <span className="inline-flex text-[#475569]">{icon}</span>}
      {children && (
        <span className={cn(
          'inline-flex items-center px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-tight',
          variantStyles[variant],
          icon && 'ml-2'
        )}>
          {children}
        </span>
      )}
      {dot && (
        <div className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className={cn(
            'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
            dotStyles[variant]
          )} />
          <span className={cn(
            'relative inline-flex rounded-full h-3 w-3 border-2 border-white',
            dotStyles[variant]
          )} />
        </div>
      )}
      {count !== undefined && (
        <span className={cn(
          'absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 text-[10px] font-bold text-white border-[1.5px] border-white',
          count === 12 ? 'bg-[#B91C1C]' : 'bg-[#2563EB]'
        )}>
          {count > 99 ? '99+' : count}
        </span>
      )}
    </div>
  );
};


