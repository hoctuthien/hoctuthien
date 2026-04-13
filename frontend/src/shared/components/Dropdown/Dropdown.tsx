import React, { useState, useRef, useEffect } from 'react';
import { LuChevronDown, LuCheck } from 'react-icons/lu';
import './dropdown.css';

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
}

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  disabled = false,
  items,
  triggerContent,
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

  const getTriggerClass = () => {
    let classes = `dropdown-trigger dropdown-trigger-${variant} dropdown-trigger-${size}`;
    if (isOpen) classes += ' active';
    return classes;
  };

  return (
    <div className="dropdown-container" ref={dropdownRef}>
      <button 
        className={getTriggerClass()} 
        onClick={toggleDropdown}
        disabled={disabled}
      >
        {triggerContent || label}
        <LuChevronDown 
          size={variant === 'text' ? 18 : 16} 
          style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} 
        />
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          {items.map((item, index) => (
            <React.Fragment key={item.id || index}>
              {item.isDivider && <div className="dropdown-divider" />}
              
              {!item.isDivider && (
                <button
                  className={`dropdown-item ${item.isActive ? 'active' : ''} ${item.isDanger ? 'dropdown-item-danger' : ''}`}
                  onClick={() => handleItemClick(item)}
                >
                  <div className="dropdown-item-content">
                    {item.icon && <span className="dropdown-item-icon">{item.icon}</span>}
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
