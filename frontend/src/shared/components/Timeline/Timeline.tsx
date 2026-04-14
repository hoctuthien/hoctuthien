import React from 'react';
import { LuCheck } from 'react-icons/lu';
import { cn } from '@/shared/lib/utils';

export interface TimelineItem {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'active' | 'pending';
  icon?: React.ReactNode;
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ items, className }) => {
  return (
    <div className={cn('flex flex-col gap-6 p-4 font-sans', className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <div key={item.id} className="flex gap-6 min-h-[80px]">
            <div className="relative flex flex-col items-center">
              {!isLast && (
                <div className={cn(
                  'absolute top-10 bottom-[-32px] w-0.5 bg-border',
                  item.status === 'completed' && 'bg-secondary'
                )} />
              )}
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center bg-surface border-2 border-border z-[1] transition-all duration-300',
                item.status === 'completed' && 'bg-secondary border-secondary text-text-inverse',
                item.status === 'active' && 'bg-primary border-primary text-text-inverse shadow-[0_0_0_8px_rgba(0,91,191,0.1)]',
                item.status === 'pending' && 'bg-surface-variant text-text-disabled border-border-subtle'
              )}>
                {item.icon || (item.status === 'completed' ? <LuCheck size={18} /> : null)}
              </div>
            </div>
            <div className="pt-1">
              <h4 className="text-body-sm font-black uppercase text-text-heading mb-0.5 tracking-wide">{item.title}</h4>
              <p className="text-caption text-text-muted">{item.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
