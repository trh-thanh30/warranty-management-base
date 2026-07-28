"use client";

import { Input } from "@repo/ui";
import { useTranslations } from "next-intl";
import { FormField } from "@/src/components/common/form-field";
import { FormSection } from "@/src/components/common/form-section";
import type { SiteDraft, SiteDraftUpdater } from "../website-site-config.types";

export function ContactEditor({
  disabled,
  form,
  onChange,
}: {
  disabled: boolean;
  form: SiteDraft;
  onChange: SiteDraftUpdater;
}) {
  const t = useTranslations("WebsiteConfig");

  return (
    <FormSection
      description={t("site.contactDetailsDescription")}
      title={t("site.contactDetails")}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <FormField
          htmlFor="website-contact-email"
          label={t("site.contactEmail")}
        >
          <Input
            disabled={disabled}
            id="website-contact-email"
            onChange={(event) =>
              onChange((current) => ({
                ...current,
                contactEmail: event.target.value,
              }))
            }
            placeholder="fujitek.lexzenz.vn@gmail.com"
            type="email"
            value={form.contactEmail}
          />
        </FormField>
        <FormField htmlFor="website-url" label={t("site.websiteUrl")}>
          <Input
            disabled={disabled}
            id="website-url"
            onChange={(event) =>
              onChange((current) => ({
                ...current,
                websiteUrl: event.target.value,
              }))
            }
            placeholder="https://fujitekvietnam.com"
            type="url"
            value={form.websiteUrl}
          />
        </FormField>
      </div>
    </FormSection>
  );
}
