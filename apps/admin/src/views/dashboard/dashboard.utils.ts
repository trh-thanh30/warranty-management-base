import type {
  AnalyticsTrendInterval,
  AnalyticsTrendMetric,
} from "@repo/shared";
import type { DateRangeValue } from "@repo/ui/date-range-picker";

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getDefaultDashboardRange(
  currentDate = new Date(),
): DateRangeValue {
  const to = new Date(currentDate);
  const from = new Date(to.getFullYear(), to.getMonth(), 1);

  return {
    from: toDateInputValue(from),
    to: toDateInputValue(to),
  };
}

export function getDashboardTrendInterval(
  range: DateRangeValue,
): AnalyticsTrendInterval {
  if (!range.from || !range.to) return "day";

  const dayMs = 24 * 60 * 60 * 1000;
  const spanDays =
    Math.abs(new Date(range.to).getTime() - new Date(range.from).getTime()) /
    dayMs;

  if (spanDays > 180) return "month";
  if (spanDays > 45) return "week";

  return "day";
}

export function formatTrendDate(
  value: string,
  interval: AnalyticsTrendInterval,
  locale: string,
) {
  const options: Intl.DateTimeFormatOptions =
    interval === "month"
      ? { month: "short", year: "numeric" }
      : { day: "2-digit", month: "short" };

  return new Intl.DateTimeFormat(locale, options).format(new Date(value));
}

export function formatDashboardNumber(value: number, locale: string) {
  return new Intl.NumberFormat(locale).format(value);
}

export function toDashboardDateBoundary(
  value: string | undefined,
  boundary: "start" | "end",
) {
  if (!value) return undefined;

  const time = boundary === "start" ? "00:00:00.000" : "23:59:59.999";
  const date = new Date(`${value}T${time}`);

  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export const DASHBOARD_TREND_METRIC = "claims" satisfies AnalyticsTrendMetric;
