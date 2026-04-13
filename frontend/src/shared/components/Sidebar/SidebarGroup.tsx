import React, { useState } from 'react';
import { SidebarItem } from './SidebarItem';

export interface SidebarSubItem {
  id: string;
  label: string;
  onClick?: () => void;
  isActive?: boolean;
}

export interface SidebarGroupProps {
  label: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  items: SidebarSubItem[];
  defaultExpanded?: boolean;
}

export const SidebarGroup: React.FC<SidebarGroupProps> = ({
  label,
  icon,
  isActive = false,
  items,
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(isActive || defaultExpanded);

  return (
    <div className="htt-sidebar-group">
      <SidebarItem
        label={label}
        icon={icon}
        isActive={isActive && !isExpanded}
        hasChild
        isExpanded={isExpanded}
        onClick={() => setIsExpanded(!isExpanded)}
      />
      
      {isExpanded && (
        <div className="htt-sidebar-group__children">
          {items.map((item) => (
            <SidebarItem
              key={item.id}
              label={item.label}
              isActive={item.isActive}
              isSubItem
              onClick={item.onClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};
