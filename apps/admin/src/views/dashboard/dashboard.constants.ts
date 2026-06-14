import { Activity, CreditCard, DollarSign, Users } from "lucide-react";

type Translate = (
  key: string,
  values?: Record<string, string | number>,
) => string;

export function getDashboardStats(t: Translate) {
  return [
    {
      title: t("stats.totalRevenue"),
      value: "$45,231.89",
      description: t("stats.fromLastMonth", { value: "20.1%" }),
      trend: t("stats.live"),
      icon: DollarSign,
    },
    {
      title: t("stats.subscriptions"),
      value: "+2350",
      description: t("stats.fromLastMonth", { value: "180.1%" }),
      trend: "+12%",
      icon: Users,
    },
    {
      title: t("stats.sales"),
      value: "+12,234",
      description: t("stats.fromLastMonth", { value: "19%" }),
      trend: "+19%",
      icon: CreditCard,
    },
    {
      title: t("stats.activeNow"),
      value: "+573",
      description: t("stats.sinceLastHour"),
      trend: t("stats.now"),
      icon: Activity,
    },
  ];
}

export function getDashboardTabs(t: Translate) {
  return [
    {
      label: t("tabs.overview"),
      value: "overview",
    },
    {
      label: t("tabs.analytics"),
      value: "analytics",
    },
    {
      label: t("tabs.reports"),
      value: "reports",
    },
    {
      label: t("tabs.notifications"),
      value: "notifications",
    },
  ] as const;
}
