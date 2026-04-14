"use client";

import React, { useId } from "react";
import { LuCheck, LuMinus } from "react-icons/lu";
import { cn } from "@/shared/lib/utils";

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
        className={cn(
          'inline-flex items-center gap-3 cursor-pointer user-select-none font-sans',
          disabled && 'cursor-not-allowed opacity-60',
          className
        )}
      >
        <div className="relative w-6 h-6">
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
            className="absolute opacity-0 w-full h-full cursor-inherit m-0 z-[1]"
            {...props}
          />
          <div className={cn(
            'absolute inset-0 border-1.5 border-border-strong rounded-lg bg-surface transition-all duration-150 flex items-center justify-center text-text-inverse',
            'hover:border-primary hover:border-2',
            (checked || indeterminate) && 'bg-primary border-primary',
            'peer-focus-visible:ring-4 peer-focus-visible:ring-primary-fixed peer-focus-visible:border-primary',
            disabled && 'bg-text-disabled border-text-disabled',
          )}>
            {(checked && !indeterminate) && (
              <LuCheck className="w-4 h-4" strokeWidth={3.5} />
            )}
            {indeterminate && (
              <LuMinus className="w-4 h-4" strokeWidth={4} />
            )}
          </div>
        </div>
        {label && (
          <label htmlFor={id} className="text-body-sm text-text-body font-medium cursor-inherit">
            {label}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
