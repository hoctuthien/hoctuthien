"use client";

import React, { useState, useRef, useEffect, createContext, useContext } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface DropdownContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLDivElement | null>;
}

const DropdownContext = createContext<DropdownContextType | undefined>(undefined);

const useDropdown = () => {
  const context = useContext(DropdownContext);
  if (!context) throw new Error("Dropdown sub-components must be used within a <Dropdown />");
  return context;
};

export const Dropdown: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen, triggerRef }}>
      <div className={cn("relative inline-block text-left font-sans", className)} ref={triggerRef}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
};

interface DropdownTriggerProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "text";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
}

export const DropdownTrigger: React.FC<DropdownTriggerProps> = ({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  className,
}) => {
  const { isOpen, setIsOpen } = useDropdown();

  const baseStyles = "inline-flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer select-none outline-none disabled:cursor-not-allowed";
  
  const variants = {
    primary: cn(
      "bg-[#2D89FF] !text-white border-none rounded-full font-bold shadow-sm",
      "hover:bg-[#1C75E5] hover:shadow-lg",
      "focus:ring-4 focus:ring-primary-opacity active:scale-95",
      disabled && "bg-border-default !text-white opacity-50 shadow-none pointer-events-none"
    ),
    secondary: cn(
      "bg-white !text-[#2D89FF] border border-outline-variant rounded-full font-semibold",
      "hover:border-[#2D89FF] hover:bg-surface-variant",
      "focus:ring-4 focus:ring-primary-opacity focus:border-[#2D89FF] active:scale-95",
      disabled && "bg-surface-variant text-text-muted border-outline-variant shadow-none pointer-events-none"
    ),
    text: cn(
      "bg-transparent !text-[#2D89FF] hover:text-[#1C75E5] font-extrabold",
      "focus:underline active:opacity-70",
      disabled && "text-text-muted opacity-50 pointer-events-none"
    ),
  };

  const sizes = {
    sm: "px-4 py-1.5 text-caption",
    md: "px-6 py-2.5 text-body-sm",
    lg: "px-8 py-3.5 text-body",
  };

  return (
    <button
      onClick={() => !disabled && setIsOpen(!isOpen)}
      disabled={disabled}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
    >
      {children}
      <ChevronDown
        size={variant === "text" ? 18 : 16}
        className={cn(
          "transition-all duration-300", 
          isOpen && "rotate-180",
          variant === "primary" && "!text-white",
          variant === "secondary" && "!text-[#2D89FF]",
          variant === "text" && "!text-[#2D89FF] group-hover:text-[#1C75E5]"
        )}
      />
    </button>
  );
};

export const DropdownMenu: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  const { isOpen } = useDropdown();

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "absolute z-50 mt-2 min-w-[240px] origin-top-left rounded-2xl bg-white border border-outline-variant p-2",
        "shadow-lg animate-in fade-in zoom-in-95 duration-200",
        className
      )}
    >
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
};

interface DropdownItemProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  isActive?: boolean;
  isDanger?: boolean;
  onClick?: () => void;
  className?: string;
}

export const DropdownItem: React.FC<DropdownItemProps> = ({
  children,
  icon,
  isActive,
  isDanger,
  onClick,
  className,
}) => {
  const { setIsOpen } = useDropdown();

  const handleClick = () => {
    if (onClick) onClick();
    setIsOpen(false);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "flex items-center justify-between w-full p-3.5 rounded-xl text-left transition-all duration-300 cursor-pointer group",
        "text-body-sm font-medium",
        isActive ? "text-primary bg-primary-fixed" : "text-text-body hover:bg-surface-variant hover:text-primary",
        isDanger && "text-red-600 hover:bg-red-50 hover:text-red-700",
        className
      )}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <span className={cn(
            "flex items-center justify-center transition-colors duration-200 w-5 h-5", 
            isActive ? "text-primary" : "text-text-muted group-hover:text-primary",
            isDanger && "text-red-600 group-hover:text-red-700"
          )}>
            {icon}
          </span>
        )}
        <span>{children}</span>
      </div>
      {isActive && <Check size={16} className="text-primary" />}
    </button>
  );
};

export const DropdownDivider: React.FC = () => (
  <div className="h-px bg-outline-variant my-1 mx-2" />
);
