import React, { useState, useRef, useEffect } from 'react';
import { LuChevronDown, LuCheck } from 'react-icons/lu';
import { cn } from '@/shared/lib/utils';

export interface DropdownItemProps {
  id: string | number;
  label?: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  isDanger?: boolean;
  isDivider?: boolean;
  onClick?: () => void;
}

export interface DropdownProps {
  label?: string;
  variant?: 'primary' | 'secondary' | 'text';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  items: DropdownItemProps[];
  triggerContent?: React.ReactNode;
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  disabled = false,
  items,
  triggerContent,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    if (!disabled) setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleItemClick = (item: DropdownItemProps) => {
    if (item.onClick) item.onClick();
    setIsOpen(false);
  };

  const triggerClasses = cn(
    'inline-flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 select-none font-semibold rounded-md outline-none disabled:bg-surface-elevated disabled:text-text-disabled disabled:border-border-subtle disabled:cursor-not-allowed disabled:shadow-none',
    
    variant === 'primary' && 'bg-primary text-text-inverse py-2.5 px-5 border-none hover:bg-primary-dark hover:shadow-md',
    variant === 'primary' && isOpen && 'bg-primary-dark ring-4 ring-primary-fixed',
    
    variant === 'secondary' && 'bg-surface text-primary border-1.5 border-border py-2 px-4 hover:border-primary hover:bg-primary-fixed',
    variant === 'secondary' && isOpen && 'border-primary ring-4 ring-primary-fixed',
    
    variant === 'text' && 'bg-transparent text-primary border-none p-1 px-2 font-bold hover:text-primary-dark hover:underline',
    
    size === 'sm' && 'text-caption py-1.5 px-3',
    size === 'lg' && 'text-body-lg py-3 px-6',
    
    className
  );

  return (
    <div className="relative inline-block font-sans" ref={dropdownRef}>
      <button 
        className={triggerClasses} 
        onClick={toggleDropdown}
        disabled={disabled}
      >
        {triggerContent || label}
        <LuChevronDown 
          size={variant === 'text' ? 18 : 16} 
          className={cn('transition-transform duration-200', isOpen && 'rotate-180')}
        />
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 min-w-[220px] bg-surface rounded-lg border border-border-subtle shadow-xl p-2 z-[100] animate-in fade-in zoom-in-95 duration-200 origin-top-left">
          {items.map((item, index) => (
            <React.Fragment key={item.id || index}>
              {item.isDivider && <div className="h-px bg-border-subtle my-2 mx-2" />}
              
              {!item.isDivider && (
                <button
                  className={cn(
                    'flex items-center justify-between w-full p-3 px-4 rounded-md text-text-body text-body-sm font-medium cursor-pointer transition-all duration-150 text-left hover:bg-primary-fixed hover:text-primary',
                    item.isActive && 'bg-primary-fixed text-primary font-bold',
                    item.isDanger && 'text-red-600 hover:bg-red-50 hover:text-red-700'
                  )}
                  onClick={() => handleItemClick(item)}
                >
                  <div className="flex items-center gap-3">
                    {item.icon && <span className={cn('flex items-center justify-center text-primary', item.isDanger && 'text-red-600')}>{item.icon}</span>}
                    <span>{item.label}</span>
                  </div>
                  {item.isActive && <LuCheck size={16} />}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};
