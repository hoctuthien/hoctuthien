"use client";

import React, { useState } from "react";
import { HiChevronDown } from "react-icons/hi2";
import { CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import { cn } from "@/core/utils/cn";

export interface SelectOption {
  label: string;
  value: string;
}

export type SelectStatus = "default" | "success" | "warning" | "error";

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  error?: string;
  helperText?: string;
  status?: SelectStatus;
}

export const Select = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  label,
  className = "",
  error,
  helperText,
  status: providedStatus,
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);
  const status = providedStatus || (error ? "error" : "default");
  const message = error || helperText;

  const statusStyles = {
    default: {
      button: "bg-white border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10",
      text: "text-[#727785]",
      icon: null,
    },
    success: {
      button: "bg-[#86F898]/30 border-[#006E2C] text-[#006E2C] font-medium",
      text: "text-[#006E2C]",
      icon: <CheckCircle2 className="w-5 h-5 text-[#006E2C] mr-2" />,
    },
    warning: {
      button: "bg-[#987000]/10 border-[#795900]",
      text: "text-[#795900]",
      icon: <AlertTriangle className="w-5 h-5 text-[#795900] mr-2" />,
    },
    error: {
      button: "bg-[#FFDAD6]/30 border-[#BA1A1A] text-[#BA1A1A]",
      text: "text-[#BA1A1A]",
      icon: <AlertCircle className="w-5 h-5 text-[#BA1A1A] mr-2" />,
    },
  };

  const handleBlur = (e: React.FocusEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsOpen(false);
    }
  };

  return (
    <div 
      className={cn("flex flex-col gap-2 w-full outline-none", className)} 
      onBlur={handleBlur}
      tabIndex={-1}
    >
      {label && (
        <label className="text-sm font-semibold text-[#181C20] font-[Montserrat]">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full flex items-center justify-between px-4 h-[50px] transition-all duration-200 outline-none text-left border rounded-xl font-[Montserrat]",
            statusStyles[status].button,
            isOpen && status === "default" && "border-primary ring-4 ring-primary/10",
            selectedOption && status === "default" && "text-[#181C20] font-medium",
            !selectedOption && status === "default" && "text-[#727785]",
          )}
        >
          <div className="flex items-center min-w-0 flex-1">
            {statusStyles[status].icon}
            <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
          </div>
          <HiChevronDown 
            className={cn("transition-transform duration-300 text-[#727785] flex-shrink-0 ml-2", isOpen && "rotate-180 text-primary")} 
            size={20} 
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-2 py-2 bg-white border border-slate-100 rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.08)] animate-in fade-in zoom-in-95 duration-200 origin-top">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={cn(
                  "w-full px-4 py-3 text-left text-sm font-medium transition-colors font-[Montserrat]",
                  option.value === value 
                    ? "text-primary bg-primary/5 font-bold" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-primary"
                )}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
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
};
