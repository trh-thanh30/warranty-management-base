"use client";

import { FormSection } from "@/src/components/common/form-section";
import { ImageUpload } from "@/src/components/common/image-upload";
import { useTranslations } from "next-intl";

type AssetFieldProps = {
  disabled: boolean;
  id: string;
  label: string;
  onChange: (assetId: string | null, url: string) => void;
  persistedUrl: string;
  url: string;
};

export function IdentityEditor({
  disabled,
  footerLogo,
  headerLogo,
  ogImage,
}: {
  disabled: boolean;
  footerLogo: Omit<AssetFieldProps, "disabled" | "id" | "label">;
  headerLogo: Omit<AssetFieldProps, "disabled" | "id" | "label">;
  ogImage: Omit<AssetFieldProps, "disabled" | "id" | "label">;
}) {
  const t = useTranslations("WebsiteConfig");

  return (
    <FormSection
      description={t("site.mediaDescription")}
      title={t("site.media")}
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <AssetField
          {...headerLogo}
          disabled={disabled}
          id="website-header-logo"
          label={t("site.headerLogo")}
        />
        <AssetField
          {...footerLogo}
          disabled={disabled}
          id="website-footer-logo"
          label={t("site.footerLogo")}
        />
        <AssetField
          {...ogImage}
          disabled={disabled}
          id="website-og-image"
          label={t("site.ogImage")}
        />
      </div>
    </FormSection>
  );
}

function AssetField({
  disabled,
  id,
  label,
  onChange,
  persistedUrl,
  url,
}: AssetFieldProps) {
  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/30">
      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
        {label}
      </p>
      <ImageUpload
        compact
        disabled={disabled}
        id={id}
        onAssetChange={(asset) => onChange(asset?.id ?? null, asset?.url ?? "")}
        onChange={(value) => {
          if (!value) onChange(null, "");
        }}
        persistedValue={persistedUrl}
        uploadOptions={{ accessType: "PUBLIC", folder: "website-config" }}
        value={url}
      />
    </div>
  );
}
