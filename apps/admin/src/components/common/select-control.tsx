"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui";

export type SelectControlOption = {
  disabled?: boolean;
  label: string;
  value: string;
};

export function resolveSelectControlLabel(
  options: SelectControlOption[],
  value: string,
) {
  return options.find((option) => option.value === value)?.label;
}

type SelectControlProps = {
  ariaLabel?: string;
  className?: string;
  contentClassName?: string;
  disabled?: boolean;
  id?: string;
  onValueChange: (value: string) => void;
  options: SelectControlOption[];
  placeholder?: string;
  triggerClassName?: string;
  value: string;
};

const EMPTY_SELECT_VALUE = "__select_empty__";

export function SelectControl({
  ariaLabel,
  className,
  contentClassName,
  disabled,
  id,
  onValueChange,
  options,
  placeholder,
  triggerClassName,
  value,
}: SelectControlProps) {
  const normalizedValue = value === "" ? EMPTY_SELECT_VALUE : value;

  return (
    <Select
      disabled={disabled}
      onValueChange={(nextValue) =>
        onValueChange(nextValue === EMPTY_SELECT_VALUE ? "" : nextValue)
      }
      value={normalizedValue}
    >
      <SelectTrigger
        aria-label={ariaLabel}
        className={triggerClassName ?? className}
        id={id}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={contentClassName}>
        {options.map((option) => (
          <SelectItem
            disabled={option.disabled}
            key={option.value || EMPTY_SELECT_VALUE}
            value={option.value || EMPTY_SELECT_VALUE}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
