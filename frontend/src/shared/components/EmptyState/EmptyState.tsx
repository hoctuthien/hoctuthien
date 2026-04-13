import React from 'react';
import { LuCalendar } from 'react-icons/lu';
import './empty-state.css';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <LuCalendar size={48} />,
  title,
  description,
  actionText,
  onAction
}) => {
  return (
    <div className="htt-empty-state">
      <div className="htt-empty-state-icon-wrapper">
        <div className="htt-empty-state-icon">
          {icon}
        </div>
      </div>
      <h3 className="htt-empty-state-title">{title}</h3>
      <p className="htt-empty-state-description">{description}</p>
      {actionText && (
        <button className="btn btn-primary" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
};
