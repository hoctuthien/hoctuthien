import React, { useId } from "react";
import "./radio.css";

export interface RadioProps {
  label?: string;
  checked?: boolean;
  disabled?: boolean;
  name?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export const Radio = ({
  label,
  checked = false,
  disabled = false,
  name,
  value = "",
  onChange,
}: RadioProps) => {
  const id = useId();

  const handleChange = () => {
    if (onChange && !disabled) {
      onChange(value);
    }
  };

  return (
    <div className={`htt-radio-wrapper ${disabled ? "htt-radio--disabled" : ""}`}>
      <div className="htt-radio-container">
        <input
          type="radio"
          id={id}
          name={name}
          className="htt-radio-input"
          checked={checked}
          disabled={disabled}
          onChange={handleChange}
        />
        <div className="htt-radio-control">
          <div className="htt-radio-inner" />
        </div>
      </div>
      {label && (
        <label htmlFor={id} className="htt-radio-label">
          {label}
        </label>
      )}
    </div>
  );
};
