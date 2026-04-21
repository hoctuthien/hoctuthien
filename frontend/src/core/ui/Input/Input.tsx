import React from "react";
import { cn } from "@/core/utils/cn";
import { Icon } from "@/core/ui/Icon";

export type InputStatus = "default" | "verifying" | "success" | "warning" | "error";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  status?: InputStatus;
  containerClassName?: string;
  suffix?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, status: providedStatus, containerClassName, type, suffix, ...props }, ref) => {
    // Determine the status based on error prop or providedStatus
    const status = providedStatus || (error ? "error" : "default");
    const message = error || helperText;

    const statusStyles = {
      default: {
        input: "bg-white border-slate-200 focus:border-primary focus:ring-primary/10",
        icon: null,
        text: "text-[#727785]",
      },
      verifying: {
        input: "bg-white border-primary focus:border-primary focus:ring-primary/10 pr-10",
        icon: <Icon name="Loader2" className="w-5 h-5 text-primary animate-spin" />,
        text: "text-primary",
      },
      success: {
        input: "bg-[#86F898]/30 border-[#006E2C] text-[#006E2C] font-medium pr-10",
        icon: <Icon name="CheckCircle2" className="w-5 h-5 text-[#006E2C]" />,
        text: "text-[#006E2C]",
      },
      warning: {
        input: "bg-[#987000]/10 border-[#795900] pr-10",
        icon: <Icon name="AlertTriangle" className="w-5 h-5 text-[#795900]" />,
        text: "text-[#795900]",
      },
      error: {
        input: "bg-[#FFDAD6]/30 border-[#BA1A1A] text-[#BA1A1A] pr-10",
        icon: <Icon name="AlertCircle" className="w-5 h-5 text-[#BA1A1A]" />,
        text: "text-[#BA1A1A]",
      },
    };

    return (
      <div className={cn("flex flex-col gap-2 w-full", containerClassName)}>
        {label && (
          <label 
            htmlFor={props.id}
            className="text-sm font-semibold text-[#181C20] font-[Montserrat] cursor-pointer"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <input
            type={type}
            className={cn(
              "flex h-[50px] w-full px-4 py-3.5 text-base font-[Montserrat] transition-all duration-200 outline-none rounded-xl border",
              "placeholder:text-[#727785]",
              statusStyles[status].input,
              (suffix || statusStyles[status].icon) && "pr-12",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50",
              className
            )}
            ref={ref}
            {...props}
          />
          {(suffix || statusStyles[status].icon) && (
            <div className="absolute right-4 flex items-center">
              {suffix || statusStyles[status].icon}
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
  }
);

Input.displayName = "Input";
