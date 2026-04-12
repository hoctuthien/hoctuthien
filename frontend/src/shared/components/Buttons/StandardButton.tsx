"use client";

import React from "react";
import { VscLoading } from "react-icons/vsc";

export type ButtonVariant = "primary" | "secondary" | "danger" | "text" | "outline";
export type ButtonSize = "sm" | "md" | "lg";

export interface StandardButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  label: string;
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

export const StandardButton: React.FC<StandardButtonProps> = ({
  variant = "primary",
  size = "md",
  label,
  loading = false,
  iconLeft,
  iconRight,
  fullWidth = false,
  disabled,
  className = "",
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return `
          bg-primary text-white border-primary
          hover:bg-primary-matrix-hover hover:border-primary-matrix-hover
          active:bg-primary-matrix-clicked active:border-primary-matrix-clicked
          focus-visible:ring-4 focus-visible:ring-primary-surface
          disabled:bg-text-disabled disabled:border-text-disabled disabled:text-white/60
        `;
      case "secondary":
        return `
          bg-secondary text-white border-secondary
          hover:bg-secondary-matrix-hover hover:border-secondary-matrix-hover
          active:bg-secondary-matrix-clicked active:border-secondary-matrix-clicked
          focus-visible:ring-4 focus-visible:ring-secondary-surface
          disabled:bg-text-disabled disabled:border-text-disabled disabled:text-white/60
        `;
      case "danger":
        return `
          bg-guidance-red text-white border-guidance-red
          hover:bg-danger-matrix-hover hover:border-danger-matrix-hover
          active:bg-danger-matrix-clicked active:border-danger-matrix-clicked
          focus-visible:ring-4 focus-visible:ring-guidance-red-surface
          disabled:bg-text-disabled disabled:border-text-disabled disabled:text-white/60
        `;
      case "outline":
        return `
          bg-transparent text-primary border-2 border-dashed border-primary
          hover:bg-primary-light hover:border-primary-matrix-hover
          active:bg-primary-surface active:border-primary-matrix-clicked
          focus-visible:ring-4 focus-visible:ring-primary-surface
          disabled:border-text-disabled disabled:text-text-disabled
        `;
      case "text":
        return `
          bg-transparent text-primary border-transparent
          hover:text-primary-matrix-hover hover:underline
          active:text-primary-matrix-clicked
          focus-visible:ring-2 focus-visible:ring-primary-surface
          disabled:text-text-disabled
        `;
      default:
        return "";
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "sm": return "px-4 py-2 text-xs h-8";
      case "md": return "px-6 py-2.5 text-sm h-11";
      case "lg": return "px-8 py-3.5 text-base h-14";
      default: return "";
    }
  };

  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 font-bold transition-all duration-200 
        rounded-full select-none cursor-pointer outline-none border
        ${getVariantStyles()}
        ${getSizeStyles()}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      {...props}
    >
      {loading && <VscLoading className="w-4 h-4 animate-spin" />}
      {!loading && iconLeft && <span className="flex-shrink-0">{iconLeft}</span>}
      <span className="leading-tight">{label}</span>
      {!loading && iconRight && <span className="flex-shrink-0">{iconRight}</span>}
    </button>
  );
};
