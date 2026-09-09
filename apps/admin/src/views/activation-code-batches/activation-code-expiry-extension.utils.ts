import { MAX_ACTIVATION_CODE_EXTENSION_MONTHS } from "@repo/shared/constants";
import type { ActivationCodeReportStatus } from "@repo/shared";

export function addCalendarMonthsUtc(date: Date, months: number) {
  const result = new Date(date);
  const originalDay = result.getUTCDate();
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + months);
  const lastDay = new Date(
    Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0),
  ).getUTCDate();
  result.setUTCDate(Math.min(originalDay, lastDay));
  return result;
}

export function parseActivationCodeExtensionMonths(value: string) {
  if (!/^\d+$/.test(value)) return null;
  const months = Number(value);
  if (months < 1 || months > MAX_ACTIVATION_CODE_EXTENSION_MONTHS) return null;
  return months;
}

export function canExtendActivationCode(
  status: ActivationCodeReportStatus,
  expiresAt: string,
  now = Date.now(),
) {
  return (
    status !== "ACTIVATED" &&
    status !== "REVOKED" &&
    new Date(expiresAt).getTime() > now
  );
}
