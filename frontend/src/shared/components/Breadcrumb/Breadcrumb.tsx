import React from "react";
import { cn } from "@/core/utils/cn";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  isPill?: boolean;
  isEllipsis?: boolean;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
}

export const Breadcrumb = ({
  items,
  separator = <span className="text-text-disabled text-[12px] font-light">/</span>,
  className
}: BreadcrumbProps) => {
  return (
    <nav className={cn('flex py-2 font-sans', className)} aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center p-0 m-0 gap-2 list-none">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          if (item.isEllipsis) {
            return (
              <li key={index} className="flex items-center gap-2 text-body-sm">
                <span className="text-text-muted font-bold cursor-help">...</span>
                {separator}
              </li>
            );
          }

          return (
            <li key={index} className="flex items-center gap-2 text-body-sm">
              {!isLast && item.href ? (
                <a 
                  href={item.href} 
                  className="inline-flex items-center gap-1.5 text-primary no-underline font-medium transition-opacity hover:opacity-80 hover:underline"
                >
                  {item.icon && (
                    <span className="flex items-center justify-center text-[1.1em]">{item.icon}</span>
                  )}
                  {item.label}
                </a>
              ) : (
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 text-primary font-bold cursor-default',
                    item.isPill && 'bg-primary text-text-inverse px-4 py-1.5 rounded-full text-[13px] shadow-sm'
                  )}
                  aria-current="page"
                >
                  {item.icon && (
                    <span className="flex items-center justify-center text-[1.1em]">{item.icon}</span>
                  )}
                  {item.label}
                </span>
              )}
              {!isLast && separator}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
