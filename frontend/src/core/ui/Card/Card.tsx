import React from 'react';
import { cn } from '@/core/utils/cn';

export type CardVariant = 'default' | 'bordered' | 'elevated' | 'glass';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  className?: string;
  onClick?: () => void;
}

const variantClasses: Record<CardVariant, string> = {
  default: "bg-surface",
  bordered: "bg-surface border border-border-default",
  elevated: "bg-surface shadow-md hover:shadow-lg transition-shadow duration-300",
  glass: "bg-white/70 backdrop-blur-md border border-white/20 shadow-lg",
};

const paddingClasses: Record<CardPadding, string> = {
  none: "p-0",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export const Card = ({
  children,
  variant = "default",
  padding = "md",
  className,
  onClick,
}: CardProps) => {
  return (
    <div
      className={cn(
        "rounded-xl overflow-hidden",
        variantClasses[variant],
        paddingClasses[padding],
        onClick && "cursor-pointer active:scale-[0.98] transition-transform",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
