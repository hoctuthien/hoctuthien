"use client";

import React, { useState, useId } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Clock, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export type TimePickerStatus = "default" | "success" | "warning" | "error";

export interface TimePickerProps {
  value?: string;
  onChange?: (time: string) => void;
  placeholder?: string;
  size?: "small" | "default" | "large";
  disabled?: boolean;
  className?: string;
  label?: string;
  error?: string;
  helperText?: string;
  status?: TimePickerStatus;
}

const TIME_SLOTS = [
  "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM",
  "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM",
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
  "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM"
];

export const TimePicker = ({
  value,
  onChange,
  placeholder = "Select time",
  size = "default",
  disabled = false,
  className,
  label,
  error,
  helperText,
  status: providedStatus,
}: TimePickerProps) => {
  const [time, setTime] = useState<string | undefined>(value);
  const id = useId();

  const handleSelect = (selectedTime: string) => {
    setTime(selectedTime);
    onChange?.(selectedTime);
  };

  const status = providedStatus || (error ? "error" : "default");
  const message = error || helperText;

  const sizeStyles = {
    small: "h-9 px-3 rounded-lg text-sm",
    default: "h-[50px] px-4 rounded-xl text-base",
    large: "h-14 px-5 rounded-xl text-lg",
  };

  const iconSizes = {
    small: 12,
    default: 16,
    large: 20,
  };

  const statusStyles = {
    default: {
      button: "bg-white border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10",
      text: "text-[#727785]",
      icon: null,
    },
    success: {
      button: "bg-[#86F898]/30 border-[#006E2C] text-[#006E2C] font-medium",
      text: "text-[#006E2C]",
      icon: <CheckCircle2 className="w-5 h-5 text-[#006E2C]" />,
    },
    warning: {
      button: "bg-[#987000]/10 border-[#795900]",
      text: "text-[#795900]",
      icon: <AlertTriangle className="w-5 h-5 text-[#795900]" />,
    },
    error: {
      button: "bg-[#FFDAD6]/30 border-[#BA1A1A] text-[#BA1A1A]",
      text: "text-[#BA1A1A]",
      icon: <AlertCircle className="w-5 h-5 text-[#BA1A1A]" />,
    },
  };

  return (
    <div className={cn("flex flex-col gap-2 w-full", className)}>
      {label && (
        <label className="text-sm font-semibold text-[#181C20] font-[Montserrat]">
          {label}
        </label>
      )}
      <Popover.Root>
        <Popover.Trigger asChild>
          <button
            id={id}
            disabled={disabled}
            className={cn(
              "group/time-picker relative flex items-center gap-3 transition-all duration-300 w-full outline-none border",
              sizeStyles[size],
              statusStyles[status].button,
              // Premium shadow only on default
              !disabled && status === "default" && "shadow-[0_12px_40px_rgba(0,91,191,0.12)]",
              // Hover State only on default
              !disabled && status === "default" && "hover:border-primary/50 hover:bg-slate-50",
              // Focused/Open State
              "data-[state=open]:border-primary data-[state=open]:ring-2 data-[state=open]:ring-primary/20",
              // Selected State Look
              time && !disabled && status === "default" && "text-[#181C20] font-medium",
              !time && status === "default" && "text-[#727785]",
              disabled && "opacity-50 cursor-not-allowed bg-slate-100",
            )}
          >
            <Clock
              size={iconSizes[size]}
              className={cn(
                "shrink-0 transition-colors",
                !disabled && status === "default" && "group-hover/time-picker:text-primary",
                time && status === "default" ? "text-primary" : "text-[#727785]",
                status !== "default" && "hidden"
              )}
            />
            <span className="truncate flex-1 text-left">{time || placeholder}</span>
            {statusStyles[status].icon && (
              <div className="shrink-0 ml-auto">
                {statusStyles[status].icon}
              </div>
            )}
          </button>
        </Popover.Trigger>
        <Popover.Content
          align="start"
          sideOffset={8}
          className={cn(
            "z-50 w-[240px] max-h-[320px] overflow-y-auto bg-white rounded-2xl p-3 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100",
            "animate-in fade-in zoom-in-95 duration-200"
          )}
        >
          <div className="flex flex-col gap-1.5">
            <div className="px-2 pb-2 mb-1 border-b border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Select Time</span>
              <Clock size={12} className="text-text-muted" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot}
                  onClick={() => handleSelect(slot)}
                  className={cn(
                    "w-full px-3 py-2.5 text-center text-[13px] rounded-xl transition-all duration-200",
                    time === slot
                      ? "bg-primary text-white font-bold shadow-lg shadow-primary/25"
                      : "hover:bg-primary/5 text-text-body hover:text-primary"
                  )}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        </Popover.Content>
      </Popover.Root>
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
};

TimePicker.displayName = "TimePicker";
