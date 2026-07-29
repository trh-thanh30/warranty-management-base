"use client";

import type { PublicWebsiteSiteSetting } from "@repo/shared";
import { createContext, useContext, type ReactNode } from "react";
import { getPrimaryWebsiteHotline } from "@/src/utils/site-settings.utils";

const SiteSettingsContext = createContext<PublicWebsiteSiteSetting | null>(
  null,
);

export function SiteSettingsProvider({
  children,
  siteSettings,
}: {
  children: ReactNode;
  siteSettings: PublicWebsiteSiteSetting | null;
}) {
  return (
    <SiteSettingsContext value={siteSettings}>{children}</SiteSettingsContext>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}

export function usePrimaryWebsiteHotline() {
  return getPrimaryWebsiteHotline(useSiteSettings());
}
