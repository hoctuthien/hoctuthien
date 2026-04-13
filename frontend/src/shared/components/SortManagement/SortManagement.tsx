import React from 'react';
import { LuGripVertical, LuMaximize2 } from 'react-icons/lu';
import './sort-management.css';

interface SortItem {
  id: string;
  index: string;
  label: string;
  isMoving?: boolean;
}

interface SortManagementProps {
  items: SortItem[];
}

export const VerticalReorder: React.FC<SortManagementProps> = ({ items }) => {
  return (
    <div className="htt-sort-vertical-list">
      {items.map((item) => (
        <div key={item.id} className={`htt-sort-vertical-item ${item.isMoving ? 'htt-sort-vertical-item--moving' : ''}`}>
          <LuGripVertical className="htt-sort-handle" size={20} />
          <span className="htt-sort-index">{item.index}.</span>
          <span className="htt-sort-label">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

interface GridSortProps {
  items: { id: string; num: string; label: string; isActive?: boolean }[];
}

export const HorizontalSort: React.FC<GridSortProps> = ({ items }) => {
  return (
    <div className="htt-sort-grid">
      {items.map((item) => (
        <div key={item.id} className={`htt-sort-grid-item ${item.isActive ? 'htt-sort-grid-item--active' : ''}`}>
          <div className="htt-sort-grid-header">
            <span className="htt-sort-grid-num">{item.num}</span>
            {item.isActive ? <LuMaximize2 size={16} /> : <div className="htt-sort-grid-dash" />}
          </div>
          <span className="htt-sort-grid-label">{item.label}</span>
        </div>
      ))}
    </div>
  );
};
