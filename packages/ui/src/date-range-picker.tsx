"use client";

import * as React from "react";
import { CalendarRange } from "lucide-react";
import type { DateRange, DayPicker } from "react-day-picker";
import { Button } from "./button";
import { Calendar } from "./calendar";
import {
  formatDateLabel,
  parseDateValue,
  toDateValue,
} from "./date-picker.utils";
import { cn } from "./lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export type DateRangeValue = {
  from?: string;
  to?: string;
};

type DateRangePickerProps = {
  ariaLabel: string;
  className?: string;
  clearLabel: string;
  disabled?: boolean;
  disabledDates?: React.ComponentProps<typeof DayPicker>["disabled"];
  onValueChange: (value: DateRangeValue) => void;
  placeholder: string;
  value: DateRangeValue;
};

export function DateRangePicker({
  ariaLabel,
  className,
  clearLabel,
  disabled,
  disabledDates,
  onValueChange,
  placeholder,
  value,
}: DateRangePickerProps) {
  const selectedRange: DateRange | undefined = value.from
    ? {
        from: parseDateValue(value.from),
        to: parseDateValue(value.to),
      }
    : undefined;
  const label = selectedRange?.from
    ? selectedRange.to
      ? `${formatDateLabel(selectedRange.from)} – ${formatDateLabel(selectedRange.to)}`
      : formatDateLabel(selectedRange.from)
    : placeholder;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          aria-label={ariaLabel}
          className={cn(
            "min-w-0 w-full max-w-full justify-start overflow-hidden text-left font-normal",
            !selectedRange?.from && "text-slate-500 dark:text-slate-400",
            className,
          )}
          disabled={disabled}
          type="button"
          variant="secondary"
        >
          <CalendarRange className="size-4 shrink-0" />
          <span className="truncate">{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="p-2">
        <Calendar
          defaultMonth={selectedRange?.from}
          disabled={disabledDates}
          mode="range"
          onSelect={(range) =>
            onValueChange({
              from: toDateValue(range?.from) || undefined,
              to: toDateValue(range?.to) || undefined,
            })
          }
          selected={selectedRange}
        />
        {selectedRange?.from ? (
          <div className="border-t border-slate-200 px-1 pt-2 dark:border-slate-800">
            <Button
              className="w-full"
              onClick={() => onValueChange({})}
              size="sm"
              type="button"
              variant="ghost"
            >
              {clearLabel}
            </Button>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
