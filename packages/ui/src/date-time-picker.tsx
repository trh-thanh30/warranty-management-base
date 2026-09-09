"use client";

import * as React from "react";
import { CalendarClock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Input } from "./input";
import { cn } from "./lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

type DateTimePickerProps = {
  ariaLabel: string;
  calendarAriaLabel?: string;
  clearLabel?: string;
  disabled?: boolean;
  hourLabel?: string;
  id?: string;
  invalid?: boolean;
  minuteLabel?: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  resetLabel?: string;
  value?: string;
};

const hours = Array.from({ length: 24 }, (_, index) =>
  String(index).padStart(2, "0"),
);
const minutes = Array.from({ length: 60 }, (_, index) =>
  String(index).padStart(2, "0"),
);

function parseDateTimeValue(value?: string) {
  if (!value) return undefined;

  const date = parseISO(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function toDateTimeValue(date: Date, hour: string, minute: string) {
  return `${format(date, "yyyy-MM-dd")}T${hour}:${minute}`;
}

function getCurrentDateTimeValue() {
  const now = new Date();
  return toDateTimeValue(now, format(now, "HH"), format(now, "mm"));
}

export function formatDateTimeInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 12);
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);
  const hour = digits.slice(8, 10);
  const minute = digits.slice(10, 12);

  let formattedValue = day;
  if (month) formattedValue += `/${month}`;
  if (year) formattedValue += `/${year}`;
  if (hour) formattedValue += ` ${hour}`;
  if (minute) formattedValue += `:${minute}`;

  return formattedValue;
}

function parseManualDateTime(value: string) {
  const normalizedValue = value.trim();
  const match = normalizedValue.match(
    /^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}))?$/,
  );

  if (!match) return undefined;

  const [, day, month, year, hour = "00", minute = "00"] = match;
  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
  );

  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day) ||
    date.getHours() !== Number(hour) ||
    date.getMinutes() !== Number(minute)
  ) {
    return undefined;
  }

  return date;
}

export function DateTimePicker({
  ariaLabel,
  calendarAriaLabel,
  clearLabel = "Clear",
  disabled,
  hourLabel = "Hour",
  id,
  invalid,
  minuteLabel = "Minute",
  onValueChange,
  placeholder,
  resetLabel = "Set to current time",
  value,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const selectedDate = parseDateTimeValue(value);
  const formattedValue = selectedDate
    ? format(selectedDate, "dd/MM/yyyy HH:mm")
    : "";
  const [inputValue, setInputValue] = React.useState(formattedValue);
  const [inputIsInvalid, setInputIsInvalid] = React.useState(false);
  const hour = selectedDate ? format(selectedDate, "HH") : "00";
  const minute = selectedDate ? format(selectedDate, "mm") : "00";

  React.useEffect(() => {
    setInputValue(formattedValue);
    setInputIsInvalid(false);
  }, [formattedValue]);

  const selectDate = (date: Date) => {
    const nextValue = toDateTimeValue(date, hour, minute);
    const nextTime = parseDateTimeValue(nextValue)?.getTime() ?? 0;
    onValueChange(
      nextTime > Date.now() ? getCurrentDateTimeValue() : nextValue,
    );
  };

  const selectTime = (nextHour: string, nextMinute: string) => {
    if (selectedDate) {
      const nextValue = toDateTimeValue(selectedDate, nextHour, nextMinute);
      const nextTime = parseDateTimeValue(nextValue)?.getTime() ?? 0;
      onValueChange(
        nextTime > Date.now() ? getCurrentDateTimeValue() : nextValue,
      );
    }
  };

  const commitManualInput = () => {
    if (!inputValue.trim()) {
      setInputIsInvalid(false);
      onValueChange("");
      return;
    }

    const date = parseManualDateTime(inputValue);
    if (!date) {
      const nowValue = getCurrentDateTimeValue();
      setInputValue(format(parseDateTimeValue(nowValue)!, "dd/MM/yyyy HH:mm"));
      setInputIsInvalid(false);
      onValueChange(nowValue);
      return;
    }

    if (date.getTime() > Date.now()) {
      const nowValue = getCurrentDateTimeValue();
      setInputValue(format(parseDateTimeValue(nowValue)!, "dd/MM/yyyy HH:mm"));
      setInputIsInvalid(false);
      onValueChange(nowValue);
      return;
    }

    setInputValue(format(date, "dd/MM/yyyy HH:mm"));
    setInputIsInvalid(false);
    onValueChange(
      toDateTimeValue(date, format(date, "HH"), format(date, "mm")),
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="flex w-full">
        <Input
          aria-invalid={invalid || inputIsInvalid}
          aria-label={ariaLabel}
          className={cn(
            "rounded-r-none text-base sm:text-sm",
            (invalid || inputIsInvalid) &&
              "border-red-500 focus:border-red-600 dark:border-red-500",
          )}
          disabled={disabled}
          id={id}
          onBlur={commitManualInput}
          onChange={(event) => {
            setInputValue(formatDateTimeInput(event.target.value));
            setInputIsInvalid(false);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commitManualInput();
            }
            if (event.key === "Escape") {
              setInputValue(formattedValue);
              setInputIsInvalid(false);
            }
          }}
          placeholder={placeholder}
          value={inputValue}
        />
        <PopoverTrigger asChild>
          <Button
            aria-label={calendarAriaLabel ?? ariaLabel}
            className={cn(
              "-ml-px shrink-0 rounded-l-none",
              invalid &&
                "border-red-500 focus:border-red-600 dark:border-red-500",
            )}
            disabled={disabled}
            size="icon"
            type="button"
            variant="secondary"
          >
            <CalendarClock aria-hidden="true" className="size-4" />
          </Button>
        </PopoverTrigger>
      </div>
      <PopoverContent align="start" className="w-auto min-w-80 p-3">
        <Calendar
          mode="single"
          onSelect={(date) => {
            if (date) selectDate(date);
          }}
          selected={selectedDate}
        />
        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-200 pt-3 dark:border-slate-800">
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
              {hourLabel}
            </p>
            <Select
              disabled={!selectedDate || disabled}
              onValueChange={(nextHour) => selectTime(nextHour, minute)}
              value={hour}
            >
              <SelectTrigger aria-label={hourLabel}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {hours.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
              {minuteLabel}
            </p>
            <Select
              disabled={!selectedDate || disabled}
              onValueChange={(nextMinute) => selectTime(hour, nextMinute)}
              value={minute}
            >
              <SelectTrigger aria-label={minuteLabel}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {minutes.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button
          className="mt-2 w-full"
          disabled={disabled}
          onClick={() => {
            const nowValue = getCurrentDateTimeValue();
            const now = parseDateTimeValue(nowValue);
            if (!now) return;
            setInputValue(format(now, "dd/MM/yyyy HH:mm"));
            setInputIsInvalid(false);
            onValueChange(nowValue);
            setOpen(false);
          }}
          type="button"
          variant="outline"
        >
          {resetLabel}
        </Button>
        <Button
          className="mt-2 w-full"
          disabled={!selectedDate}
          onClick={() => {
            onValueChange("");
            setInputValue("");
            setInputIsInvalid(false);
            setOpen(false);
          }}
          type="button"
          variant="ghost"
        >
          {clearLabel}
        </Button>
      </PopoverContent>
    </Popover>
  );
}
