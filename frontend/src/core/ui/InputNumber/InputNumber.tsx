"use client";

import React, { useCallback, useId, useRef, useState } from "react";
import { Minus, Plus, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import { cn } from "@/core/utils/cn";

export type InputNumberStatus = "default" | "success" | "warning" | "error";

export interface InputNumberProps {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  onChange?: (value: number) => void;
  className?: string;
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  status?: InputNumberStatus;
}

export const InputNumber = React.forwardRef<HTMLInputElement, InputNumberProps>(
  (
    {
      value: controlledValue,
      defaultValue = 0,
      min = -Infinity,
      max = Infinity,
      step = 1,
      disabled = false,
      prefix,
      suffix,
      onChange,
      className,
      placeholder,
      label,
      error,
      helperText,
      status: providedStatus,
    },
    ref
  ) => {
    const id = useId();
    const inputRef = useRef<HTMLInputElement>(null);

    const [internalValue, setInternalValue] = useState(defaultValue);
    const isControlled = controlledValue !== undefined;
    const currentValue = isControlled ? controlledValue : internalValue;

    const status = providedStatus || (error ? "error" : "default");
    const message = error || helperText;

    const statusStyles = {
      default: {
        container: "bg-surface border-slate-200 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10",
        text: "text-[#727785]",
        icon: null,
      },
      success: {
        container: "bg-[#86F898]/30 border-[#006E2C]",
        text: "text-[#006E2C]",
        icon: <CheckCircle2 className="w-5 h-5 text-[#006E2C]" />,
      },
      warning: {
        container: "bg-[#987000]/10 border-[#795900]",
        text: "text-[#795900]",
        icon: <AlertTriangle className="w-5 h-5 text-[#795900]" />,
      },
      error: {
        container: "bg-[#FFDAD6]/30 border-[#BA1A1A]",
        text: "text-[#BA1A1A]",
        icon: <AlertCircle className="w-5 h-5 text-[#BA1A1A]" />,
      },
    };

    const updateValue = useCallback(
      (newValue: number) => {
        const clamped = Math.min(max, Math.max(min, newValue));
        if (!isControlled) setInternalValue(clamped);
        onChange?.(clamped);
      },
      [min, max, isControlled, onChange]
    );

    const handleDecrement = () => {
      if (disabled) return;
      updateValue(currentValue - step);
    };

    const handleIncrement = () => {
      if (disabled) return;
      updateValue(currentValue + step);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (raw === "" || raw === "-") return;
      const parsed = parseFloat(raw);
      if (!isNaN(parsed)) updateValue(parsed);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        handleIncrement();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        handleDecrement();
      }
    };

    const isAtMin = currentValue <= min;
    const isAtMax = currentValue >= max;

    return (
      <div className="flex flex-col gap-2 w-full">
        {label && (
          <label className="text-sm font-semibold text-[#181C20] font-[Montserrat]">
            {label}
          </label>
        )}
        <div
          className={cn(
            "group/input-number inline-flex items-center h-[50px] rounded-xl p-1 transition-all duration-200 border",
            statusStyles[status].container,
            disabled && "opacity-60 cursor-not-allowed grayscale",
            className
          )}
        >
          {prefix && (
            <span className="flex items-center px-3 text-sm font-bold text-primary select-none shrink-0">
              {prefix}
            </span>
          )}

          <button
            type="button"
            tabIndex={-1}
            disabled={disabled || isAtMin}
            onClick={handleDecrement}
            aria-label="Decrement"
            className={cn(
              "flex items-center justify-center w-[29px] h-10 rounded-lg shrink-0 transition-all duration-150",
              "text-primary hover:bg-black/5 active:scale-90",
              (disabled || isAtMin) && "text-text-muted hover:bg-transparent cursor-not-allowed"
            )}
          >
            <Minus size={14} strokeWidth={2.5} />
          </button>

          <input
            id={id}
            ref={(el) => {
              if (typeof ref === "function") ref(el);
              else if (ref)
                (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
              (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
            }}
            type="text"
            inputMode="numeric"
            value={currentValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            className={cn(
              "flex-1 min-w-[40px] h-10 bg-transparent text-center outline-none",
              "font-semibold text-base text-[#181C20] font-[Montserrat]",
              "placeholder:text-[#727785]",
              disabled && "text-text-muted cursor-not-allowed"
            )}
          />

          <button
            type="button"
            tabIndex={-1}
            disabled={disabled || isAtMax}
            onClick={handleIncrement}
            aria-label="Increment"
            className={cn(
              "flex items-center justify-center w-[29px] h-10 rounded-lg shrink-0 transition-all duration-150",
              "text-primary hover:bg-black/5 active:scale-90",
              (disabled || isAtMax) && "text-text-muted hover:bg-transparent cursor-not-allowed"
            )}
          >
            <Plus size={14} strokeWidth={2.5} />
          </button>

          {statusStyles[status].icon && (
            <div className="flex items-center px-2 shrink-0">
              {statusStyles[status].icon}
            </div>
          )}

          {suffix && (
            <span className="flex items-center px-3 text-sm font-bold text-primary select-none shrink-0">
              {suffix}
            </span>
          )}
        </div>
        {message && (
          <span className={cn(
            "text-[12px] font-medium font-[Montserrat] mt-1 flex items-center gap-1",
            statusStyles[status].text
          )}>
            {message}
          </span>
        )}
      </div>
    );
  }
);

InputNumber.displayName = "InputNumber";

// ... InputNumberBorderless remains mostly same but I'll update typography
export interface InputNumberBorderlessProps {
  label: string;
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  onChange?: (value: number) => void;
  controlVariant?: "circle" | "arrow";
  className?: string;
}

export const InputNumberBorderless = React.forwardRef<
  HTMLInputElement,
  InputNumberBorderlessProps
>(
  (
    {
      label,
      value: controlledValue,
      defaultValue = 0,
      min = -Infinity,
      max = Infinity,
      step = 1,
      disabled = false,
      onChange,
      controlVariant = "circle",
      className,
    },
    ref
  ) => {
    const id = useId();
    const [internalValue, setInternalValue] = useState(defaultValue);
    const isControlled = controlledValue !== undefined;
    const currentValue = isControlled ? controlledValue : internalValue;

    const updateValue = useCallback(
      (newValue: number) => {
        const clamped = Math.min(max, Math.max(min, newValue));
        if (!isControlled) setInternalValue(clamped);
        onChange?.(clamped);
      },
      [min, max, isControlled, onChange]
    );

    const handleDecrement = () => {
      if (disabled) return;
      updateValue(currentValue - step);
    };

    const handleIncrement = () => {
      if (disabled) return;
      updateValue(currentValue + step);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (raw === "" || raw === "-") return;
      const parsed = parseFloat(raw);
      if (!isNaN(parsed)) updateValue(parsed);
    };

    const isAtMin = currentValue <= min;
    const isAtMax = currentValue >= max;

    const displayValue = String(currentValue).padStart(2, "0");

    return (
      <div
        className={cn(
          "flex items-center justify-between py-1 border-b border-border-default",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        <span
          className={cn(
            "text-sm font-medium text-[#181C20] font-[Montserrat]",
            disabled && "text-text-muted"
          )}
        >
          {label}
        </span>

        <div className="flex items-center gap-4">
          <button
            type="button"
            tabIndex={-1}
            disabled={disabled || isAtMin}
            onClick={handleDecrement}
            aria-label="Decrement"
            className={cn(
              "flex items-center justify-center transition-all duration-150",
              "text-primary hover:text-primary-dark active:scale-90",
              (disabled || isAtMin) && "text-text-muted cursor-not-allowed"
            )}
          >
            {controlVariant === "circle" ? (
              <CircleMinusIcon className="w-5 h-5" />
            ) : (
              <ChevronDownIcon className="w-3 h-[7px]" />
            )}
          </button>

          <input
            id={id}
            ref={ref}
            type="text"
            inputMode="numeric"
            value={displayValue}
            onChange={handleInputChange}
            disabled={disabled}
            className={cn(
              "w-8 text-center bg-transparent outline-none font-bold text-base text-[#181C20] font-[Montserrat]",
              disabled && "text-text-muted cursor-not-allowed"
            )}
          />

          <button
            type="button"
            tabIndex={-1}
            disabled={disabled || isAtMax}
            onClick={handleIncrement}
            aria-label="Increment"
            className={cn(
              "flex items-center justify-center transition-all duration-150",
              "text-primary hover:text-primary-dark active:scale-90",
              (disabled || isAtMax) && "text-text-muted cursor-not-allowed"
            )}
          >
            {controlVariant === "circle" ? (
              <CirclePlusIcon className="w-5 h-5" />
            ) : (
              <ChevronUpIcon className="w-3 h-[7px]" />
            )}
          </button>
        </div>
      </div>
    );
  }
);

InputNumberBorderless.displayName = "InputNumberBorderless";

function CircleMinusIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 11H15V9H5V11ZM10 20C8.61667 20 7.31667 19.7375 6.1 19.2125C4.88333 18.6875 3.825 17.975 2.925 17.075C2.025 16.175 1.3125 15.1167 0.7875 13.9C0.2625 12.6833 0 11.3833 0 10C0 8.61667 0.2625 7.31667 0.7875 6.1C1.3125 4.88333 2.025 3.825 2.925 2.925C3.825 2.025 4.88333 1.3125 6.1 0.7875C7.31667 0.2625 8.61667 0 10 0C11.3833 0 12.6833 0.2625 13.9 0.7875C15.1167 1.3125 16.175 2.025 17.075 2.925C17.975 3.825 18.6875 4.88333 19.2125 6.1C19.7375 7.31667 20 8.61667 20 10C20 11.3833 19.7375 12.6833 19.2125 13.9C18.6875 15.1167 17.975 16.175 17.075 17.075C16.175 17.975 15.1167 18.6875 13.9 19.2125C12.6833 19.7375 11.3833 20 10 20ZM10 18C12.2333 18 14.125 17.225 15.675 15.675C17.225 14.125 18 12.2333 18 10C18 7.76667 17.225 5.875 15.675 4.325C14.125 2.775 12.2333 2 10 2C7.76667 2 5.875 2.775 4.325 4.325C2.775 5.875 2 7.76667 2 10C2 12.2333 2.775 14.125 4.325 15.675C5.875 17.225 7.76667 18 10 18Z"
        fill="currentColor"
      />
    </svg>
  );
}

function CirclePlusIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9 15H11V11H15V9H11V5H9V9H5V11H9V15ZM10 20C8.61667 20 7.31667 19.7375 6.1 19.2125C4.88333 18.6875 3.825 17.975 2.925 17.075C2.025 16.175 1.3125 15.1167 0.7875 13.9C0.2625 12.6833 0 11.3833 0 10C0 8.61667 0.2625 7.31667 0.7875 6.1C1.3125 4.88333 2.025 3.825 2.925 2.925C3.825 2.025 4.88333 1.3125 6.1 0.7875C7.31667 0.2625 8.61667 0 10 0C11.3833 0 12.6833 0.2625 13.9 0.7875C15.1167 1.3125 16.175 2.025 17.075 2.925C17.975 3.825 18.6875 4.88333 19.2125 6.1C19.7375 7.31667 20 8.61667 20 10C20 11.3833 19.7375 12.6833 19.2125 13.9C18.6875 15.1167 17.975 16.175 17.075 17.075C16.175 17.975 15.1167 18.6875 13.9 19.2125C12.6833 19.7375 11.3833 20 10 20ZM10 18C12.2333 18 14.125 17.225 15.675 15.675C17.225 14.125 18 12.2333 18 10C18 7.76667 17.225 5.875 15.675 4.325C14.125 2.775 12.2333 2 10 2C7.76667 2 5.875 2.775 4.325 4.325C2.775 5.875 2 7.76667 2 10C2 12.2333 2.775 14.125 4.325 15.675C5.875 17.225 7.76667 18 10 18Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 12 7"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 7L0 1L1.4 0L6 4.6L10.6 0L12 1L6 7Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ChevronUpIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 12 7"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 0L12 6L10.6 7L6 2.4L1.4 7L0 6L6 0Z"
        fill="currentColor"
      />
    </svg>
  );
}
