import React from "react";
import "./breadcrumb.css";

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
}

export const Breadcrumb = ({
  items,
  separator = <span className="htt-breadcrumb__separator">/</span>,
}: BreadcrumbProps) => {
  return (
    <nav className="htt-breadcrumb-nav" aria-label="Breadcrumb">
      <ol className="htt-breadcrumb-list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          if (item.isEllipsis) {
            return (
              <li key={index} className="htt-breadcrumb-item">
                <span className="htt-breadcrumb-ellipsis">...</span>
                {separator}
              </li>
            );
          }

          return (
            <li key={index} className="htt-breadcrumb-item">
              {!isLast && item.href ? (
                <a href={item.href} className="htt-breadcrumb-link">
                  {item.icon && (
                    <span className="htt-breadcrumb-icon">{item.icon}</span>
                  )}
                  {item.label}
                </a>
              ) : (
                <span
                  className={`htt-breadcrumb-current ${item.isPill ? "htt-breadcrumb--pill" : ""}`}
                  aria-current="page"
                >
                  {item.icon && (
                    <span className="htt-breadcrumb-icon">{item.icon}</span>
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
