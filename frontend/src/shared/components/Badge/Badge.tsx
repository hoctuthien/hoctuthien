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
  primary: 'bg-primary-fixed text-primary-dark',
  success: 'bg-[#89FA9B] text-[#005320]',
  warning: 'bg-[#FFDEA0] text-[#5C4300]', 
  error: 'bg-red-100 text-red-700',
  growth: 'bg-secondary-fixed text-secondary-dark',
  neutral: 'bg-surface-variant text-text-muted',
};

const dotStyles: Record<BadgeVariant, string> = {
  primary: 'bg-primary',
  success: 'bg-secondary',
  warning: 'bg-[#5C4300]',
  error: 'bg-red-600',
  growth: 'bg-secondary',
  neutral: 'bg-text-muted',
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
      <span className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-[-0.05em]',
        variantStyles[variant]
      )}>
        {icon && <span className="mr-1 inline-flex text-inherit">{icon}</span>}
        {children}
      </span>
      {dot && (
        <span className={cn(
          'absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-surface',
          dotStyles[variant]
        )} />
      )}
      {count !== undefined && (
        <span className="absolute -top-2 -right-2 bg-guidance-red text-surface text-[10px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-1 border-2 border-surface">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </div>
  );
};
