import { useTranslations } from 'next-intl';
import React from "react";
import Link from "next/link";
import { Icon } from "@/core/ui";

interface MentorshipPaginationProps {
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  currentPage: number;
  searchParams: Record<string, string>;
  itemsLength: number;
}

export const MentorshipPagination = ({
  meta,
  currentPage,
  searchParams,
  itemsLength,
}: MentorshipPaginationProps) => {
  const tExtracted = useTranslations('Extracted.appPublicMentorshipComponentsMentorshipPagination');
  const { totalPages, total } = meta;

  const getPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, val]) => {
      if (val && key !== "page") params.set(key, val);
    });
    params.set("page", pageNumber.toString());
    return `/mentorship?${params.toString()}`;
  };

  if (totalPages <= 1) return null;

  // Tạo danh sách trang với ellipsis
  const getPageNumbers = (): (number | "...")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "...")[] = [1];
    if (currentPage > 3) pages.push("...");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  const pageNumbers = getPageNumbers();
  const startItem = (currentPage - 1) * meta.limit + 1;
  const endItem = Math.min(currentPage * meta.limit, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 bg-white rounded-2xl border border-slate-100 shadow-sm mt-8">
      {/* Info */}
      <p className="text-xs text-slate-400 font-medium">
        {tExtracted('showing')}{" "}
        <span className="text-slate-700 font-semibold">
          {startItem}–{endItem}
        </span>{" "}
        {tExtracted('of')}{" "}
        <span className="text-slate-700 font-semibold">{total}</span> {tExtracted('mentors')}</p>

      {/* Page controls */}
      <div className="flex items-center gap-1.5">
        {/* Prev */}
        {currentPage > 1 ? (
          <Link
            href={getPageUrl(currentPage - 1)}
            className="no-underline"
            aria-label={tExtracted('previousPage')}
          >
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300 transition-all duration-150">
              <Icon name="ChevronLeft" size={14} />
            </span>
          </Link>
        ) : (
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl border border-slate-100 text-slate-300 cursor-not-allowed">
            <Icon name="ChevronLeft" size={14} />
          </span>
        )}

        {/* Page numbers */}
        {pageNumbers.map((p, idx) =>
          p === "..." ? (
            <span
              key={`ellipsis-${idx}`}
              className="inline-flex items-center justify-center w-8 h-8 text-slate-400 text-xs font-medium select-none"
            >
              …
            </span>
          ) : (
            <Link key={p} href={getPageUrl(p)} className="no-underline">
              <span
                className={`inline-flex items-center justify-center w-8 h-8 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  currentPage === p
                    ? "bg-primary text-white shadow-md shadow-primary/25 scale-105"
                    : "text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200"
                }`}
              >
                {p}
              </span>
            </Link>
          )
        )}

        {/* Next */}
        {currentPage < totalPages ? (
          <Link
            href={getPageUrl(currentPage + 1)}
            className="no-underline"
            aria-label={tExtracted('nextPage')}
          >
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300 transition-all duration-150">
              <Icon name="ChevronRight" size={14} />
            </span>
          </Link>
        ) : (
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl border border-slate-100 text-slate-300 cursor-not-allowed">
            <Icon name="ChevronRight" size={14} />
          </span>
        )}
      </div>
    </div>
  );
};
