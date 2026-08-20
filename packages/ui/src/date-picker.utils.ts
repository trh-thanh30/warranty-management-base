import { format, isValid, parse, parseISO, startOfDay } from "date-fns";

type DateInputRange = {
  maxDate?: Date;
  minDate?: Date;
};

export function parseDateValue(value?: string) {
  if (!value) return undefined;
  const date = parseISO(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function toDateValue(date?: Date) {
  return date ? format(date, "yyyy-MM-dd") : "";
}

export function formatDateLabel(date: Date) {
  return format(date, "dd/MM/yyyy");
}

export function formatDateInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length < 2) return digits;

  const day = digits.slice(0, 2);
  if (digits.length === 2) return `${day}/`;

  const month = digits.slice(2, 4);
  if (digits.length < 4) return `${day}/${month}`;
  if (digits.length === 4) return `${day}/${month}/`;

  return `${day}/${month}/${digits.slice(4)}`;
}

export function constrainDateInput(
  value: string,
  previousValue: string,
  { maxDate, minDate }: DateInputRange = {},
) {
  const nextValue = formatDateInput(value);
  const digits = nextValue.replace(/\D/g, "");
  const day = Number(digits.slice(0, 2));
  const month = Number(digits.slice(2, 4));

  if (digits.length >= 2 && (day < 1 || day > 31)) return previousValue;
  if (digits.length >= 4 && (month < 1 || month > 12)) return previousValue;

  if (digits.length === 8) {
    const year = Number(digits.slice(4));
    if (minDate && year < minDate.getFullYear()) return previousValue;
    if (maxDate && year > maxDate.getFullYear()) return previousValue;
  }

  return nextValue;
}

export function parseDateInput(
  value: string,
  { maxDate, minDate }: DateInputRange = {},
) {
  const normalizedValue = value.trim();
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(normalizedValue)) return undefined;

  const date = parse(normalizedValue, "dd/MM/yyyy", new Date(0));
  if (!isValid(date) || formatDateLabel(date) !== normalizedValue) {
    return undefined;
  }
  if (minDate && date < startOfDay(minDate)) return undefined;
  if (maxDate && date > startOfDay(maxDate)) return undefined;

  return date;
}
