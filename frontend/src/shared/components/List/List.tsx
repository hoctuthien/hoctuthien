import React from 'react';
import { Avatar } from '../Avatar/Avatar';
import './list.css';

export interface ListItemProps {
  id: string;
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
  avatar?: string;
  actions?: React.ReactNode;
}

interface ListProps {
  items: ListItemProps[];
  variant?: 'basic' | 'action';
}

export const List: React.FC<ListProps> = ({ items, variant = 'basic' }) => {
  return (
    <div className={`htt-list htt-list--${variant}`}>
      {items.map((item) => (
        <div key={item.id} className="htt-list-item">
          <div className="htt-list-item-main">
            {item.avatar ? (
              <Avatar src={item.avatar} alt={item.title} size="md" />
            ) : (
              <div className="htt-list-item-icon">
                {item.icon}
              </div>
            )}
            <div className="htt-list-item-content">
              <h4 className="htt-list-item-title">{item.title}</h4>
              <p className="htt-list-item-subtitle">{item.subtitle}</p>
            </div>
          </div>
          {item.actions && (
            <div className="htt-list-item-actions">
              {item.actions}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
