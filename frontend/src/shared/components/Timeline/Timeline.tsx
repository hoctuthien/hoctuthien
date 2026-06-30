import { useTranslations } from 'next-intl';
import React from 'react';
import { LuCheck } from 'react-icons/lu';
import { cn } from '@/core/utils/cn';

export type TimelineStatus = 'completed' | 'active' | 'upcoming' | 'future';

export interface TimelineItem {
  id: string;
  title: string;
  description: string;
  status: TimelineStatus;
  icon?: React.ReactNode;
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ items, className }) => {
  const tExtracted = useTranslations('Extracted.sharedComponentsTimelineTimeline');
  return (
    <div className={cn('flex flex-col p-6 bg-[#F1F7FF] rounded-[32px] max-w-[380px] font-sans antialiased', className)}>
      <h2 className="text-[22px] font-bold text-[#3b60c0] mb-8 tracking-tight">{tExtracted('connectionLifecycle')}</h2>
      <div className="flex flex-col">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <div key={item.id} className="flex gap-6 group">
              <div className="relative flex flex-col items-center">
                {!isLast && (
                  <div className="absolute top-10 bottom-0 w-[4px] bg-[#C1D4F5]" />
                )}
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all duration-500 border-[2px]',
                  item.status === 'completed' && 'bg-[#386641] border-[#386641] text-white shadow-md shadow-[#386641]/10',
                  item.status === 'active' && 'bg-[#3b60c0] border-[#3b60c0] text-white shadow-[0_0_15px_rgba(59,96,192,0.2)]',
                  item.status === 'upcoming' && 'bg-white border-[#3b60c0] text-[#3b60c0] shadow-sm',
                  item.status === 'future' && 'bg-[#F3F4F6] border-[#E5E7EB] text-[#9CA3AF]'
                )}>
                  <div className="scale-[0.8]">
                    {item.icon || (item.status === 'completed' ? <LuCheck size={24} strokeWidth={3} /> : null)}
                  </div>
                </div>
              </div>
              <div className="pt-1.5 pb-10">
                <h4 className={cn(
                  'text-[15px] font-bold uppercase tracking-wider mb-0.5 leading-none',
                  item.status === 'future' ? "text-[#9CA3AF]" : "text-[#1e293b]"
                )}>
                  {item.title}
                </h4>
                <p className={cn(
                  'text-[13px] font-medium leading-relaxed',
                  item.status === 'future' ? "text-[#9CA3AF]/70" : "text-[#64748b]"
                )}>
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


