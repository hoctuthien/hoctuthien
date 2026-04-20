"use client";

import React from "react";
import { cn } from "@/core/utils/cn";

export interface SidebarItemProps {
  icon?: React.ReactNode;
  label: string;
  isActive?: boolean;
  isDisabled?: boolean;
  isSubItem?: boolean;
  onClick?: () => void;
  indicator?: boolean;
  suffix?: React.ReactNode;
  className?: string;
}

export const SidebarItem = React.forwardRef<HTMLDivElement, SidebarItemProps>(
  (
    {
      icon,
      label,
      isActive,
      isDisabled,
      isSubItem,
      onClick,
      indicator = true,
      suffix,
      className,
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        onClick={!isDisabled ? onClick : undefined}
        className={cn(
          "relative flex items-center justify-between px-6 py-4 cursor-pointer transition-all duration-300 select-none group w-full",
          isActive ? "bg-surface-variant" : "hover:bg-surface-variant/50",
          isDisabled && "opacity-40 cursor-not-allowed pointer-events-none",
          isSubItem && "px-8 py-3",
          className
        )}
      >
        <div className="flex items-center gap-4">
          {icon && (
            <span
              className={cn(
                "flex items-center justify-center transition-colors duration-300 w-6 h-6",
                isActive ? "text-primary" : "text-text-muted group-hover:text-primary"
              )}
            >
              {icon}
            </span>
          )}
          <span
            className={cn(
              "text-body font-medium transition-colors duration-300",
              isActive ? "text-primary" : "text-text-body group-hover:text-primary"
            )}
          >
            {label}
          </span>
        </div>

        {suffix && (
          <span className={cn(
            "flex items-center justify-center transition-colors duration-300 mr-2",
            isActive ? "text-primary" : "text-text-muted group-hover:text-primary"
          )}>
            {suffix}
          </span>
        )}

        {isActive && indicator && (
          <div className="absolute right-0 top-0 bottom-0 w-[4px] bg-primary" />
        )}
      </div>
    );
  }
);

SidebarItem.displayName = "SidebarItem";
