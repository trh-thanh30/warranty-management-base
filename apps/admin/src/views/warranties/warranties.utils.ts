import {
  type WarrantyDealerSummary,
  type WarrantyListItem,
  type WarrantyUserSummary,
} from "@repo/shared";
import { addCalendarMonths } from "@repo/shared/utils";

export function formatWarrantyUser(
  user: WarrantyUserSummary | null | undefined,
  fallbackId: string | null | undefined,
) {
  if (!user) return fallbackId ?? "-";

  return `${user.name || user.email} (${user.email})`;
}

export function formatWarrantyOwner(warranty: WarrantyListItem) {
  if (!warranty.owner) return "-";

  return (
    warranty.owner.fullName ||
    warranty.owner.email ||
    warranty.owner.customerCode ||
    warranty.owner.customerId
  );
}

export function getWarrantyProductDisplayName(warranty: WarrantyListItem) {
  const secondary = [warranty.product.brand, warranty.product.model]
    .filter(Boolean)
    .join(" · ");

  return secondary
    ? `${warranty.product.name} · ${secondary}`
    : warranty.product.name;
}

export function formatWarrantyDateTimeInput(value: string | null | undefined) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function calculateWarrantyEndDate(
  startDateValue: string,
  durationMonths: number,
) {
  const startDate = new Date(startDateValue);
  if (
    Number.isNaN(startDate.getTime()) ||
    !Number.isInteger(durationMonths) ||
    durationMonths < 1
  ) {
    return null;
  }

  return addCalendarMonths(startDate, durationMonths);
}

export function formatWarrantyDealerAddress(
  dealer: Pick<
    WarrantyDealerSummary,
    "address" | "district" | "province"
  > | null,
) {
  if (!dealer) return "-";

  const parts: string[] = [];
  for (const value of [dealer.address, dealer.district, dealer.province]) {
    const part = value?.trim();
    if (!part) continue;

    const normalizedPart = part.toLocaleLowerCase("vi-VN");
    const existingAddress = parts.join(", ").toLocaleLowerCase("vi-VN");
    if (existingAddress.includes(normalizedPart)) continue;

    parts.push(part);
  }

  return parts.join(", ") || "-";
}

export function formatWarrantyMoneyLimit(
  value: string | null,
  locale: string,
  fallback: string,
) {
  if (value === null) return fallback;

  const [integerPart, rawFraction = ""] = value.split(".");
  const fraction = rawFraction.replace(/0+$/, "");
  const formatter = new Intl.NumberFormat(locale);
  const integer = formatter.format(BigInt(integerPart ?? "0"));
  const decimalSeparator =
    formatter.formatToParts(1.1).find((part) => part.type === "decimal")
      ?.value ?? ".";

  return `${integer}${fraction ? `${decimalSeparator}${fraction}` : ""} VND`;
}

export function isValidWarrantyAmount(value: string | null) {
  return value === null || /^\d+(\.\d{1,2})?$/.test(value);
}

export function isValidWarrantyDuration(value: number) {
  return Number.isInteger(value) && value >= 1;
}
