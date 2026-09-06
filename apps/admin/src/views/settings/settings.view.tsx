"use client";

import { useTranslations } from "next-intl";
import { PageHeader } from "@/src/components/common/page-header";
import { ActivationCodePolicySettings } from "./components/activation-code-policy-settings";
import { SettingsPermissionsSection } from "./components/settings-permissions-section";
import { SettingsProfileSection } from "./components/settings-profile-section";
import { SettingsSecuritySection } from "./components/settings-security-section";
import type { SettingsSection } from "./settings.types";

export function SettingsView({ section }: { section: SettingsSection }) {
  const t = useTranslations("Settings");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        description={t("description")}
        eyebrow={t("eyebrow")}
        title={t("title")}
      />
      <div className="space-y-6">
        {section === "profile" ? <SettingsProfileSection /> : null}
        {section === "security" ? <SettingsSecuritySection /> : null}
        {section === "permissions" ? <SettingsPermissionsSection /> : null}
        {section === "activation-code-policy" ? (
          <ActivationCodePolicySettings />
        ) : null}
      </div>
    </div>
  );
}
