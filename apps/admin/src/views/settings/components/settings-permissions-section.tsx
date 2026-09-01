"use client";

import { useState } from "react";
import { ChevronDown, Shield, UserRound } from "lucide-react";
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
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupKey: string) => {
    setOpenGroups((current) => ({
      ...current,
      [groupKey]: !current[groupKey],
    }));
  };

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
            <Badge className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-emerald-500"
              />
              {user?.role ? t(`permissions.roleLabel.${user.role}`) : ""}
            </Badge>
          </div>
        </div>
        <div className="space-y-6 border-t border-slate-100 pt-6 dark:border-slate-800">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {t("permissions.permissionsList")}
          </p>
          {user?.permissions && user.permissions.length > 0 ? (
            <div className="space-y-2">
              {groupPermissions(user.permissions).map((group) => (
                <div
                  className="rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
                  key={group.key}
                >
                  <button
                    aria-expanded={Boolean(openGroups[group.key])}
                    className="flex w-full items-center justify-between gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium text-slate-800 outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-950 dark:text-slate-100 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-300"
                    onClick={() => toggleGroup(group.key)}
                    type="button"
                  >
                    <span>{t(`permissions.categories.${group.key}`)}</span>
                    <ChevronDown
                      aria-hidden="true"
                      className={`size-4 shrink-0 text-slate-400 transition-transform duration-200 ${openGroups[group.key] ? "rotate-180" : ""}`}
                    />
                  </button>
                  <div
                    className={`grid transition-[grid-template-rows] duration-200 ease-out ${openGroups[group.key] ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <div className="border-t border-slate-100 px-4 py-3 dark:border-slate-800">
                        <div className="flex flex-wrap gap-1.5">
                          {group.permissions.map((permission) => (
                            <Badge
                              className="border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-normal text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
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
                    </div>
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
