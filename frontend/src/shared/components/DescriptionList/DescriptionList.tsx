import React from 'react';
import { cn } from '@/shared/lib/utils';

export interface DescriptionItem {
  id: string;
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}

export type DescriptionListVariant = 'basic' | 'bordered' | 'vertical' | 'bordered-vertical';

interface DescriptionListProps {
  items: DescriptionItem[];
  variant?: DescriptionListVariant;
  columns?: number;
  className?: string;
}

export const DescriptionList: React.FC<DescriptionListProps> = ({
  items,
  variant = 'basic',
  columns = 2,
  className
}) => {
  const containerClasses = cn(
    'grid gap-6 font-sans',
    variant === 'basic' && 'grid-cols-[repeat(var(--columns,2),1fr)]',
    variant === 'bordered' && 'grid-cols-[repeat(var(--columns,2),1fr)] gap-0 border border-border-subtle rounded-lg overflow-hidden bg-surface',
    variant === 'vertical' && 'grid-cols-1 gap-0',
    variant === 'bordered-vertical' && 'grid-cols-[repeat(var(--columns,2),1fr)] gap-6 p-6 bg-surface rounded-2xl border border-border-subtle relative before:content-[""] before:absolute before:left-0 before:top-6 before:bottom-6 before:w-[3px] before:bg-primary before:rounded-r-md',
    className
  );

  return (
    <div 
      className={containerClasses}
      style={{ '--columns': columns } as React.CSSProperties}
    >
      {items.map((item) => (
        <div 
          key={item.id} 
          className={cn(
            'flex flex-col gap-1',
            variant === 'bordered' && 'p-4 border border-border-subtle',
            variant === 'vertical' && 'py-4 border-b border-border-subtle last:border-none'
          )}
        >
          <div className="flex items-center gap-2">
            {variant === 'bordered-vertical' && item.icon && (
              <span className="text-primary flex items-center">{item.icon}</span>
            )}
            <span className="text-caption font-black text-primary uppercase tracking-wide">
              {item.label}
            </span>
          </div>
          <div className={cn(
            'text-body font-semibold text-text-heading',
            variant === 'bordered-vertical' && 'bg-[#F3F6FA] p-2.5 px-3.5 rounded-md mt-1'
          )}>
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
};
