"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui";
import { usePermissions } from "@/src/hooks/use-permissions";
import { Link } from "@/src/i18n/navigation";
import { getDashboardQuickActions } from "../dashboard.constants";

export function DashboardQuickActions() {
  const t = useTranslations("Dashboard");
  const { hasPermission } = usePermissions();
  const actions = getDashboardQuickActions(t).filter((action) =>
    hasPermission(action.permission),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("quickActions.title")}</CardTitle>
        <CardDescription>{t("quickActions.description")}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2">
        {actions.map(({ description, href, icon: Icon, title }) => (
          <Button
            asChild
            className="h-auto min-h-14 justify-between whitespace-normal px-3 py-2 text-left"
            key={href}
            variant="secondary"
          >
            <Link href={href}>
              <span className="flex min-w-0 items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-900">
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block font-medium">{title}</span>
                  <span className="mt-0.5 block text-xs font-normal text-slate-500 dark:text-slate-400">
                    {description}
                  </span>
                </span>
              </span>
              <ArrowRight className="ml-3 size-4 shrink-0" />
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
