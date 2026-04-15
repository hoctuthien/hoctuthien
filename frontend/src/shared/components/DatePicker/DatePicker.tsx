"use client";

import React, { useState, useId } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Calendar as CalendarIcon, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Calendar } from "@/shared/components/Calendar/Calendar";

export type DatePickerStatus = "default" | "success" | "warning" | "error";

export interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  size?: "small" | "default" | "large";
  disabled?: boolean;
  className?: string;
  label?: string;
  error?: string;
  helperText?: string;
  status?: DatePickerStatus;
}

export const DatePicker = ({
  value,
  onChange,
  placeholder = "Select date",
  size = "default",
  disabled = false,
  className,
  label,
  error,
  helperText,
  status: providedStatus,
}: DatePickerProps) => {
  const [date, setDate] = useState<Date | undefined>(value);
  const id = useId();

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    onChange?.(selectedDate);
  };

  const status = providedStatus || (error ? "error" : "default");
  const message = error || helperText;

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0]; // YYYY-MM-DD
  };

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
              "group/date-picker relative flex items-center gap-3 transition-all duration-300 w-full outline-none border",
              sizeStyles[size],
              statusStyles[status].button,
              // Premium shadow only on default
              !disabled && status === "default" && "shadow-[0_12px_40px_rgba(0,91,191,0.12)]",
              // Hover State only on default
              !disabled && status === "default" && "hover:border-primary/50 hover:bg-slate-50",
              // Focused/Open State
              "data-[state=open]:border-primary data-[state=open]:ring-2 data-[state=open]:ring-primary/20",
              // Selected State Look (if date is present and default)
              date && !disabled && status === "default" && "text-[#181C20] font-medium",
              !date && status === "default" && "text-[#727785]",
              disabled && "opacity-50 cursor-not-allowed bg-slate-100",
            )}
          >
            <CalendarIcon
              size={iconSizes[size]}
              className={cn(
                "shrink-0 transition-colors",
                !disabled && status === "default" && "group-hover/date-picker:text-primary",
                date && status === "default" ? "text-primary" : "text-[#727785]",
                status !== "default" && "hidden" // Hide calendar icon if status icon is present? 
                // Actually, let's keep it if success/warning? 
                // Guideline says icon on the right. 
              )}
            />
            <span className="truncate flex-1 text-left">
              {date ? formatDate(date) : placeholder}
            </span>
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
          className="z-50 animate-in fade-in zoom-in-95 duration-200"
        >
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            initialFocus
            disabled={disabled}
          />
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

DatePicker.displayName = "DatePicker";
