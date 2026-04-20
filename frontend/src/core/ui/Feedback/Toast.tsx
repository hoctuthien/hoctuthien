import React from 'react';
import { IoClose } from 'react-icons/io5';

interface ToastProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onClose?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const Toast = ({ 
  message, 
  actionLabel, 
  onAction, 
  onClose, 
  icon, 
  className = '' 
}: ToastProps) => {
  return (
    <div className={`flex items-center gap-4 px-6 py-3.5 rounded-full bg-[#1A1D21] text-white shadow-[0_12px_32px_rgba(0,0,0,0.3)] animate-in zoom-in-95 fade-in duration-500 transform-gpu ${className}`}>
      {icon && (
        <div className="shrink-0 flex items-center justify-center scale-95 opacity-90">
          {icon}
        </div>
      )}
      <p className="text-[13px] font-semibold tracking-normal flex-grow truncate leading-none py-1">
        {message}
      </p>
      {(actionLabel || onClose) && (
        <div className="flex items-center gap-4 ml-1 border-l border-white/10 pl-4 h-5">
          {actionLabel && (
            <button 
              onClick={onAction}
              className="text-[11px] font-[900] uppercase tracking-[0.12em] text-[#FFB443] hover:text-[#FFCF87] transition-all cursor-pointer select-none active:scale-95"
            >
              {actionLabel}
            </button>
          )}
          {onClose && (
            <button 
              onClick={onClose}
              className="text-white/40 hover:text-white transition-colors cursor-pointer p-0.5 rounded-full"
              aria-label="Close"
            >
              <IoClose size={18} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
