import React from 'react';
import { LuCheck, LuX, LuTimer } from 'react-icons/lu';
import './steps.css';

export type StepStatus = 'completed' | 'active' | 'upcoming' | 'error' | 'disabled';

export interface StepItem {
  id: string | number;
  label: string;
  description?: string;
  status: StepStatus;
  info?: string;
  icon?: React.ReactNode;
}

export interface StepsProps {
  items: StepItem[];
  orientation?: 'horizontal' | 'vertical';
}

export const Steps: React.FC<StepsProps> = ({ items, orientation = 'horizontal' }) => {
  const containerClass = `steps-container ${orientation === 'horizontal' ? 'steps-horizontal' : 'steps-vertical'}`;

  const renderNode = (item: StepItem, index: number) => {
    if (item.status === 'completed') {
      return <LuCheck size={18} />;
    }
    if (item.status === 'error') {
      return <LuX size={18} />;
    }
    return item.icon || (index + 1);
  };

  if (orientation === 'horizontal') {
    return (
      <div className={containerClass}>
        {items.map((item, index) => (
          <div 
            key={item.id} 
            className={`step-item-horizontal ${item.status}`}
          >
            <div className="step-node">
              {renderNode(item, index)}
            </div>
            <div className="step-label">{item.label}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={containerClass}>
      {items.map((item, index) => (
        <div 
          key={item.id} 
          className={`step-item-vertical ${item.status}`}
        >
          <div className="step-node">
            {renderNode(item, index)}
          </div>
          <div className="step-content-vertical">
            <div className="step-title-vertical">{item.label}</div>
            {item.description && <div className="step-desc-vertical">{item.description}</div>}
            {item.info && (
              <div className="step-info-box">
                &ldquo;{item.info}&rdquo;
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};


export interface StatusPillProps {
  label: string;
  variant?: 'filled' | 'outline' | 'ghost';
  isActive?: boolean;
  icon?: React.ReactNode;
}

export const StatusPill: React.FC<StatusPillProps> = ({ label, variant = 'ghost', isActive, icon }) => {
  const className = `status-pill ${isActive ? 'status-pill-active' : ''} ${variant === 'outline' ? 'status-pill-outline' : ''}`;
  return (
    <div className={className}>
      {icon}
      {label}
    </div>
  );
};

export interface StatusCardProps {
  title: string;
  description: string;
  status: 'completed' | 'processing';
}

export const StatusCard: React.FC<StatusCardProps> = ({ title, description, status }) => {
  const isCompleted = status === 'completed';
  return (
    <div className="card" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 'var(--spacing-3)',
      width: '240px',
      border: '1px solid var(--clr-border-subtle)'
    }}>
      <div style={{ 
        color: isCompleted ? 'var(--clr-success)' : 'var(--clr-primary)',
        display: 'flex'
      }}>
        {isCompleted ? <LuCheck size={24} strokeWidth={3} /> : <LuTimer size={24} strokeWidth={3} />}
      </div>
      <div>
        <div style={{ fontWeight: 'var(--font-weight-black)', color: 'var(--clr-text-heading)' }}>{title}</div>
        <div style={{ fontSize: 'var(--font-size-caption)', color: 'var(--clr-text-muted)' }}>{description}</div>
      </div>
    </div>
  );
};
