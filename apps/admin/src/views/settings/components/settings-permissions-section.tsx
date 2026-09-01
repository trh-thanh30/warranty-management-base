"use client";

import { Shield, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui";
import { useSettingsForm } from "../hooks/use-settings-form";
import { groupPermissions } from "../settings.utils";

export function SettingsPermissionsSection() {
  const t = useTranslations("Settings");
  const { user } = useSettingsForm();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          {t("permissions.title")}
        </CardTitle>
        <CardDescription>{t("permissions.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {t("permissions.role")}
          </p>
          <div className="mt-2">
            <Badge className="bg-slate-900 px-3 py-1 text-sm font-semibold capitalize text-slate-50 hover:bg-slate-900 dark:bg-slate-50 dark:text-slate-950 dark:hover:bg-slate-50">
              {user?.role ? t(`permissions.roleLabel.${user.role}`) : ""}
            </Badge>
          </div>
        </div>
        <div className="space-y-6 border-t border-slate-100 pt-6 dark:border-slate-800">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {t("permissions.permissionsList")}
          </p>
          {user?.permissions && user.permissions.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {groupPermissions(user.permissions).map((group) => (
                <div
                  className="space-y-3 rounded-lg border border-slate-100 bg-slate-50/30 p-4 dark:border-slate-800 dark:bg-slate-900/5"
                  key={group.key}
                >
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {t(`permissions.categories.${group.key}`)}
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {group.permissions.map((permission) => (
                      <Badge
                        className="border-slate-200 bg-white px-2.5 py-1 text-xs font-normal text-slate-800 shadow-sm hover:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                        key={permission}
                        variant="secondary"
                      >
                        <UserRound
                          aria-hidden="true"
                          className="mr-1 h-3 w-3 opacity-60"
                        />
                        {t.has(`permissions.labels.${permission}`)
                          ? t(`permissions.labels.${permission}`)
                          : permission}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t("permissions.noPermissions")}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
