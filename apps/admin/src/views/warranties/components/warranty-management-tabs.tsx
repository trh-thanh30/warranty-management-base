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
      className="overflow-x-auto"
      role="tablist"
    >
      <div className="inline-flex min-w-full rounded-md border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900/50 sm:min-w-0">
        {WARRANTY_MANAGEMENT_TABS.map((tab) => {
          const active = activeTab === tab.value;
          const Icon = tab.icon;

          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex h-10 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded px-4 text-sm font-medium transition-colors sm:flex-none",
                active
                  ? "bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-slate-50"
                  : "text-slate-600 hover:bg-white/70 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-950/70 dark:hover:text-slate-50",
              )}
              href={tab.href}
              key={tab.value}
              role="tab"
            >
              <Icon className="size-4" aria-hidden="true" />
              {t(tab.labelKey)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
