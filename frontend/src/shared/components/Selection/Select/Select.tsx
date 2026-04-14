import React, { useState, useRef, useEffect } from "react";
import { HiChevronDown } from "react-icons/hi2";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  error?: string;
}

export const Select = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  label,
  className = "",
  error,
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`flex flex-col gap-2 ${className}`} ref={containerRef}>
      {label && (
        <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">
          {label}
        </label>
      )}

      <div className="relative">

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full flex items-center justify-between px-5 py-3.5 rounded-2xl border-2 transition-all text-left font-medium
            ${isOpen ? "border-[#1B4FBF] bg-white shadow-sm" : "border-slate-100 bg-slate-50/30 hover:border-slate-200"}
            ${selectedOption ? "text-slate-700" : "text-slate-400"}
            ${error ? "border-red-500" : ""}
          `}
        >
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
          <HiChevronDown 
            className={`transition-transform duration-300 text-slate-400 ${isOpen ? "rotate-180 text-[#1B4FBF]" : ""}`} 
            size={20} 
          />
        </button>


        {isOpen && (
          <div className="absolute z-50 w-full mt-2 py-2 bg-white border border-slate-100 rounded-2xl shadow-xl animate-in fade-in zoom-in duration-200 origin-top">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`
                  w-full px-5 py-3 text-left text-sm font-medium transition-colors
                  ${option.value === value ? "text-[#1B4FBF] bg-blue-50/50" : "text-slate-600 hover:bg-slate-50 hover:text-[#1B4FBF]"}
                `}
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

      {error && <p className="text-xs text-red-500 ml-1">{error}</p>}
    </div>
  );
};
