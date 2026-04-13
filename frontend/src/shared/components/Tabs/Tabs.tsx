import React from 'react';
import { LuX } from 'react-icons/lu';
import './tabs.css';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export type TabsVariant = 'basic' | 'card' | 'pill' | 'capsule' | 'closeable';

interface TabsProps {
  items: TabItem[];
  activeTabId: string;
  onChange: (id: string) => void;
  onClose?: (id: string) => void;
  variant?: TabsVariant;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  activeTabId,
  onChange,
  onClose,
  variant = 'basic'
}) => {
  return (
    <div className={`htt-tabs-container htt-tabs--${variant}`}>
      <div className="htt-tabs-list">
        {items.map((item) => {
          const isActive = item.id === activeTabId;
          return (
            <button
              key={item.id}
              className={`htt-tab-item ${isActive ? 'is-active' : ''} ${item.disabled ? 'is-disabled' : ''}`}
              onClick={() => !item.disabled && onChange(item.id)}
              disabled={item.disabled}
            >
              <div className="htt-tab-content">
                {item.icon && <span className="htt-tab-icon">{item.icon}</span>}
                <span className="htt-tab-label">{item.label}</span>
              </div>
              {variant === 'closeable' && onClose && (
                <span 
                  className="htt-tab-close" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose(item.id);
                  }}
                >
                  <LuX size={14} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
