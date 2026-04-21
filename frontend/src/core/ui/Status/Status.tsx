import React from 'react';
import { cn } from '@/core/utils/cn';

export type StatusType = 'online' | 'offline' | 'busy' | 'sabbatical';

interface StatusProps {
  type: StatusType;
  label?: string;
  showLabel?: boolean;
  className?: string;
}

const statusConfig = {
  online: { color: 'bg-secondary', ring: 'ring-secondary/30', text: 'ONLINE' },
  offline: { color: 'bg-text-muted', ring: 'ring-text-muted/30', text: 'OFFLINE' },
  busy: { color: 'bg-[#BA1A1A]', ring: 'ring-[#BA1A1A]/30', text: 'BUSY' },
  sabbatical: { color: 'bg-[#795900]', ring: 'ring-[#795900]/30', text: 'ON SABBATICAL' },
};

export const Status: React.FC<StatusProps> = ({ 
  type, 
  label, 
  showLabel = true,
  className
}) => {
  const config = statusConfig[type];
  
  return (
    <div className={cn('inline-flex items-center gap-4 font-sans ml-1', className)}>
      <div className="relative flex items-center justify-center">
        <span className={cn('absolute w-full h-full rounded-full animate-ping opacity-75', config.color)} />
        <span className={cn('relative w-3 h-3 rounded-full flex-shrink-0 ring-4', config.color, config.ring)} />
      </div>
      {showLabel && (
        <span className="text-body-sm font-bold text-text-heading tracking-widest uppercase ml-1">
          {label || config.text}
        </span>
      )}
    </div>
  );
};
