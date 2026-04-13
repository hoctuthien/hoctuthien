import React from 'react';
import { LuChevronRight } from 'react-icons/lu';
import './sidebar.css';

export interface SidebarItemProps {
  label: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
  isSubItem?: boolean;
  hasChild?: boolean;
  isExpanded?: boolean;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  label,
  icon,
  isActive = false,
  isDisabled = false,
  onClick,
  isSubItem = false,
  hasChild = false,
  isExpanded = false,
}) => {
  return (
    <div
      className={`htt-sidebar-item ${isActive ? 'is-active' : ''} ${
        isDisabled ? 'is-disabled' : ''
      } ${isSubItem ? 'is-sub-item' : ''}`}
      onClick={!isDisabled ? onClick : undefined}
    >
      <div className="htt-sidebar-item__content">
        {icon && <span className="htt-sidebar-item__icon">{icon}</span>}
        <span className="htt-sidebar-item__label">{label}</span>
      </div>
      
      {hasChild && (
        <span className={`htt-sidebar-item__arrow ${isExpanded ? 'is-expanded' : ''}`}>
          <LuChevronRight size={16} />
        </span>
      )}
      
      {isActive && <div className="htt-sidebar-item__indicator" />}
    </div>
  );
};
