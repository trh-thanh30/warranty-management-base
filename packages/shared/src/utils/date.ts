export type DateInput = Date | number | string;

export type FormatDateOptions = {
  dateStyle?: Intl.DateTimeFormatOptions["dateStyle"];
  fallback?: string;
  locale?: Intl.LocalesArgument;
  showTime?: boolean;
  timeZone?: string;
};

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function addCalendarMonths(date: Date, months: number) {
  const result = new Date(date);
  const originalDay = result.getDate();

  result.setDate(1);
  result.setMonth(result.getMonth() + months);

  const lastDayOfTargetMonth = new Date(
    result.getFullYear(),
    result.getMonth() + 1,
    0,
  ).getDate();
  result.setDate(Math.min(originalDay, lastDayOfTargetMonth));

  return result;
}

export function formatDate(
  value: DateInput | null | undefined,
  options: FormatDateOptions = {},
) {
  const {
    dateStyle = "medium",
    fallback = "-",
    locale,
    showTime = true,
    timeZone,
  } = options;
  const date = toDate(value);

  if (!date) return fallback;

  const dateText = new Intl.DateTimeFormat(locale, {
    dateStyle,
    ...(timeZone ? { timeZone } : {}),
  }).format(date);

  if (!showTime) return dateText;

  const timeText = new Intl.DateTimeFormat(locale, {
    timeStyle: "short",
    ...(timeZone ? { timeZone } : {}),
  }).format(date);

  return `${dateText} · ${timeText}`;
}

function toDate(value: DateInput | null | undefined) {
  if (value === null || value === undefined || value === "") return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "string") {
    const dateOnlyParts = DATE_ONLY_PATTERN.exec(value);

    if (dateOnlyParts) {
      const [, year, month, day] = dateOnlyParts;
      const date = new Date(Number(year), Number(month) - 1, Number(day));

      if (
        date.getFullYear() !== Number(year) ||
        date.getMonth() !== Number(month) - 1 ||
        date.getDate() !== Number(day)
      ) {
        return null;
      }

      return date;
    }
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
