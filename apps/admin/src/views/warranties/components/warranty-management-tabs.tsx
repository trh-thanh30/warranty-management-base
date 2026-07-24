"use client";

import { FileCheck2, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@repo/ui/lib/utils";
import { Link } from "@/src/i18n/navigation";

type WarrantyManagementTab = "activationRequests" | "warranties";

type WarrantyManagementTabsProps = {
  activeTab: WarrantyManagementTab;
};

const WARRANTY_MANAGEMENT_TABS = [
  {
    href: "/warranties",
    icon: ShieldCheck,
    labelKey: "tabs.warranties",
    value: "warranties",
  },
  {
    href: "/warranty-activation-requests",
    icon: FileCheck2,
    labelKey: "tabs.activationRequests",
    value: "activationRequests",
  },
] as const;

export function WarrantyManagementTabs({
  activeTab,
}: WarrantyManagementTabsProps) {
  const t = useTranslations("Warranties");

  return (
    <nav
      aria-label={t("tabs.label")}
      className="min-w-0 w-full sm:w-auto"
      role="tablist"
    >
      <div className="flex w-full flex-col gap-1 rounded-md border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900/50 sm:w-auto sm:inline-flex sm:flex-row">
        {WARRANTY_MANAGEMENT_TABS.map((tab) => {
          const active = activeTab === tab.value;
          const Icon = tab.icon;

          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex h-10 w-full items-center justify-center gap-2 whitespace-nowrap rounded px-4 text-sm font-medium transition-colors sm:w-auto sm:flex-none",
                active
                  ? "bg-slate-950 text-white shadow-sm hover:bg-slate-950 hover:text-white dark:bg-slate-950 dark:text-white dark:hover:bg-slate-950 dark:hover:text-white"
                  : "text-slate-600 hover:bg-white/70 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-950/70 dark:hover:text-slate-50",
              )}
              href={tab.href}
              key={tab.value}
              role="tab"
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              <span>{t(tab.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
