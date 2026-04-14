import React from 'react';
import { cn } from '@/shared/lib/utils';

interface SidebarGroupProps {
  title?: string;
  children: React.ReactNode;
  isExpanded?: boolean;
  className?: string;
}

export const SidebarGroup: React.FC<SidebarGroupProps> = ({
  title,
  children,
  isExpanded = true,
  className
}) => {
  return (
    <div className={cn('flex flex-col', className)}>
      {title && (
        <h3 className="m-8 mb-2 ml-4 text-[0.75rem] font-bold text-text-muted uppercase tracking-[0.15em] opacity-80">
          {title}
        </h3>
      )}
      <div className="flex flex-col gap-0.5">
        {children}
      </div>
    </div>
  );
};

export const SidebarCollapse: React.FC<{ children: React.ReactNode; isExpanded: boolean }> = ({ 
  children, 
  isExpanded 
}) => {
  if (!isExpanded) return null;
  
  return (
    <div className="mt-1 pl-5 flex flex-col gap-[2px] bg-sidebar-surface-sub rounded-b-md">
      {children}
    </div>
  );
};
