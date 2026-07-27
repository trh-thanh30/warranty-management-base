"use client";

import { Boxes, Layers3 } from "lucide-react";
import { useTranslations } from "next-intl";
import { PERMISSIONS, type PermissionKey } from "@repo/shared/constants";
import { cn } from "@repo/ui/lib/utils";
import { usePermissions } from "@/src/hooks/use-permissions";
import { Link } from "@/src/i18n/navigation";

type ProductManagementTab = "products" | "templates";

const PRODUCT_MANAGEMENT_TABS = [
  {
    href: "/products",
    icon: Boxes,
    labelKey: "tabs.products",
    permission: PERMISSIONS.PRODUCT_VIEW,
    value: "products",
  },
  {
    href: "/product-templates",
    icon: Layers3,
    labelKey: "tabs.templates",
    permission: PERMISSIONS.PRODUCT_TEMPLATE_VIEW,
    value: "templates",
  },
] as const satisfies ReadonlyArray<{
  href: string;
  icon: typeof Boxes;
  labelKey: string;
  permission: PermissionKey;
  value: ProductManagementTab;
}>;

export function ProductManagementTabs({
  activeTab,
}: {
  activeTab: ProductManagementTab;
}) {
  const t = useTranslations("Products");
  const { hasPermission } = usePermissions();
  const visibleTabs = PRODUCT_MANAGEMENT_TABS.filter((tab) =>
    hasPermission(tab.permission),
  );

  if (visibleTabs.length < 2) return null;

  return (
    <nav
      aria-label={t("tabs.label")}
      className="overflow-x-auto"
      role="tablist"
    >
      <div className="inline-flex min-w-full rounded-md border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900/50 sm:min-w-0">
        {visibleTabs.map((tab) => {
          const active = activeTab === tab.value;
          const Icon = tab.icon;

          return (
            <Link
              aria-current={active ? "page" : undefined}
              aria-selected={active}
              className={cn(
                "inline-flex h-10 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 sm:flex-none dark:focus-visible:ring-slate-50",
                active
                  ? "bg-slate-950 text-white shadow-sm hover:bg-slate-950 hover:text-white dark:bg-slate-950 dark:text-white dark:hover:bg-slate-950 dark:hover:text-white"
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
