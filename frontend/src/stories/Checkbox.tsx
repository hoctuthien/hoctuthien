import React, { useId } from "react";
import "./checkbox.css";

export interface CheckboxProps {
  label?: string;
  checked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  id?: string;
}

export const Checkbox = ({
  label,
  checked = false,
  indeterminate = false,
  disabled = false,
  onChange,
  id: providedId,
}: CheckboxProps) => {
  const internalId = useId();
  const id = providedId || internalId;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.checked);
    }
  };

  return (
    <div
      className={`htt-checkbox-wrapper ${disabled ? "htt-checkbox--disabled" : ""}`}
    >
      <div className="htt-checkbox-container">
        <input
          type="checkbox"
          id={id}
          className="htt-checkbox-input"
          checked={checked}
          disabled={disabled}
          onChange={handleChange}
          ref={(el) => {
            if (el) el.indeterminate = indeterminate;
          }}
        />
        <div className="htt-checkbox-control">
          {checked && !indeterminate && (
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
};
