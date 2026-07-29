import { useTranslations } from "next-intl";
import { PERMISSIONS } from "@repo/shared/constants";
import { PageHeader } from "@/src/components/common/page-header";
import { PermissionGuard } from "@/src/components/permission-guard";
import { WebsiteNavigationUpdatingState } from "./components/website-navigation-updating-state";

export function WebsiteNavigationConfigView() {
  const t = useTranslations("WebsiteConfig");

  return (
    <PermissionGuard permissions={[PERMISSIONS.WEBSITE_CONFIG_VIEW]}>
      <div className="space-y-6">
        <PageHeader
          description={t("navigation.description")}
          eyebrow={t("eyebrow")}
          title={t("navigation.title")}
        />
        <WebsiteNavigationUpdatingState />
      </div>
    </PermissionGuard>
  );
}
