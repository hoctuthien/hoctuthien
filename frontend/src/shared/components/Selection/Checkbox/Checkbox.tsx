"use client";

import React, { useId } from "react";
import { Check, Minus } from "lucide-react";
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
      <label
        className={cn(
          "inline-flex items-center gap-3 cursor-pointer select-none group py-2.5 px-3 -ml-3 rounded-xl transition-all duration-200",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
      >
        <div className="relative flex items-center justify-center w-6 h-6">
          <div className="absolute inset-0 rounded-sm scale-150 bg-primary-opacity opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

          <input
            type="checkbox"
            id={id}
            ref={(el) => {
              if (typeof ref === "function") ref(el);
              else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
              if (el) el.indeterminate = indeterminate || false;
            }}
            checked={checked}
            disabled={disabled}
            onChange={handleChange}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              "flex items-center justify-center w-6 h-6 rounded-sm border-2 z-10 transition-all duration-200",
              "border-outline-variant bg-surface",
              "group-hover:border-primary",
              "peer-checked:bg-primary peer-checked:border-primary peer-indeterminate:bg-primary peer-indeterminate:border-primary",
              "peer-focus-visible:ring-4 peer-focus-visible:ring-primary-opacity peer-focus-visible:border-primary",
              "active:scale-90",
              disabled && "border-outline-variant bg-surface-variant peer-checked:bg-text-muted peer-checked:border-text-muted group-hover:border-outline-variant"
            )}
          >
            {indeterminate ? (
              <Minus
                className={cn(
                  "text-white transition-opacity duration-200",
                  indeterminate ? "opacity-100" : "opacity-0"
                )}
                strokeWidth={3}
                size={16}
              />
            ) : (
              <Check
                className={cn(
                  "text-white transition-opacity duration-200",
                  checked ? "opacity-100" : "opacity-0"
                )}
                strokeWidth={3}
                size={16}
              />
            )}
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

Checkbox.displayName = "Checkbox";
