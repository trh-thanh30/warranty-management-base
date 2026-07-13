import type { WarrantyListItem } from "@repo/shared";

export function formatWarrantyDate(value: string | null | undefined) {
  if (!value) return "-";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(value));
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
