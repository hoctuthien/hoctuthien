import React from 'react';
import { cn } from '@/core/utils/cn';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  width,
  height
}) => {  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200',
        {
          "rounded-md": variant === 'rectangular',
          "rounded-full": variant === 'circular',
          "h-4 w-full rounded": variant === 'text',
        },
        className
      )}
      style={{
        width: width,
        height: height,
      }}
    />
  );
};
