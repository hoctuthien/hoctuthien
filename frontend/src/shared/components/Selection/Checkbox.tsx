"use client";

import React, { useId } from "react";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: string;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, indeterminate, checked, onChange, disabled, className, id: providedId, ...props }, ref) => {
    const internalId = useId();
    const id = providedId || internalId;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.checked);
    };

    return (
      <div 
        className={`inline-flex items-center gap-3 cursor-pointer select-none group relative ${disabled ? "cursor-not-allowed" : ""} ${className || ""}`}
      >
        <div className="relative w-6 h-6 flex items-center justify-center">
          <input
            type="checkbox"
            id={id}
            ref={(el) => {
              if (typeof ref === "function") ref(el);
              else if (ref) ref.current = el;
              if (el) el.indeterminate = indeterminate || false;
            }}
            checked={checked}
            disabled={disabled}
            onChange={handleChange}
            className="sr-only peer"
            {...props}
          />
          <div className={`absolute -inset-2.5 rounded-full transition-colors ${disabled ? "" : "peer-focus-visible:bg-primary-light/50 group-hover:bg-primary-light/30"}`} />
          
          <div
            className={`
              relative z-10 w-6 h-6 border-[1.5px] transition-all duration-150 ease-in-out flex items-center justify-center
              rounded-lg
              border-border-strong 
              bg-white
              peer-hover:border-primary peer-hover:border-2
              peer-checked:bg-primary peer-checked:border-primary peer-checked:text-white
              peer-indeterminate:bg-primary peer-indeterminate:border-primary peer-indeterminate:text-white
              peer-focus-visible:ring-4 peer-focus-visible:ring-primary-surface peer-focus-visible:border-primary
              ${disabled ? "opacity-60 peer-checked:bg-text-disabled peer-checked:border-text-disabled border-border-default bg-surface-elevated" : ""}
            `}
          >
            {(checked && !indeterminate) && (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
            {indeterminate && (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            )}
          </div>
        </div>
        {label && (
          <label htmlFor={id} className={`text-sm font-medium text-text-body cursor-inherit relative z-10 ${disabled ? "opacity-60" : ""}`}>
            {label}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
