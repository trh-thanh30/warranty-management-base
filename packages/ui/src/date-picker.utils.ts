import { format, parseISO } from "date-fns";

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
