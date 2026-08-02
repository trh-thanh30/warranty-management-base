"use client";

import {
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
} from "react";
import { cn } from "./lib/utils";

export type PinInputProps = Omit<
  ComponentPropsWithoutRef<"input">,
  "defaultValue" | "maxLength" | "onChange" | "value"
> & {
  length?: number;
  value?: string;
  onChange?: (value: string) => void;
  slotClassName?: string;
};

export function PinInput({
  autoFocus,
  className,
  disabled,
  length = 6,
  onChange,
  onPaste,
  slotClassName,
  value = "",
  ...inputProps
}: PinInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const digits = Array.from({ length }, (_, index) => value[index] ?? "");

  useEffect(() => {
    if (autoFocus) inputsRef.current[0]?.focus();
  }, [autoFocus]);

  function update(nextDigits: string[], focusIndex?: number) {
    onChange?.(nextDigits.join(""));
    if (focusIndex === undefined || disabled) return;
    inputsRef.current[Math.min(focusIndex, length - 1)]?.focus();
  }

  function handleChange(index: number, nextValue: string) {
    const digit = nextValue.replace(/\D/g, "").slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = digit;
    update(nextDigits, digit ? index + 1 : index);
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    onPaste?.(event);
    if (event.defaultPrevented) return;
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;
    event.preventDefault();
    const nextDigits = Array.from(
      { length },
      (_, index) => pasted[index] ?? "",
    );
    update(nextDigits, Math.min(pasted.length, length - 1));
  }

  function handleKeyDown(
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      event.preventDefault();
      const nextDigits = [...digits];
      nextDigits[index - 1] = "";
      update(nextDigits, index - 1);
    } else if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      inputsRef.current[index - 1]?.focus();
    } else if (event.key === "ArrowRight" && index < length - 1) {
      event.preventDefault();
      inputsRef.current[index + 1]?.focus();
    }
  }

  return (
    <div
      aria-label={inputProps["aria-label"]}
      className={cn("grid w-full gap-2 sm:gap-3", className)}
      role="group"
      style={{ gridTemplateColumns: `repeat(${length}, minmax(0, 1fr))` }}
    >
      {digits.map((digit, index) => (
        <input
          {...inputProps}
          aria-label={`${inputProps["aria-label"] ?? "Verification code"} ${index + 1}`}
          autoComplete={index === 0 ? inputProps.autoComplete : "off"}
          autoFocus={autoFocus && index === 0}
          className={cn(
            "h-14 w-full rounded-lg border border-transparent bg-slate-50 p-0 text-center text-2xl font-semibold tabular-nums text-slate-950 outline-none transition-[border-color,box-shadow,background-color] focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/15 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-900 dark:text-white dark:focus:border-blue-400 dark:focus:bg-slate-950 dark:focus:ring-blue-400/15",
            slotClassName,
          )}
          disabled={disabled}
          inputMode="numeric"
          key={index}
          maxLength={1}
          onChange={(event) => handleChange(index, event.target.value)}
          onFocus={(event) => {
            setActiveIndex(index);
            event.currentTarget.select();
          }}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          ref={(element) => {
            inputsRef.current[index] = element;
          }}
          value={digit}
        />
      ))}
      <span className="sr-only" aria-live="polite">
        {activeIndex + 1} of {length}
      </span>
    </div>
  );
}
