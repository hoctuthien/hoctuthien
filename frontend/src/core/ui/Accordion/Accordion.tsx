"use client";

import React, { useState } from 'react';
import { LuChevronDown, LuChevronUp } from 'react-icons/lu';
import { cn } from '@/core/utils/cn';

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({ title, children, defaultOpen = false, className }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn(
      'w-full max-w-[480px] bg-surface rounded-xl overflow-hidden transition-all duration-300 border border-border-default',
      isOpen && 'shadow-lg',
      className
    )}>
      <button 
        className={cn(
          'w-full flex items-center justify-between py-4 px-6 bg-transparent border-none cursor-pointer text-left transition-all duration-150',
          !isOpen && 'hover:bg-primary-fixed/50 hover:text-primary',
          isOpen && 'bg-primary hover:bg-primary-dark'
        )}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className={cn(
          'text-body font-bold text-text-heading transition-colors',
          isOpen && 'text-text-inverse'
        )}>
          {title}
        </span>
        <div className={cn(
          'transition-all duration-300',
          isOpen ? 'rotate-180 text-text-inverse' : 'text-primary'
        )}>
          <LuChevronDown size={20} />
        </div>
      </button>
      {isOpen && (
        <div className="p-6 text-body-sm leading-relaxed text-text-body font-medium animate-in fade-in slide-in-from-top-2 duration-300">
          {children}
        </div>
      )}
    </div>
  );
};
