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
          "relative flex items-center justify-between px-4 mx-3 my-1 py-3.5 cursor-pointer transition-all duration-300 select-none group rounded-xl",
          isActive ? "bg-[#DDEBFF]" : "hover:bg-surface-variant/40",
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
                isActive ? "text-[#2D89FF]" : "text-text-muted group-hover:text-primary"
              )}
            >
              {icon}
            </span>
          )}
          <span
            className={cn(
              "text-[15px] font-semibold transition-colors duration-300",
              isActive ? "text-[#2D89FF]" : "text-text-body group-hover:text-primary"
            )}
          >
            {label}
          </span>
        </div>

        {suffix && (
          <span className={cn(
            "flex items-center justify-center transition-colors duration-300 mr-2",
            isActive ? "text-[#2D89FF]" : "text-text-muted group-hover:text-primary"
          )}>
            {suffix}
          </span>
        )}
      </div>
    );
  }
);

SidebarItem.displayName = "SidebarItem";
