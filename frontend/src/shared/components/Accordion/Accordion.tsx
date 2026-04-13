import React, { useState } from 'react';
import { LuChevronDown, LuChevronUp } from 'react-icons/lu';
import './accordion.css';

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const Accordion: React.FC<AccordionProps> = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`htt-accordion ${isOpen ? 'htt-accordion--open' : ''}`}>
      <button 
        className="htt-accordion-header" 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="htt-accordion-title">{title}</span>
        {isOpen ? <LuChevronUp size={20} /> : <LuChevronDown size={20} />}
      </button>
      {isOpen && (
        <div className="htt-accordion-content">
          {children}
        </div>
      )}
    </div>
  );
};
