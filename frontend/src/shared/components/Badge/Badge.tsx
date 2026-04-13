import React from 'react';
import './badge.css';

export type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'growth' | 'neutral';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: BadgeVariant;
  icon?: React.ReactNode;
  dot?: boolean;
  count?: number;
}

export const Badge = ({
  children,
  variant = 'primary',
  icon,
  dot,
  count
}: BadgeProps) => {
  return (
    <div className={`htt-badge-wrapper`}>
      <span className={`badge badge-${variant}`}>
        {icon && <span className="htt-badge-icon">{icon}</span>}
        {children}
      </span>
      {dot && <span className={`htt-badge-dot htt-badge-dot--${variant}`} />}
      {count !== undefined && <span className={`htt-badge-count`}>{count}</span>}
    </div>
  );
};
