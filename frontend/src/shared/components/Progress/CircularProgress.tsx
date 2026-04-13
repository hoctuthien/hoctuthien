import React from 'react';
import './circular-progress.css';

interface CircularProgressProps {
  value: number;
  label: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  label,
  size = 160,
  strokeWidth = 12,
  color = 'var(--clr-primary)'
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="htt-circular-progress-container" style={{ width: size }}>
      <div className="htt-circular-progress" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          <circle
            className="htt-circular-progress-bg"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
          />
          <circle
            className="htt-circular-progress-value"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="htt-circular-progress-text">
          <span className="htt-circular-progress-number">{value}%</span>
        </div>
      </div>
      <p className="htt-circular-progress-label">{label}</p>
    </div>
  );
};
