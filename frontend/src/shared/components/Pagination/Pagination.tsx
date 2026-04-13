import React from "react";
import {
  LuChevronLeft,
  LuChevronRight,
  LuArrowLeft,
  LuArrowRight,
  LuEllipsis,
} from "react-icons/lu";
import "./pagination.css";

export type PaginationType = "standard" | "multi-page" | "simple";

export interface PaginationProps {
  type?: PaginationType;
  currentPage: number;
  totalPages: number;
  entriesPerPage?: number;
  onPageChange: (page: number) => void;
  onEntriesChange?: (entries: number) => void;
  entriesOptions?: number[];
}

export const Pagination: React.FC<PaginationProps> = ({
  type = "standard",
  currentPage,
  totalPages,
  entriesPerPage = 10,
  onPageChange,
  onEntriesChange,
  entriesOptions = [10, 20, 50, 100],
}) => {
  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  const renderStandard = () => {
    const pages = [];
    const maxVisible = 3;

    // Simple pagination logic for standard
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
      <div className="pagination-container pagination-standard">
        <div className="entries-selector">
          <span>Show</span>
          <select
            value={entriesPerPage}
            onChange={(e) => onEntriesChange?.(Number(e.target.value))}
          >
            {entriesOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <span>entries</span>
        </div>

        <div className="page-list">
          <button
            className="pagination-btn"
            onClick={handlePrev}
            disabled={currentPage === 1}
          >
            <LuChevronLeft size={18} />
          </button>

          {pages.map((p, i) =>
            p === "dots-start" || p === "dots-end" ? (
              <span key={`dots-${i}`} className="dots">
                <LuEllipsis size={16} />
              </span>
            ) : (
              <button
                key={p}
                className={`pagination-btn ${currentPage === p ? "active" : ""}`}
                onClick={() => onPageChange(p as number)}
              >
                {p}
              </button>
            ),
          )}

          <button
            className="pagination-btn"
            onClick={handleNext}
            disabled={currentPage === totalPages}
          >
            <LuChevronRight size={18} />
          </button>
        </div>
      </div>
    );
  };

  const renderMultiPage = () => {
    return (
      <div className="pagination-container pagination-multi-page">
        <button
          className="pagination-btn nav-btn"
          onClick={handlePrev}
          disabled={currentPage === 1}
        >
          <LuArrowLeft className="mr-2" size={18} />
          Previous
        </button>

        <div className="status-dots">
          {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
            <div
              key={i}
              className={`dot ${currentPage === i + 1 ? "active" : ""}`}
              onClick={() => onPageChange(i + 1)}
            />
          ))}
        </div>

        <button
          className="pagination-btn nav-btn nav-btn-next"
          onClick={handleNext}
          disabled={currentPage === totalPages}
        >
          Next
          <LuArrowRight className="ml-2" size={18} />
        </button>
      </div>
    );
  };

  const renderSimple = () => {
    return (
      <div className="pagination-container pagination-simple">
        <button
          className="pagination-btn arrow-btn"
          onClick={handlePrev}
          disabled={currentPage === 1}
        >
          <LuArrowLeft size={20} />
        </button>

        <div className="page-info">
          PAGE {currentPage.toString().padStart(2, "0")} —{" "}
          {totalPages.toString().padStart(2, "0")}
        </div>

        <button
          className="pagination-btn arrow-btn"
          onClick={handleNext}
          disabled={currentPage === totalPages}
        >
          <LuArrowRight size={20} />
        </button>
      </div>
    );
  };

  switch (type) {
    case "multi-page":
      return renderMultiPage();
    case "simple":
      return renderSimple();
    case "standard":
    default:
      return renderStandard();
  }
};
