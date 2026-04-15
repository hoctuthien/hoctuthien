import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline' | 'text';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  label: string;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: cn(
    "bg-primary text-white font-bold",
    "shadow-[0_4px_6px_-4px_#005BBF,0_10px_15px_-3px_#005BBF]",
    "hover:bg-primary-dark hover:shadow-lg transition-all active:scale-95"
  ),
  secondary: cn(
    "bg-secondary text-white font-bold",
    "shadow-[0_4px_6px_-4px_#006E2C,0_10px_15px_-3px_#006E2C]",
    "hover:bg-secondary-dark hover:shadow-lg transition-all active:scale-95"
  ),
  danger: cn(
    "bg-red-600 text-white font-bold",
    "shadow-[0_4px_6px_-4px_rgba(220,38,38,0.4),0_10px_15px_-3px_rgba(220,38,38,0.4)]",
    "hover:bg-red-700 hover:shadow-lg transition-all active:scale-95"
  ),
  outline: "bg-transparent text-primary border-primary border-2 hover:bg-primary/5 active:scale-95",
  text: "bg-transparent text-primary hover:underline hover:text-primary-dark active:scale-95",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "text-sm px-5 py-2 h-10",
  md: "text-base px-8 py-3 h-12",
  lg: "text-base px-10 py-4 h-[56px]",
};

export const Button = ({
  variant = "primary",
  size = "md",
  label,
  disabled = false,
  loading = false,
  fullWidth = false,
  iconLeft,
  iconRight,
  onClick,
  type = "button",
  className = "",
}: ButtonProps) => {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-[Montserrat] rounded-full transition-all duration-300 outline-none select-none",
        "disabled:opacity-50 disabled:pointer-events-none disabled:grayscale",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        loading && "cursor-wait",
        className
      )}
      disabled={isDisabled}
      onClick={onClick}
      aria-busy={loading}
      aria-disabled={isDisabled}
    >
      {loading && (
        <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin flex-shrink-0" />
      )}
      {!loading && iconLeft && (
        <span className="inline-flex items-center flex-shrink-0">{iconLeft}</span>
      )}
      <span className="leading-tight">{label}</span>
      {!loading && iconRight && (
        <span className="inline-flex items-center flex-shrink-0">{iconRight}</span>
      )}
    </button>
  );
};
