"use client";

import { useTranslations } from "next-intl";
import { PageHeader } from "@/src/components/common/page-header";
import { NotificationsDirectoryCard } from "./components/notifications-directory-card";
import { useNotificationsDirectory } from "./hooks/use-notifications-directory";

export function NotificationsView() {
  const t = useTranslations("Notifications");
  const directory = useNotificationsDirectory();

  return (
    <div className="space-y-6">
      <PageHeader
        description={t("description")}
        eyebrow={t("eyebrow")}
        title={t("title")}
      />
      <NotificationsDirectoryCard {...directory} />
    </div>
  );
}
