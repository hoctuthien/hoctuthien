"use client";

import React, { useId } from "react";
import { cn } from "@/shared/lib/utils";

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
      <label
        className={cn(
          "inline-flex items-center gap-3 cursor-pointer select-none group py-2.5 px-3 -ml-3 rounded-xl transition-all duration-200",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
      >
        <div className="relative flex items-center justify-center w-6 h-6">
          <div className="absolute inset-0 rounded-full scale-150 bg-primary-opacity opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
          
          <input
            type="radio"
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
              "flex items-center justify-center w-6 h-6 rounded-full border-2 z-10 transition-all duration-200",
              "border-outline-variant bg-surface",
              "group-hover:border-primary",
              "peer-checked:border-primary",
              "peer-focus-visible:ring-4 peer-focus-visible:ring-primary-opacity peer-focus-visible:border-primary",
              "active:scale-90",
              disabled && "border-outline-variant bg-surface-variant group-hover:border-outline-variant"
            )}
          >
            <div
              className={cn(
                "w-3 h-3 rounded-full bg-primary transform transition-all duration-200 ease-out",
                checked ? "scale-100" : "scale-0",
                disabled && "bg-text-muted"
              )}
            />
          </div>
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

Radio.displayName = "Radio";
