"use client";

import { Download } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui";
import { StatsCard } from "@/src/components/common/stats-card";
import {
  getDashboardStats,
  getDashboardTabs,
} from "@/src/views/dashboard/dashboard.constants";
import { DashboardOverviewChart } from "@/src/views/dashboard/components/dashboard-overview-chart";
import { RecentSales } from "@/src/views/dashboard/components/recent-sales";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
} as const;

export function DashboardView() {
  const t = useTranslations("Dashboard");
  const dashboardStats = getDashboardStats(t);
  const dashboardTabs = getDashboardTabs(t);

  return (
    <motion.div
      className="space-y-4"
      initial="hidden"
      animate="show"
      variants={containerVariants}
    >
      <motion.div
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        variants={itemVariants}
      >
        <h1 className="text-3xl font-bold tracking-normal text-slate-950 dark:text-slate-50">
          {t("title")}
        </h1>
        <Button variant="secondary" className="cursor-pointer">
          <Download className="h-4 w-4" />
          {t("download")}
        </Button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Tabs defaultValue="overview">
          <TabsList>
            {dashboardTabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="cursor-pointer"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent className="space-y-4 pt-4" value="overview">
            <motion.section
              className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
              variants={containerVariants}
            >
              {dashboardStats.map((item) => (
                <motion.div key={item.title} variants={itemVariants}>
                  <StatsCard {...item} />
                </motion.div>
              ))}
            </motion.section>

            <motion.section
              className="grid gap-4 lg:grid-cols-7"
              variants={itemVariants}
            >
              <Card className="lg:col-span-4">
                <CardHeader>
                  <CardTitle>{t("overview")}</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <DashboardOverviewChart />
                </CardContent>
              </Card>
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>{t("recentSales")}</CardTitle>
                  <CardDescription>
                    {t("recentSalesDescription")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentSales />
                </CardContent>
              </Card>
            </motion.section>
          </TabsContent>
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>{t("analyticsTitle")}</CardTitle>
                <CardDescription>{t("analyticsDescription")}</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>{t("reportsTitle")}</CardTitle>
                <CardDescription>{t("reportsDescription")}</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>{t("notificationsTitle")}</CardTitle>
                <CardDescription>
                  {t("notificationsDescription")}
                </CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
