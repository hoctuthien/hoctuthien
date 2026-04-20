import React from "react";
import {
  LuChevronLeft,
  LuChevronRight,
  LuArrowLeft,
  LuArrowRight,
  LuEllipsis,
} from "react-icons/lu";
import { cn } from "@/shared/lib/utils";

export type PaginationType = "standard" | "multi-page" | "simple";

export interface PaginationProps {
  type?: PaginationType;
  currentPage: number;
  totalPages: number;
  entriesPerPage?: number;
  onPageChange: (page: number) => void;
  onEntriesChange?: (entries: number) => void;
  entriesOptions?: number[];
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  type = "standard",
  currentPage,
  totalPages,
  entriesPerPage = 10,
  onPageChange,
  onEntriesChange,
  entriesOptions = [10, 20, 50, 100],
  className
}) => {
  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  const btnClasses = 'inline-flex items-center justify-center min-w-[36px] h-9 px-2 rounded-md border-1.5 border-border bg-surface text-text-body text-body-sm font-semibold cursor-pointer transition-all duration-150 outline-none hover:border-primary hover:text-primary hover:bg-primary-fixed disabled:opacity-50 disabled:cursor-not-allowed disabled:border-border-subtle active:translate-y-px';
  const activeBtnClasses = 'bg-primary border-primary text-text-inverse shadow-sm hover:bg-primary hover:text-text-inverse';

  const renderStandard = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 2) pages.push("dots-start");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (currentPage < totalPages - 1) pages.push("dots-end");
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }

    return (
      <div className={cn("flex items-center justify-between w-full p-4 px-6 bg-surface rounded-lg shadow-sm border border-border-subtle font-sans", className)}>
        <div className="flex items-center gap-3 text-text-muted text-body-sm font-medium">
          <span>Show</span>
          <div className="relative">
            <select
              className="appearance-none bg-surface-elevated border-1.5 border-border rounded-md px-3 pr-8 py-1.5 font-bold text-primary cursor-pointer outline-none focus:border-primary transition-colors"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23005BBF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 8px center'
              }}
              value={entriesPerPage}
              onChange={(e) => onEntriesChange?.(Number(e.target.value))}
            >
              {entriesOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <span>entries</span>
        </div>

        <div className="flex items-center gap-2">
          <button className={btnClasses} onClick={handlePrev} disabled={currentPage === 1}>
            <LuChevronLeft size={18} />
          </button>
          {pages.map((p, i) =>
            p === "dots-start" || p === "dots-end" ? (
              <span key={`dots-${i}`} className="text-text-muted px-1 flex items-center">
                <LuEllipsis size={16} />
              </span>
            ) : (
              <button
                key={p}
                className={cn(btnClasses, currentPage === p && activeBtnClasses)}
                onClick={() => onPageChange(p as number)}
              >
                {p}
              </button>
            ),
          )}
          <button className={btnClasses} onClick={handleNext} disabled={currentPage === totalPages}>
            <LuChevronRight size={18} />
          </button>
        </div>
      </div>
    );
  };

  const renderMultiPage = () => {
    return (
      <div className={cn("inline-flex items-center justify-center gap-5 p-5 px-7 bg-surface rounded-lg shadow-sm border border-outline-variant font-sans", className)}>
        <button
          className={cn(btnClasses, 'h-10 px-5 font-bold bg-surface-variant text-text-body border-none flex gap-2 rounded-sm hover:bg-border-default transition-all duration-300')}
          onClick={handlePrev}
          disabled={currentPage === 1}
        >
          <LuArrowLeft size={18} className="text-text-body" />
          Previous
        </button>
        <div className="flex gap-2.5 items-center mx-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-2 w-2 rounded-full transition-all duration-300 cursor-pointer',
                currentPage === i + 1 ? 'bg-primary' : 'bg-primary-fixed'
              )}
              onClick={() => onPageChange(i + 1)}
            />
          ))}
        </div>
        <button
          className={cn(btnClasses, 'h-10 px-5 font-bold !bg-primary !text-text-inverse border-none hover:opacity-90 flex gap-2 rounded-sm shadow-sm transition-all duration-300')}
          onClick={handleNext}
          disabled={currentPage === totalPages}
        >
          Next
          <LuArrowRight size={18} />
        </button>
      </div>
    );
  };

  const renderSimple = () => {
    return (
      <div className={cn("flex items-center justify-center gap-10 p-6 bg-surface rounded-lg shadow-sm border border-border-subtle font-sans", className)}>
        <button
          className={cn(btnClasses, 'w-11 h-11 rounded-full border-1.5 border-primary text-primary bg-transparent p-0 hover:shadow-[0_0_0_4px_var(--color-primary-fixed)]')}
          onClick={handlePrev}
          disabled={currentPage === 1}
        >
          <LuArrowLeft size={20} />
        </button>
        <div className="font-black text-body-sm tracking-widest text-text-heading uppercase">
          PAGE {currentPage.toString().padStart(2, "0")} — {totalPages.toString().padStart(2, "0")}
        </div>
        <button
          className={cn(btnClasses, 'w-11 h-11 rounded-full border-1.5 border-primary text-primary bg-transparent p-0 hover:shadow-[0_0_0_4px_var(--color-primary-fixed)]')}
          onClick={handleNext}
          disabled={currentPage === totalPages}
        >
          <LuArrowRight size={20} />
        </button>
      </div>
    );
  };

  switch (type) {
    case "multi-page": return renderMultiPage();
    case "simple": return renderSimple();
    case "standard":
    default: return renderStandard();
  }
};
