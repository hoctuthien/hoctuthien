import React from 'react';
import { LuX } from 'react-icons/lu';
import { cn } from '@/shared/lib/utils';

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
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  activeTabId,
  onChange,
  onClose,
  variant = 'basic',
  className
}) => {
  const containerClasses = cn('w-full font-sans', className);

  const listClasses = cn(
    'flex items-center',
    variant === 'basic' && 'gap-6 border-bottom border-border-subtle',
    variant === 'card' && 'bg-surface-variant p-1 rounded-md border-none gap-1 inline-flex',
    (variant === 'pill' || variant === 'capsule') && 'border-none gap-3',
    variant === 'closeable' && 'border-none gap-2'
  );

  return (
    <div className={containerClasses}>
      <div className={listClasses}>
        {items.map((item) => {
          const isActive = item.id === activeTabId;
          
          const itemClasses = cn(
            'relative bg-transparent border-none cursor-pointer transition-all duration-200 outline-none flex items-center gap-2',
            variant === 'basic' && 'py-3 px-1 text-text-muted hover:text-primary',
            variant === 'basic' && isActive && 'text-primary after:content-[""] after:absolute after:-bottom-[1px] after:left-0 after:right-0 after:h-0.5 after:bg-primary',
            
            variant === 'card' && 'py-2 px-4 rounded-sm text-text-muted',
            variant === 'card' && isActive && 'bg-surface text-primary shadow-sm font-semibold',
            
            variant === 'pill' && 'py-2 px-5 rounded-full bg-surface border border-border-subtle hover:border-primary',
            variant === 'pill' && isActive && 'bg-primary text-text-inverse border-primary',
            
            variant === 'capsule' && 'py-2 px-4.5 rounded-full bg-gray-200 text-gray-500 uppercase text-[10px] tracking-wider font-extrabold',
            variant === 'capsule' && isActive && 'bg-indigo-100 text-indigo-900',
            
            variant === 'closeable' && 'bg-surface-variant py-2 px-3 rounded-sm flex items-center gap-2',
            variant === 'closeable' && isActive && 'bg-surface border border-border-subtle text-primary',
            
            item.disabled && 'opacity-40 cursor-not-allowed'
          );

          return (
            <button
              key={item.id}
              className={itemClasses}
              onClick={() => !item.disabled && onChange(item.id)}
              disabled={item.disabled}
            >
              {item.icon && <span className="flex items-center">{item.icon}</span>}
              <span className="text-body-sm font-semibold whitespace-nowrap">{item.label}</span>
              
              {variant === 'closeable' && onClose && (
                <span 
                  className="flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity p-0.5" 
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
