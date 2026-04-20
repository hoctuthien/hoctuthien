import React from 'react';
import { LuCheck, LuX, LuTimer } from 'react-icons/lu';
import { cn } from '@/shared/lib/utils';

export type StepStatus = 'completed' | 'active' | 'upcoming' | 'error' | 'disabled';

export interface StepItem {
  id: string | number;
  label: string;
  description?: string;
  status: StepStatus;
  info?: string;
  icon?: React.ReactNode;
}

export interface StepsProps {
  items: StepItem[];
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const Steps: React.FC<StepsProps> = ({ items, orientation = 'horizontal', className }) => {
  const containerClass = cn(
    'w-full font-sans',
    orientation === 'horizontal' ? 'flex justify-between py-6 relative' : 'flex flex-col gap-4',
    className
  );

  const renderNode = (item: StepItem, index: number) => {
    if (item.status === 'completed') {
      return <LuCheck size={18} />;
    }
    if (item.status === 'error') {
      return <LuX size={18} />;
    }
    return item.icon || (index + 1);
  };

  const nodeBaseClasses = 'w-8 h-8 rounded-full flex items-center justify-center text-body-sm font-bold border-2 transition-all duration-300 relative z-[1]';
  const nodeStatusClasses = {
    completed: 'bg-primary border-primary text-text-inverse',
    active: 'bg-surface border-primary text-primary',
    upcoming: 'bg-surface border-border-default text-text-muted',
    error: 'bg-[#BA1A1A] border-[#BA1A1A] text-text-inverse',
    disabled: 'bg-surface-variant border-border-default text-text-disabled',
  };

  if (orientation === 'horizontal') {
    return (
      <div className={containerClass}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isCompleted = item.status === 'completed';

          return (
            <div 
              key={item.id} 
              className={cn(
                'flex-1 flex flex-col items-center relative min-w-[120px]',
                !isLast && 'after:content-[""] after:absolute after:top-4 after:left-[calc(50%+20px)] after:right-[calc(-50%+20px)] after:h-0.5 after:bg-border-default after:z-0 after:transition-colors after:duration-300',
                !isLast && isCompleted && 'after:bg-primary'
              )}
            >
              <div className={cn(nodeBaseClasses, nodeStatusClasses[item.status], 'mb-3')}>
                {renderNode(item, index)}
              </div>
              <div className={cn(
                'text-xs font-bold text-text-muted text-center whitespace-nowrap uppercase tracking-widest',
                item.status === 'active' && 'text-primary',
                item.status === 'error' && 'text-[#BA1A1A] font-extrabold'
              )}>
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={containerClass}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isCompletedOrActive = item.status === 'completed' || item.status === 'active';

        return (
          <div 
            key={item.id} 
            className={cn(
              'flex gap-4 relative pb-8',
              !isLast && 'before:content-[""] before:absolute before:top-8 before:left-[15px] before:bottom-0 before:w-0.5 before:bg-border-subtle',
              !isLast && isCompletedOrActive && 'before:bg-primary',
              isLast && 'pb-0'
            )}
          >
            <div className={cn(nodeBaseClasses, nodeStatusClasses[item.status])}>
              {renderNode(item, index)}
            </div>
            <div className="flex flex-col gap-1 pt-1">
              <div className={cn(
                'text-body font-bold text-text-heading transition-colors',
                item.status === 'disabled' && 'text-text-disabled'
              )}>
                {item.label}
              </div>
              {item.description && <div className="text-caption text-text-muted font-medium">{item.description}</div>}
              {item.info && (
                <div className="mt-3 p-3 px-4 bg-surface-variant rounded-md text-text-body text-caption italic max-w-[320px] leading-relaxed">
                  &ldquo;{item.info}&rdquo;
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export interface StatusPillProps {
  label: string;
  variant?: 'filled' | 'outline' | 'ghost';
  isActive?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({ label, variant = 'ghost', isActive, icon, className }) => {
  return (
    <div className={cn(
      'flex items-center gap-2 py-2.5 px-6 rounded-full text-body-sm font-bold transition-all duration-300 w-fit cursor-pointer',
      (variant === 'filled' || isActive) && !className?.includes('bg-transparent') ? 'bg-primary text-text-inverse shadow-md' : '',
      variant === 'outline' && 'bg-transparent border-2 border-primary text-primary hover:bg-primary-fixed',
      variant === 'ghost' && 'bg-transparent text-text-muted hover:text-primary',
      className
    )}>
      {icon}
      {label}
    </div>
  );
};

export interface StatusCardProps {
  title: string;
  description: string;
  status: 'completed' | 'processing';
  className?: string;
}

export const StatusCard: React.FC<StatusCardProps> = ({ title, description, status, className }) => {
  const isCompleted = status === 'completed';
  return (
    <div className={cn(
      'flex flex-col gap-3 w-60 p-5 bg-surface rounded-xl border border-border-subtle shadow-sm',
      className
    )}>
      <div className={cn(isCompleted ? 'text-secondary' : 'text-primary', 'flex')}>
        {isCompleted ? <LuCheck size={24} strokeWidth={3} /> : <LuTimer size={24} strokeWidth={3} />}
      </div>
      <div>
        <div className="font-extrabold text-text-heading">{title}</div>
        <div className="text-caption text-text-muted">{description}</div>
      </div>
    </div>
  );
};
