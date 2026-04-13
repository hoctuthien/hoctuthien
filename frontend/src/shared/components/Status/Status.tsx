import React from 'react';
import './status.css';

export type StatusType = 'online' | 'offline' | 'busy' | 'sabbatical';

interface StatusProps {
  type: StatusType;
  label?: string;
  showLabel?: boolean;
}

const statusConfig = {
  online: { color: '#4ADE80', text: 'ONLINE' },
  offline: { color: '#B8C4D8', text: 'OFFLINE' },
  busy: { color: '#A8001C', text: 'BUSY' },
  sabbatical: { color: '#8A6000', text: 'ON SABBATICAL' },
};

export const Status: React.FC<StatusProps> = ({ 
  type, 
  label, 
  showLabel = true 
}) => {
  const config = statusConfig[type];
  
  return (
    <div className={`htt-status htt-status--${type}`}>
      <span 
        className="htt-status-dot" 
        style={{ backgroundColor: config.color }}
      />
      {showLabel && (
        <span className="htt-status-label">
          {label || config.text}
        </span>
      )}
    </div>
  );
};
