"use client";

import React from "react";
import { cn } from "@/core/utils/cn";

interface SidebarProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  children,
  header,
  footer,
  className,
}) => {
  return (
    <aside
      className={cn(
        "w-[340px] h-screen bg-background flex flex-col transition-all duration-300",
        "border-r border-surface-variant",
        className
      )}
    >
      {header && (
        <div className="pt-8 pb-4">
          {header}
        </div>
      )}

      <nav className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col">
        {children}
      </nav>

      {footer && (
        <div className="p-6 border-t border-surface-variant">
          {footer}
        </div>
      )}
    </aside>
  );
};
