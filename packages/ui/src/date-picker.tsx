"use client";

import * as React from "react";
import { CalendarDays } from "lucide-react";
import type { DayPicker } from "react-day-picker";
import { Button } from "./button";
import { Calendar } from "./calendar";
import {
  constrainDateInput,
  formatDateInput,
  formatDateLabel,
  parseDateInput,
  parseDateValue,
  toDateValue,
} from "./date-picker.utils";
import { Input } from "./input";
import { cn } from "./lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

type DatePickerProps = {
  allowManualInput?: boolean;
  ariaLabel: string;
  calendarAriaLabel?: string;
  captionLayout?: React.ComponentProps<typeof DayPicker>["captionLayout"];
  className?: string;
  disabled?: boolean;
  disabledDates?: React.ComponentProps<typeof DayPicker>["disabled"];
  endMonth?: Date;
  id?: string;
  inputPlaceholder?: string;
  invalidInputMessage?: string;
  maxDate?: Date;
  minDate?: Date;
  onValueChange: (value: string) => void;
  placeholder: string;
  startMonth?: Date;
  value?: string;
};

export function DatePicker({
  allowManualInput = false,
  ariaLabel,
  calendarAriaLabel,
  captionLayout,
  className,
  disabled,
  disabledDates,
  endMonth,
  id,
  inputPlaceholder,
  invalidInputMessage,
  maxDate,
  minDate,
  onValueChange,
  placeholder,
  startMonth,
  value,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const selectedDate = parseDateValue(value);
  const formattedValue = selectedDate ? formatDateLabel(selectedDate) : "";
  const [inputValue, setInputValue] = React.useState(formattedValue);
  const [inputIsInvalid, setInputIsInvalid] = React.useState(false);
  const inputErrorId = id ? `${id}-error` : undefined;
  const calendarDisabled: React.ComponentProps<typeof DayPicker>["disabled"] = [
    ...(Array.isArray(disabledDates)
      ? disabledDates
      : disabledDates === undefined
        ? []
        : [disabledDates]),
    ...(minDate ? [{ before: minDate }] : []),
    ...(maxDate ? [{ after: maxDate }] : []),
  ];

  React.useEffect(() => {
    setInputValue(formattedValue);
    setInputIsInvalid(false);
  }, [formattedValue]);

  const commitManualInput = () => {
    if (!inputValue.trim()) {
      setInputValue("");
      setInputIsInvalid(false);
      onValueChange("");
      return;
    }

    const date = parseDateInput(inputValue, { maxDate, minDate });
    if (!date) {
      setInputIsInvalid(true);
      return;
    }

    setInputValue(formatDateLabel(date));
    setInputIsInvalid(false);
    onValueChange(toDateValue(date));
  };

  const calendar = (
    <Calendar
      captionLayout={captionLayout}
      disabled={calendarDisabled.length > 0 ? calendarDisabled : undefined}
      endMonth={endMonth}
      mode="single"
      onSelect={(date) => {
        onValueChange(toDateValue(date));
        setInputValue(date ? formatDateLabel(date) : "");
        setInputIsInvalid(false);
        if (date) setOpen(false);
      }}
      selected={selectedDate}
      startMonth={startMonth}
    />
  );

  if (allowManualInput) {
    return (
      <div className={cn("w-full", className)}>
        <Popover open={open} onOpenChange={setOpen}>
          <div className="flex w-full">
            <Input
              aria-describedby={inputIsInvalid ? inputErrorId : undefined}
              aria-invalid={inputIsInvalid}
              aria-label={ariaLabel}
              className={cn(
                "rounded-r-none text-base sm:text-sm",
                inputIsInvalid &&
                  "border-red-500 focus:border-red-600 dark:border-red-500",
              )}
              disabled={disabled}
              id={id}
              inputMode="numeric"
              onBlur={commitManualInput}
              onChange={(event) => {
                const formattedInput = formatDateInput(event.target.value);
                const nextValue = constrainDateInput(
                  event.target.value,
                  inputValue,
                  { maxDate, minDate },
                );
                const inputWasBlocked = nextValue !== formattedInput;
                const completeDateIsInvalid =
                  nextValue.length === 10 &&
                  !parseDateInput(nextValue, { maxDate, minDate });

                setInputValue(nextValue);
                setInputIsInvalid(inputWasBlocked || completeDateIsInvalid);
              }}
              onKeyDown={(event) => {
                if (
                  event.key === "Backspace" &&
                  event.currentTarget.selectionStart ===
                    event.currentTarget.selectionEnd &&
                  event.currentTarget.selectionStart !== null &&
                  inputValue[event.currentTarget.selectionStart - 1] === "/"
                ) {
                  event.preventDefault();
                  const cursor = event.currentTarget.selectionStart;
                  const digitsBeforeSeparator = inputValue
                    .slice(0, cursor - 1)
                    .replace(/\D/g, "");
                  const digitsAfterSeparator = inputValue
                    .slice(cursor)
                    .replace(/\D/g, "");
                  setInputValue(
                    formatDateInput(
                      `${digitsBeforeSeparator.slice(0, -1)}${digitsAfterSeparator}`,
                    ),
                  );
                  return;
                }
                if (event.key === "Enter") {
                  event.preventDefault();
                  commitManualInput();
                }
                if (event.key === "Escape") {
                  setInputValue(formattedValue);
                  setInputIsInvalid(false);
                }
              }}
              placeholder={inputPlaceholder ?? placeholder}
              value={inputValue}
            />
            <PopoverTrigger asChild>
              <Button
                aria-label={calendarAriaLabel ?? ariaLabel}
                className="-ml-px shrink-0 rounded-l-none"
                disabled={disabled}
                size="icon"
                type="button"
                variant="secondary"
              >
                <CalendarDays aria-hidden="true" className="size-4" />
              </Button>
            </PopoverTrigger>
          </div>
          <PopoverContent align="start" className="p-2">
            {calendar}
          </PopoverContent>
        </Popover>
        {inputIsInvalid && invalidInputMessage ? (
          <p
            className="mt-1.5 text-xs text-red-600"
            id={inputErrorId}
            role="alert"
          >
            {invalidInputMessage}
          </p>
        ) : null}
      </div>
    );
  }

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
        {calendar}
      </PopoverContent>
    </Popover>
  );
}
