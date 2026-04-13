"use client";

import React, { useId } from "react";
import "./checkbox.css";

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
        className={`htt-checkbox-wrapper ${disabled ? "htt-checkbox--disabled" : ""} ${className || ""}`}
      >
        <div className="htt-checkbox-container">
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
            className="htt-checkbox-input"
            {...props}
          />
          <div className="htt-checkbox-control">
            {(checked && !indeterminate) && (
              <svg
                className="htt-checkbox-icon"
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
                className="htt-checkbox-icon"
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
          <label htmlFor={id} className="htt-checkbox-label">
            {label}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
