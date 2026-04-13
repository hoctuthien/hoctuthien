"use client";

import React, { useId } from "react";

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: string;
  onChange?: (checked: boolean) => void;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ label, checked, onChange, disabled, className, id: providedId, ...props }, ref) => {
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
            type="radio"
            id={id}
            ref={ref}
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
              rounded-full
              border-border-strong 
              bg-white
              peer-hover:border-primary peer-hover:border-2
              peer-checked:border-primary
              peer-focus-visible:ring-4 peer-focus-visible:ring-primary-surface peer-focus-visible:border-primary
              ${disabled ? "opacity-60 border-border-default bg-surface-elevated" : ""}
            `}
          >
            {checked && (
              <div className={`w-3 h-3 rounded-full bg-primary ${disabled ? "bg-text-disabled" : ""}`} />
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

Radio.displayName = "Radio";
