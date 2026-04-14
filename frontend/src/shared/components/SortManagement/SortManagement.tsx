import React from 'react';
import { LuGripVertical, LuMaximize2 } from 'react-icons/lu';
import { cn } from '@/shared/lib/utils';

interface SortItem {
  id: string;
  index: string;
  label: string;
  isMoving?: boolean;
}

interface SortManagementProps {
  items: SortItem[];
  className?: string;
}

export const VerticalReorder: React.FC<SortManagementProps> = ({ items, className }) => {
  return (
    <div className={cn('flex flex-col gap-4 w-full max-w-[400px]', className)}>
      {items.map((item) => (
        <div 
          key={item.id} 
          className={cn(
            'flex items-center gap-3 p-3 px-5 bg-surface rounded-md shadow-sm border-[1.5px] border-border-subtle cursor-grab',
            item.isMoving && 'border-primary text-primary font-black'
          )}
        >
          <LuGripVertical className="text-border-strong" size={20} />
          <span className="text-text-disabled">{item.index}.</span>
          <span className="text-body-sm font-semibold">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

interface GridSortProps {
  items: { id: string; num: string; label: string; isActive?: boolean }[];
  className?: string;
}

export const HorizontalSort: React.FC<GridSortProps> = ({ items, className }) => {
  return (
    <div className={cn('grid grid-cols-3 gap-4', className)}>
      {items.map((item) => (
        <div 
          key={item.id} 
          className={cn(
            'bg-surface rounded-2xl p-6 border-[1.5px] border-border-subtle flex flex-col gap-6 transition-all duration-300',
            item.isActive && 'bg-[#1B4FBF] text-text-inverse border-[#1B4FBF] shadow-lg'
          )}
        >
          <div className="flex justify-between items-start">
            <span className={cn('text-[32px] font-black opacity-10 leading-none', item.isActive && 'opacity-20')}>{item.num}</span>
            {item.isActive ? <LuMaximize2 size={16} /> : <div className="w-4 h-1 bg-[#E2E8F0] rounded-sm" />}
          </div>
          <span className="text-caption font-black uppercase">{item.label}</span>
        </div>
      ))}
    </div>
  );
};
