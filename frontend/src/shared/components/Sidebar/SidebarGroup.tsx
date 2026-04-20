"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/core/utils/cn";
import { SidebarItem } from "./SidebarItem";

interface SidebarGroupProps {
  title?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  isCollapsible?: boolean;
  defaultOpen?: boolean;
  className?: string;
  isActive?: boolean;
}

export const SidebarGroup: React.FC<SidebarGroupProps> = ({
  title,
  icon,
  children,
  isCollapsible = false,
  defaultOpen = false,
  className,
  isActive = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (!isCollapsible) {
    return (
      <div className={cn("flex flex-col", className)}>
        {title && (
          <h2 className="px-6 py-6 text-[1.75rem] font-semibold text-text-heading font-sans uppercase tracking-tight">
            {title}
          </h2>
        )}
        <div className="flex flex-col">{children}</div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col transition-all duration-300", className)}>
      <SidebarItem
        icon={icon}
        label={title || ""}
        onClick={() => setIsOpen(!isOpen)}
        isActive={isActive}
        indicator={false}
        suffix={
          isOpen ? (
            <ChevronDown size={20} />
          ) : (
            <ChevronRight size={20} />
          )
        }
      />
      
      <div
        className={cn(
          "overflow-hidden transition-all duration-500 ease-in-out",
          isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="flex flex-col bg-surface-variant/20">
          {children}
        </div>
      </div>
    </div>
  );
};
