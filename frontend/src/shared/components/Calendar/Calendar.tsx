"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
  type Locale,
} from "react-day-picker"

import { cn } from "@/shared/lib/utils"
import { Button, buttonVariants } from "@/shared/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  locale,
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "group/calendar bg-white rounded-2xl md:rounded-[32px] p-4 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-50",
        "[--cell-radius:8px] md:[--cell-radius:12px]",
        className
      )}
      captionLayout={captionLayout}
      locale={locale}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString(locale?.code, { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "relative flex flex-col gap-4 md:flex-row",
          defaultClassNames.months
        ),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        nav: cn(
          "absolute right-0 top-0 flex items-center gap-1",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: "ghost", size: "icon-sm" }),
          "size-7 md:size-8 p-0 rounded-full hover:bg-slate-100 select-none aria-disabled:opacity-50 transition-colors",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost", size: "icon-sm" }),
          "size-7 md:size-8 p-0 rounded-full hover:bg-slate-100 select-none aria-disabled:opacity-50 transition-colors",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex h-8 items-center justify-start px-1",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "flex h-8 w-full items-center justify-start gap-1.5 text-sm font-bold text-slate-900",
          defaultClassNames.dropdowns
        ),
        caption_label: cn(
          "text-base md:text-[17px] font-bold text-[#0D1A33] select-none",
          defaultClassNames.caption_label
        ),
        table: "w-full border-separate border-spacing-y-0.5",
        weekdays: cn("flex mb-2", defaultClassNames.weekdays),
        weekday: cn(
          "w-10 md:w-12 text-[10px] md:text-[11px] font-bold text-text-muted uppercase tracking-widest text-center py-2 select-none",
          defaultClassNames.weekday
        ),
        week: cn("flex w-full", defaultClassNames.week),
        day: cn(
          "relative h-10 w-10 md:h-12 md:w-12 p-0 flex items-center justify-center select-none",
          defaultClassNames.day
        ),
        range_start: cn(
          "rounded-l-(--cell-radius) bg-slate-100",
          defaultClassNames.range_start
        ),
        range_middle: cn(
          "bg-slate-50 !rounded-none", 
          defaultClassNames.range_middle
        ),
        range_end: cn(
          "rounded-r-(--cell-radius) bg-slate-100",
          defaultClassNames.range_end
        ),
        today: cn(
          "[&_button]:relative [&_button]:after:absolute [&_button]:after:bottom-1 [&_button]:after:left-1/2 [&_button]:after:-translate-x-1/2 [&_button]:after:size-1 [&_button]:after:rounded-full [&_button]:after:bg-emerald-500",
          defaultClassNames.today
        ),
        outside: cn(
          "text-slate-300 opacity-50 aria-selected:text-slate-300",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-slate-200 opacity-50",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon
                className={cn("size-4 text-primary", className)}
                {...props}
              />
            )
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn("size-4 text-primary", className)}
                {...props}
              />
            )
          }

          return (
            <ChevronDownIcon className={cn("size-4 text-slate-500", className)} {...props} />
          )
        },
        DayButton: ({ ...props }) => (
          <CalendarDayButton locale={locale} {...props} />
        ),
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  locale,
  ...props
}: React.ComponentProps<typeof DayButton> & { locale?: Partial<Locale> }) {
  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn(
        "size-8 md:size-10 rounded-lg md:rounded-[12px] font-medium transition-all duration-200",
        "bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900",
        modifiers.selected && [
          "bg-[#005BBF] text-white hover:bg-[#005BBF]/90 hover:text-white shadow-md shadow-blue-200/50 scale-[1.05] z-10",
        ],
        modifiers.outside && "bg-transparent text-slate-300 opacity-40 hover:bg-transparent",
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
