"use client";

import React, { useId } from "react";
import { LuCheck, LuMinus } from "react-icons/lu";
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
              <LuCheck className="htt-checkbox-icon" strokeWidth={3.5} />
            )}
            {indeterminate && (
              <LuMinus className="htt-checkbox-icon" strokeWidth={4} />
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
