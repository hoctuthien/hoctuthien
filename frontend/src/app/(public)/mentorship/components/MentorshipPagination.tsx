import React from "react";
import { Button, Icon } from "@/core/ui";
import Link from "next/link";

interface MentorshipPaginationProps {
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  searchParams: Record<string, string>;
  itemsLength: number;
}

export const MentorshipPagination = ({ meta, searchParams, itemsLength }: MentorshipPaginationProps) => {
  const getPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams();
    // Copy all current params except page
    Object.entries(searchParams).forEach(([key, val]) => {
      if (val) params.set(key, val);
    });
    params.set("page", pageNumber.toString());
    return `/mentorship?${params.toString()}`;
  };

  if (meta.totalPages <= 1) return null;

  return (
    <div className="p-4 border border-slate-100 flex items-center justify-between bg-white rounded-3xl shadow-sm mt-8">
      <p className="text-xs text-slate-500">
        Showing {itemsLength} of {meta.total} mentors
      </p>
      
      <div className="flex items-center gap-1">
        {/* Prev Link */}
        {meta.page > 1 ? (
          <Link href={getPageUrl(meta.page - 1)} className="no-underline">
            <Button 
              variant="secondary" 
              label={<Icon name="ChevronLeft" size={14} />} 
              className="!p-2 !rounded-lg" 
            />
          </Link>
        ) : (
          <Button 
            variant="secondary" 
            label={<Icon name="ChevronLeft" size={14} />} 
            className="!p-2 !rounded-lg" 
            disabled
          />
        )}
        
        {/* Page numbers links */}
        {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => {
          const isCurrent = meta.page === p;
          return (
            <Link key={p} href={getPageUrl(p)} className="no-underline">
              <span
                className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                  isCurrent 
                    ? "bg-primary text-white shadow-md shadow-primary/20" 
                    : "hover:bg-slate-100 text-slate-600"
                }`}
              >
                {p}
              </span>
            </Link>
          );
        })}

        {/* Next Link */}
        {meta.page < meta.totalPages ? (
          <Link href={getPageUrl(meta.page + 1)} className="no-underline">
            <Button 
              variant="secondary" 
              label={<Icon name="ChevronRight" size={14} />} 
              className="!p-2 !rounded-lg" 
            />
          </Link>
        ) : (
          <Button 
            variant="secondary" 
            label={<Icon name="ChevronRight" size={14} />} 
            className="!p-2 !rounded-lg" 
            disabled
          />
        )}
      </div>
    </div>
  );
};
