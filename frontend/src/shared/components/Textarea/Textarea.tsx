import React from "react";
import { cn } from "@/core/utils/cn";
import { CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";

export type TextareaStatus = "default" | "success" | "warning" | "error";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  status?: TextareaStatus;
  containerClassName?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, status: providedStatus, containerClassName, ...props }, ref) => {
    const status = providedStatus || (error ? "error" : "default");
    const message = error || helperText;

    const statusStyles = {
      default: {
        textarea: "bg-white border-slate-200 focus:border-primary focus:ring-primary/10",
        icon: null,
        text: "text-[#727785]",
      },
      success: {
        textarea: "bg-[#86F898]/30 border-[#006E2C] text-[#006E2C] font-medium pr-10",
        icon: <CheckCircle2 className="w-5 h-5 text-[#006E2C]" />,
        text: "text-[#006E2C]",
      },
      warning: {
        textarea: "bg-[#987000]/10 border-[#795900] pr-10",
        icon: <AlertTriangle className="w-5 h-5 text-[#795900]" />,
        text: "text-[#795900]",
      },
      error: {
        textarea: "bg-[#FFDAD6]/30 border-[#BA1A1A] text-[#BA1A1A] pr-10",
        icon: <AlertCircle className="w-5 h-5 text-[#BA1A1A]" />,
        text: "text-[#BA1A1A]",
      },
    };

    return (
      <div className={cn("flex flex-col gap-2 w-full", containerClassName)}>
        {label && (
          <label className="text-sm font-semibold text-[#181C20] font-[Montserrat]">
            {label}
          </label>
        )}
        <div className="relative">
          <textarea
            className={cn(
              "flex min-h-[120px] w-full px-4 py-3.5 text-base font-[Montserrat] transition-all duration-200 outline-none resize-none rounded-xl border",
              "placeholder:text-[#727785]",
              statusStyles[status].textarea,
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50",
              className
            )}
            ref={ref}
            {...props}
          />
          {statusStyles[status].icon && (
            <div className="absolute right-4 top-4 flex items-center pointer-events-none">
              {statusStyles[status].icon}
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

Textarea.displayName = "Textarea";
