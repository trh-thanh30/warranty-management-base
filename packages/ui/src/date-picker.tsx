"use client";

import * as React from "react";
import { CalendarDays } from "lucide-react";
import type { DayPicker } from "react-day-picker";
import { Button } from "./button";
import { Calendar } from "./calendar";
import {
  formatDateLabel,
  parseDateValue,
  toDateValue,
} from "./date-picker.utils";
import { cn } from "./lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

type DatePickerProps = {
  ariaLabel: string;
  className?: string;
  disabled?: boolean;
  disabledDates?: React.ComponentProps<typeof DayPicker>["disabled"];
  id?: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  value?: string;
};

export function DatePicker({
  ariaLabel,
  className,
  disabled,
  disabledDates,
  id,
  onValueChange,
  placeholder,
  value,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const selectedDate = parseDateValue(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          aria-label={ariaLabel}
          className={cn(
            "w-full justify-start overflow-hidden text-left font-normal",
            !selectedDate && "text-slate-500 dark:text-slate-400",
            className,
          )}
          disabled={disabled}
          id={id}
          type="button"
          variant="secondary"
        >
          <CalendarDays className="size-4 shrink-0" />
          <span className="truncate">
            {selectedDate ? formatDateLabel(selectedDate) : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-2">
        <Calendar
          disabled={disabledDates}
          mode="single"
          onSelect={(date) => {
            onValueChange(toDateValue(date));
            if (date) setOpen(false);
          }}
          selected={selectedDate}
        />
      </PopoverContent>
    </Popover>
  );
}
