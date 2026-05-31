import React from 'react';
import { formatVND } from '@/core/utils/formatters';

interface CurrencyDisplayProps {
  /** The numeric value to format and display */
  value?: number | null;
  /** Fallback text when value is nullish (default: '---') */
  fallback?: string;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Renders a formatted VND currency value.
 * Falls back to a placeholder when no value is provided.
 */
export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  value,
  fallback = '---',
  className,
}) => {
  return (
    <span className={className}>
      {value != null ? formatVND(value) : fallback}
    </span>
  );
};
