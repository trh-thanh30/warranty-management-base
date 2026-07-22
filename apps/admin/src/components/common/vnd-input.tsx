"use client";

import type { ComponentProps } from "react";
import { Input } from "@repo/ui";
import {
  formatVndInputValue,
  normalizeVndInputValue,
} from "@/src/utils/currency";

type VndInputProps = Omit<
  ComponentProps<typeof Input>,
  "inputMode" | "onChange" | "type" | "value"
> & {
  onValueChange: (value: string) => void;
  value: string;
};

export function VndInput({ onValueChange, value, ...props }: VndInputProps) {
  return (
    <Input
      {...props}
      inputMode="decimal"
      onChange={(event) => {
        const normalizedValue = normalizeVndInputValue(event.target.value);
        if (normalizedValue !== null) onValueChange(normalizedValue);
      }}
      type="text"
      value={formatVndInputValue(value)}
    />
  );
}
