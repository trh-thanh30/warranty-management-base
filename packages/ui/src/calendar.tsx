"use client";

import * as React from "react";
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
} from "react-day-picker";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "./button";
import { cn } from "./lib/utils";

export function Calendar({
  captionLayout = "label",
  className,
  classNames,
  components,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  const defaults = getDefaultClassNames();

  return (
    <DayPicker
      captionLayout={captionLayout}
      className={cn("p-1 [--cell-size:2.25rem]", className)}
      classNames={{
        root: cn("w-fit", defaults.root),
        months: cn("relative flex flex-col gap-4", defaults.months),
        month: cn("flex w-full flex-col gap-3", defaults.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between",
          defaults.nav,
        ),
        button_previous: cn(
          buttonVariants({ size: "icon", variant: "ghost" }),
          "size-9 p-0 aria-disabled:opacity-40",
          defaults.button_previous,
        ),
        button_next: cn(
          buttonVariants({ size: "icon", variant: "ghost" }),
          "size-9 p-0 aria-disabled:opacity-40",
          defaults.button_next,
        ),
        month_caption: cn(
          "flex h-9 w-full items-center justify-center px-9",
          defaults.month_caption,
        ),
        caption_label: cn(
          "select-none text-sm font-semibold",
          defaults.caption_label,
        ),
        month_grid: cn("w-full border-collapse", defaults.month_grid),
        weekdays: cn("flex", defaults.weekdays),
        weekday: cn(
          "flex-1 select-none text-center text-xs font-normal text-slate-500 dark:text-slate-400",
          defaults.weekday,
        ),
        week: cn("mt-1 flex w-full", defaults.week),
        day: cn("relative aspect-square size-9 p-0 text-center", defaults.day),
        range_start: cn(
          "rounded-l-md bg-slate-100 dark:bg-slate-800",
          defaults.range_start,
        ),
        range_middle: cn(
          "rounded-none bg-slate-100 dark:bg-slate-800",
          defaults.range_middle,
        ),
        range_end: cn(
          "rounded-r-md bg-slate-100 dark:bg-slate-800",
          defaults.range_end,
        ),
        today: cn("rounded-md bg-slate-100 dark:bg-slate-800", defaults.today),
        outside: cn("text-slate-400 dark:text-slate-600", defaults.outside),
        disabled: cn("pointer-events-none opacity-40", defaults.disabled),
        hidden: cn("invisible", defaults.hidden),
        ...classNames,
      }}
      components={{
        Chevron: ({ className, orientation, ...iconProps }) => {
          if (orientation === "left") {
            return (
              <ChevronLeft className={cn("size-4", className)} {...iconProps} />
            );
          }
          if (orientation === "right") {
            return (
              <ChevronRight
                className={cn("size-4", className)}
                {...iconProps}
              />
            );
          }
          return (
            <ChevronDown className={cn("size-4", className)} {...iconProps} />
          );
        },
        DayButton: CalendarDayButton,
        ...components,
      }}
      showOutsideDays={showOutsideDays}
      {...props}
    />
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const ref = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <button
      className={cn(
        buttonVariants({ size: "icon", variant: "ghost" }),
        "size-9 rounded-md p-0 font-normal data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-slate-100 data-[range-start=true]:bg-slate-950 data-[range-start=true]:text-white data-[range-end=true]:bg-slate-950 data-[range-end=true]:text-white data-[selected-single=true]:bg-slate-950 data-[selected-single=true]:text-white dark:data-[range-middle=true]:bg-slate-800 dark:data-[range-start=true]:bg-slate-50 dark:data-[range-start=true]:text-slate-950 dark:data-[range-end=true]:bg-slate-50 dark:data-[range-end=true]:text-slate-950 dark:data-[selected-single=true]:bg-slate-50 dark:data-[selected-single=true]:text-slate-950",
        className,
      )}
      data-day={day.date.toISOString()}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      data-range-start={modifiers.range_start}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      ref={ref}
      type="button"
      {...props}
    />
  );
}
