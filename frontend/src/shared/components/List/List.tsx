import React from 'react';
import { Avatar } from "@ui";
import { cn } from '@/core/utils/cn';

export interface ListItemProps {
  id: string;
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
  avatar?: string;
  actions?: React.ReactNode;
}

interface ListProps {
  items: ListItemProps[];
  title?: string;
  className?: string;
}

export const List: React.FC<ListProps> = ({ items, title, className }) => {
  return (
    <div className={cn('flex flex-col p-6 bg-[#F1F7FF] rounded-[24px] w-full max-w-[420px] font-sans antialiased', className)}>
      {title && (
        <h4 className="text-[11px] font-black text-[#3b60c0] mb-6 uppercase tracking-[0.15em]">
          {title}
        </h4>
      )}
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div 
            key={item.id} 
            className="flex items-center justify-between p-3.5 pl-4 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-white/50 transition-all duration-300 hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-4 flex-1">
              {item.avatar ? (
                <Avatar src={item.avatar} alt={item.title} className="w-11 h-11 rounded-lg border-none" />
              ) : (
                <div className="w-11 h-11 rounded-full bg-[#E0ECFC] flex items-center justify-center text-[#3b60c0]">
                  {item.icon}
                </div>
              )}
              <div className="flex flex-col flex-1 min-w-0">
                <h4 className="text-[15px] font-bold text-[#1e293b] leading-tight truncate">{item.title}</h4>
                <p className="text-[13px] text-[#64748b] truncate">{item.subtitle}</p>
              </div>
            </div>
            {item.actions && (
              <div className="flex items-center gap-1.5 ml-4 flex-shrink-0">
                {item.actions}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};


