import React from 'react';
import { cn } from '@/shared/lib/utils';

interface SidebarItemProps {
  icon?: React.ReactNode;
  label: string;
  isActive?: boolean;
  isDisabled?: boolean;
  isSubItem?: boolean;
  onClick?: () => void;
  indicator?: boolean;
  arrow?: React.ReactNode;
  isExpanded?: boolean;
  className?: string;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  isActive,
  isDisabled,
  isSubItem,
  onClick,
  indicator,
  arrow,
  isExpanded,
  className
}) => {
  return (
    <div
      className={cn(
        'relative flex items-center justify-between p-3 px-4 rounded-md cursor-pointer transition-all duration-200 select-none text-text-muted',
        'hover:bg-sidebar-item-hover hover:text-primary',
        isActive && 'bg-sidebar-item-active text-primary font-bold',
        isDisabled && 'opacity-40 cursor-not-allowed pointer-events-none',
        isSubItem && 'p-2.5 px-4 text-body-sm',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        {icon && <span className="flex items-center justify-center text-[20px]">{icon}</span>}
        <span className="text-body transition-none">{label}</span>
      </div>
      
      {arrow && (
        <span className={cn(
          'transition-transform duration-200 opacity-60',
          isExpanded && 'rotate-90'
        )}>
          {arrow}
        </span>
      )}

      {isActive && indicator && (
        <span className="absolute right-0 top-3 bottom-3 w-[3px] bg-primary rounded-l-full" />
      )}
    </div>
  );
};
