import React from 'react';
import { cn } from '@/core/utils/cn';

interface CircularProgressProps {
  value: number;
  label: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
  className?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  label,
  size = 160,
  strokeWidth = 12,
  color = 'var(--color-primary)',
  className
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className={cn('flex flex-col items-center gap-4', className)} style={{ width: size }}>
      <div className="relative flex items-center justify-center -rotate-90" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">

          <circle
            className="fill-none stroke-primary-fixed"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
          />

          <circle
            className="fill-none transition-all duration-1000 ease-out stroke-primary"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            style={{ 
              strokeDashoffset: offset,
              stroke: color !== 'var(--color-primary)' ? color : undefined 
            }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute rotate-90 flex flex-col items-center">
          <span className="text-h2 font-black text-text-heading leading-none">{value}%</span>
        </div>
      </div>
      <p className="text-[10px] font-black text-text-body uppercase tracking-[0.2em]">{label}</p>
    </div>
  );
};
