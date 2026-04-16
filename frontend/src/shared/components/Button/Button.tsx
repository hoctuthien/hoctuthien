import React from 'react';
import { cn } from '@/shared/lib/utils';

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
  primary: 'bg-primary text-text-inverse border-primary hover:bg-primary-dark hover:border-primary-dark shadow-sm active:scale-95',
  secondary: 'bg-secondary text-text-inverse border-secondary hover:bg-secondary-dark hover:border-secondary-dark shadow-sm active:scale-95',
  danger: 'bg-red-600 text-white border-red-600 hover:bg-red-700 hover:border-red-700 shadow-sm active:scale-95',
  outline: 'bg-transparent text-primary border-primary border-dashed hover:bg-primary-fixed active:scale-95',
  text: 'bg-transparent text-primary border-transparent hover:underline hover:text-primary-dark active:scale-95',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'text-[13px] px-3.5 py-1.5 min-h-[32px]',
  md: 'text-[14px] px-5.5 py-2.5 min-h-[42px]',
  lg: 'text-[16px] px-8 py-3.5 min-h-[52px]',
};

export const Button = ({
  variant = 'primary',
  size = 'md',
  label,
  disabled = false,
  loading = false,
  fullWidth = false,
  iconLeft,
  iconRight,
  onClick,
  type = 'button',
  className = '',
}: ButtonProps) => {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold rounded-sm border-2 transition-all duration-200 outline-none select-none disabled:opacity-60 disabled:pointer-events-none disabled:bg-text-muted disabled:border-text-muted',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        loading && 'cursor-wait',
        className
      )}
      disabled={isDisabled}
      onClick={onClick}
      aria-busy={loading}
      aria-disabled={isDisabled}
    >
      {loading && (
        <span className="inline-block w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin flex-shrink-0" />
      )}
      {!loading && iconLeft && (
        <span className="inline-flex items-center flex-shrink-0">{iconLeft}</span>
      )}
      <span className="leading-none">{label}</span>
      {!loading && iconRight && (
        <span className="inline-flex items-center flex-shrink-0">{iconRight}</span>
      )}
    </button>
  );
};