"use client";

import type { WebsiteLocale } from "@repo/shared";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui";

type LocaleTabsProps = {
  locale: WebsiteLocale;
  onChange: (locale: WebsiteLocale) => void;
};

export function LocaleTabs({ locale, onChange }: LocaleTabsProps) {
  return (
    <Tabs
      onValueChange={(value) => onChange(value as WebsiteLocale)}
      value={locale}
    >
      <TabsList
        aria-label="Content locale"
        className="grid w-full grid-cols-2 sm:w-64"
      >
        <TabsTrigger className="min-h-11 sm:min-h-9" value="vi">
          Tiếng Việt
        </TabsTrigger>
        <TabsTrigger className="min-h-11 sm:min-h-9" value="en">
          English
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
