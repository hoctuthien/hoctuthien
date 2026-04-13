import React from 'react';
import './description-list.css';

export interface DescriptionItem {
  id: string;
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}

export type DescriptionListVariant = 'basic' | 'bordered' | 'vertical' | 'bordered-vertical';

interface DescriptionListProps {
  items: DescriptionItem[];
  variant?: DescriptionListVariant;
  columns?: number;
}

export const DescriptionList: React.FC<DescriptionListProps> = ({
  items,
  variant = 'basic',
  columns = 2
}) => {
  return (
    <div 
      className={`htt-description-list htt-description-list--${variant}`}
      style={{ '--columns': columns } as React.CSSProperties}
    >
      {items.map((item) => (
        <div key={item.id} className="htt-description-item">
          <div className="htt-description-label-wrapper">
            {variant === 'bordered-vertical' && item.icon && (
              <span className="htt-description-icon">{item.icon}</span>
            )}
            <span className="htt-description-label">{item.label}</span>
          </div>
          <div className="htt-description-value">
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
};
