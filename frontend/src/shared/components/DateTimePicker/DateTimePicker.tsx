"use client";

import React, { useState } from "react";
import { DatePicker } from "../DatePicker/DatePicker";
import { TimePicker } from "../TimePicker/TimePicker";
import { cn } from "@/shared/lib/utils";

export interface DateTimePickerProps {
  dateValue?: Date;
  timeValue?: string;
  onChange?: (date: Date | undefined, time: string | undefined) => void;
  size?: "small" | "default" | "large";
  disabled?: boolean;
  className?: string;
}

export const DateTimePicker = ({
  dateValue,
  timeValue,
  onChange,
  size = "default",
  disabled = false,
  className,
}: DateTimePickerProps) => {
  const [date, setDate] = useState<Date | undefined>(dateValue);
  const [time, setTime] = useState<string | undefined>(timeValue);

  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
    onChange?.(newDate, time);
  };

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    onChange?.(date, newTime);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <DatePicker
        value={date}
        onChange={handleDateChange}
        size={size}
        disabled={disabled}
        className="flex-[2]"
      />
      <TimePicker
        value={time}
        onChange={handleTimeChange}
        size={size}
        disabled={disabled}
        className="flex-1"
      />
    </div>
  );
};
