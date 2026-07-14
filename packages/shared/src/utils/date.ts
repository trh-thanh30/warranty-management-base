export type DateInput = Date | number | string;

export type FormatDateOptions = {
  fallback?: string;
  locale?: Intl.LocalesArgument;
  showTime?: boolean;
  timeZone?: string;
};

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function formatDate(
  value: DateInput | null | undefined,
  options: FormatDateOptions = {},
) {
  const { fallback = "-", locale, showTime = false, timeZone } = options;
  const date = toDate(value);

  if (!date) return fallback;

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    ...(showTime ? { timeStyle: "short" as const } : {}),
    ...(timeZone ? { timeZone } : {}),
  }).format(date);
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
