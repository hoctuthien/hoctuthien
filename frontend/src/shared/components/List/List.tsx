import React from 'react';
import { Avatar } from '../Avatar/Avatar';
import { cn } from '@/shared/lib/utils';

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
  className?: string;
}

export const List: React.FC<ListProps> = ({ items, variant = 'basic', className }) => {
  return (
    <div className={cn('flex flex-col gap-3 w-full max-w-[500px] p-8 rounded-3xl bg-primary-fixed/20', className)}>
      {items.map((item) => (
        <div 
          key={item.id} 
          className="flex items-center justify-between p-4 px-5 bg-surface rounded-xl shadow-sm border border-border-default/20 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-4 flex-1">
            {item.avatar ? (
              <Avatar src={item.avatar} alt={item.title} size="md" className="rounded-xl" />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-surface-variant flex items-center justify-center text-primary">
                {item.icon}
              </div>
            )}
            <div className="flex flex-col justify-center flex-1">
              <h4 className="text-body font-bold text-text-heading leading-tight">{item.title}</h4>
              <p className="text-body-sm text-text-body m-0 leading-normal">{item.subtitle}</p>
            </div>
          </div>
          {item.actions && (
            <div className="flex items-center gap-2 ml-4 flex-shrink-0">
              {item.actions}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
