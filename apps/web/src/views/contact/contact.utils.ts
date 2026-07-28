import type { PublicWebsiteSiteSetting } from "@repo/shared";

export type ContactOfficeItem = {
  address: string;
  id: string;
  label: string;
  phone: string | null;
  sortOrder: number;
};

export function getPublishedContactOffices(
  siteSettings?: PublicWebsiteSiteSetting | null,
): ContactOfficeItem[] {
  return [...(siteSettings?.offices ?? [])]
    .filter((office) => office.isActive && office.label.trim())
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((office) => ({
      address: office.address.trim(),
      id: office.id,
      label: office.label.trim(),
      phone: office.phone?.trim() || null,
      sortOrder: office.sortOrder,
    }));
}

export function stripTrailingColon(value: string) {
  return value.trim().replace(/[:：]\s*$/, "");
}
