"use client";

import React, { useId } from "react";

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: string;
  onChange?: (checked: boolean) => void;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
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
        <div className="relative w-11 h-6 flex items-center">
          <input
            type="checkbox"
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
              relative z-10 w-11 h-6 rounded-full transition-all duration-200 ease-in-out
              bg-border-default
              peer-checked:bg-primary
              peer-focus-visible:ring-4 peer-focus-visible:ring-primary-surface
              peer-hover:opacity-90
              ${disabled ? "opacity-60 bg-text-disabled" : ""}
            `}
          />
          <div
            className={`
              absolute z-20 left-1 top-1 w-4 h-4 rounded-full bg-white transition-all duration-200 ease-in-out shadow-sm
              peer-checked:translate-x-5
              ${disabled ? "bg-white/80" : ""}
            `}
          />
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

Switch.displayName = "Switch";
