"use client";

import type { DateRangeValue } from "@repo/ui/date-range-picker";
import { Button } from "@repo/ui";
import { DateRangePicker } from "@repo/ui/date-range-picker";
import {
  DASHBOARD_QUICK_RANGE_OPTIONS,
  type DashboardQuickRangeDays,
} from "../dashboard.constants";

type DashboardDateRangeFilterProps = {
  activeQuickRange: DashboardQuickRangeDays | null;
  ariaLabel: string;
  className?: string;
  clearLabel: string;
  disabledDates?: { after?: Date; before?: Date };
  onQuickRangeChange: (days: DashboardQuickRangeDays) => void;
  onRangeChange: (range: DateRangeValue) => void;
  placeholder: string;
  quickFilterAriaLabel: string;
  range: DateRangeValue;
  translateQuickRange: (key: string) => string;
};

export function DashboardDateRangeFilter({
  activeQuickRange,
  ariaLabel,
  className,
  clearLabel,
  disabledDates,
  onQuickRangeChange,
  onRangeChange,
  placeholder,
  quickFilterAriaLabel,
  range,
  translateQuickRange,
}: DashboardDateRangeFilterProps) {
  return (
    <div className={className}>
      <div
        aria-label={quickFilterAriaLabel}
        className="inline-flex w-full gap-2 sm:w-auto"
        role="group"
      >
        {DASHBOARD_QUICK_RANGE_OPTIONS.map((option) => {
          const active = activeQuickRange === option.days;

          return (
            <Button
              aria-pressed={active}
              className="flex-1 sm:flex-none"
              key={option.days}
              onClick={() => onQuickRangeChange(option.days)}
              size="sm"
              type="button"
              variant={active ? "primary" : "outline"}
            >
              {translateQuickRange(option.labelKey)}
            </Button>
          );
        })}
      </div>
      <DateRangePicker
        ariaLabel={ariaLabel}
        className="w-full sm:w-72"
        clearLabel={clearLabel}
        disabledDates={disabledDates}
        onValueChange={onRangeChange}
        placeholder={placeholder}
        value={range}
      />
    </div>
  );
}
