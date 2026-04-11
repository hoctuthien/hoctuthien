import React, { useId } from "react";
import "./switch.css";

export interface SwitchProps {
  label?: string;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
}

export const Switch = ({
  label,
  checked = false,
  disabled = false,
  onChange,
}: SwitchProps) => {
  const id = useId();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.checked);
    }
  };

  return (
    <div className={`htt-switch-wrapper ${disabled ? "htt-switch--disabled" : ""}`}>
      <div className="htt-switch-container">
        <input
          type="checkbox"
          id={id}
          className="htt-switch-input"
          checked={checked}
          disabled={disabled}
          onChange={handleChange}
        />
        <div className="htt-switch-track">
          <div className="htt-switch-thumb" />
        </div>
      </div>
      {label && (
        <label htmlFor={id} className="htt-switch-label">
          {label}
        </label>
      )}
    </div>
  );
};
