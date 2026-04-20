import React from 'react';
import { cn } from '@/shared/lib/utils';

interface SkillBarProps {
  label: string;
  level: string;
  icon: React.ReactNode;
  color?: string;
  className?: string;
}

export const SkillBar: React.FC<SkillBarProps> = ({
  label,
  level,
  icon,
  color = 'var(--color-primary)',
  className
}) => {
  return (
    <div className={cn('flex items-center gap-4 p-4 px-6 bg-surface-variant/80 rounded-xl w-full max-w-[600px] border border-border-default/20 transition-all duration-300 hover:shadow-sm', className)}>
      <div 
        className={cn(
          "flex items-center justify-center p-2 rounded-lg bg-surface shadow-xs",
          (!color || color === 'var(--color-primary)') && "text-primary"
        )} 
        style={{ color: color && color !== 'var(--color-primary)' ? color : undefined }}
      >
        {icon}
      </div>
      <div className="flex-1">
        <span className="text-body-sm font-bold text-text-heading uppercase tracking-widest">{label}</span>
      </div>
      <div 
        className={cn(
          "text-[10px] font-black text-white px-4 py-1 rounded-full uppercase tracking-widest shadow-sm",
          (!color || color === 'var(--color-primary)') && "bg-primary"
        )}
        style={{ backgroundColor: color && color !== 'var(--color-primary)' ? color : undefined }}
      >
        {level}
      </div>
    </div>
  );
};
