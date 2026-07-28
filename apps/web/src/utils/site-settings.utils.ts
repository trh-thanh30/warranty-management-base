import type { PublicWebsiteSiteSetting } from "@repo/shared";
import { toTelephoneHref } from "./link.utils";

type WebsiteOfficesSource =
  | Pick<PublicWebsiteSiteSetting, "offices">
  | null
  | undefined;

export function getActiveWebsiteOffices(siteSettings: WebsiteOfficesSource) {
  return [...(siteSettings?.offices ?? [])]
    .filter((office) => office.isActive)
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

export function getPrimaryWebsiteHotline(siteSettings: WebsiteOfficesSource): {
  displayValue: string;
  href: string;
  officeId: string;
} | null {
  const activeOffices = getActiveWebsiteOffices(siteSettings);
  const office =
    activeOffices.find(
      (candidate) =>
        candidate.isHeadquarters && Boolean(candidate.phone?.trim()),
    ) ?? activeOffices.find((candidate) => candidate.phone?.trim());
  const phone = office?.phone?.trim();

  if (!office || !phone) return null;

  return {
    displayValue: phone,
    href: `tel:${toTelephoneHref(phone)}`,
    officeId: office.id,
  };
}
