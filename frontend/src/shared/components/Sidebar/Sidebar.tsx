import React from 'react';
import { cn } from '@/shared/lib/utils';

interface SidebarProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ children, header, footer, className }) => {
  return (
    <aside className={cn(
      'w-[280px] h-full bg-sidebar-surface p-6 px-4 flex flex-col gap-2 border-r border-border-subtle font-sans',
      className
    )}>
      {header && <div className="mb-4">{header}</div>}
      <nav className="flex-1 flex flex-col gap-1 overflow-y-auto">
        {children}
      </nav>
      {footer && <div className="mt-auto pt-4 border-t border-border-subtle">{footer}</div>}
    </aside>
  );
};
