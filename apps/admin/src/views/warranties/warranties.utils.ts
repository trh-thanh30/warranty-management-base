import { type WarrantyListItem, type WarrantyUserSummary } from "@repo/shared";

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
