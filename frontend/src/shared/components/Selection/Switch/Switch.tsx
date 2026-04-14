"use client";

import React, { useId } from "react";
import { cn } from "@/shared/lib/utils";

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
      <label
        className={cn(
          "inline-flex items-center gap-3 cursor-pointer select-none group py-2.5 px-3 -ml-3 rounded-xl transition-all duration-200",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
      >
        <div className="relative flex items-center w-11 h-6">
          <input
            type="checkbox"
            id={id}
            ref={ref}
            checked={checked}
            disabled={disabled}
            onChange={handleChange}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              "w-11 h-6 rounded-full transition-all duration-300 ease-in-out border-2",
              "bg-outline-variant/30 border-outline-variant",
              "group-hover:border-primary/50",
              "peer-checked:bg-primary peer-checked:border-primary",
              "peer-focus-visible:ring-4 peer-focus-visible:ring-primary-opacity",
              disabled && "bg-surface-variant border-outline-variant peer-checked:bg-text-muted peer-checked:border-text-muted"
            )}
          />
          <div
            className={cn(
              "absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ease-in-out shadow-sm",
              checked ? "translate-x-5" : "translate-x-0",
              disabled && "bg-white/80"
            )}
          />
        </div>
        {label && (
          <span
            className={cn(
              "text-body font-medium text-text-body transition-colors duration-200",
              !disabled && "group-hover:text-primary",
              disabled && "text-text-muted"
            )}
          >
            {label}
          </span>
        )}
      </label>
    );
  }
);

Switch.displayName = "Switch";
