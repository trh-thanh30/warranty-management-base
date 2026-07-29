"use client";

import { CheckCheck, RefreshCw } from "lucide-react";
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
import { AdminNotificationList } from "./admin-notification-list";
import { NotificationFilters } from "./notification-filters";
import { UserNotificationList } from "./user-notification-list";
import type { useNotificationsDirectory } from "../hooks/use-notifications-directory";

type NotificationsDirectoryCardProps = ReturnType<
  typeof useNotificationsDirectory
>;

export function NotificationsDirectoryCard({
  adminControls,
  adminQuery,
  canViewAdmin,
  clearAdminFilters,
  clearUserFilters,
  isMarkingAll,
  isMarkingRead,
  markAllRead,
  markRead,
  setTab,
  tab,
  userControls,
  userQuery,
}: NotificationsDirectoryCardProps) {
  const t = useTranslations("Notifications");
  const hasUserFilters = Boolean(
    userControls.search ||
    userControls.filters.type ||
    userControls.filters.status !== "ALL",
  );
  const hasAdminFilters = Boolean(
    adminControls.search ||
    adminControls.filters.type ||
    adminControls.filters.deliveryStatus !== "ALL",
  );

  return (
    <Tabs
      className="min-w-0"
      onValueChange={(value) => setTab(value as typeof tab)}
      value={tab}
    >
      <TabsList className="grid h-auto w-full grid-cols-1 gap-1 sm:inline-flex sm:h-10 sm:w-auto">
        <TabsTrigger
          className="h-9 min-w-0 whitespace-normal px-2 text-center leading-tight sm:h-8 sm:whitespace-nowrap sm:px-3"
          value="mine"
        >
          {t("myNotifications")}
        </TabsTrigger>
        {canViewAdmin ? (
          <TabsTrigger
            className="h-9 min-w-0 whitespace-normal px-2 text-center leading-tight sm:h-8 sm:whitespace-nowrap sm:px-3"
            value="admin"
          >
            {t("adminNotifications")}
          </TabsTrigger>
        ) : null}
      </TabsList>

      <TabsContent value="mine">
        <Card>
          <CardHeader className="gap-4 p-4 sm:p-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle>{t("myNotifications")}</CardTitle>
              <CardDescription className="mt-1.5">
                {t("myNotificationsDescription")}
              </CardDescription>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Button
                className="w-full sm:w-auto"
                disabled={userQuery.isFetching}
                onClick={() => void userQuery.refetch()}
                variant="secondary"
              >
                <RefreshCw
                  className={
                    userQuery.isFetching ? "size-4 animate-spin" : "size-4"
                  }
                />
                {t("refresh")}
              </Button>
              <Button
                className="w-full sm:w-auto"
                disabled={isMarkingAll}
                onClick={() => void markAllRead()}
                variant="secondary"
              >
                <CheckCheck className="size-4" />
                {t("markAllRead")}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 p-4 pt-0 sm:p-5 sm:pt-0">
            <NotificationFilters
              onClear={clearUserFilters}
              onSearchChange={userControls.setSearch}
              onStatusChange={userControls.filterHandlers.status}
              onTypeChange={userControls.filterHandlers.type}
              search={userControls.search}
              status={userControls.filters.status}
              type={userControls.filters.type}
            />
            <UserNotificationList
              data={userQuery.data}
              hasFilters={hasUserFilters}
              isError={userQuery.isError}
              isLoading={userQuery.isLoading}
              isMarkingRead={isMarkingRead}
              onClearFilters={clearUserFilters}
              onMarkRead={(id) => void markRead(id)}
              onPageChange={userControls.setPage}
              onPageSizeChange={userControls.setPageSize}
              onRetry={() => void userQuery.refetch()}
              pageSize={userControls.pageSize}
            />
          </CardContent>
        </Card>
      </TabsContent>

      {canViewAdmin ? (
        <TabsContent value="admin">
          <Card>
            <CardHeader className="gap-4 p-4 sm:p-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <CardTitle>{t("adminNotifications")}</CardTitle>
                <CardDescription className="mt-1.5">
                  {t("adminNotificationsDescription")}
                </CardDescription>
              </div>
              <Button
                className="w-full sm:w-auto"
                disabled={adminQuery.isFetching}
                onClick={() => void adminQuery.refetch()}
                variant="secondary"
              >
                <RefreshCw
                  className={
                    adminQuery.isFetching ? "size-4 animate-spin" : "size-4"
                  }
                />
                {t("refresh")}
              </Button>
            </CardHeader>
            <CardContent className="space-y-5 p-4 pt-0 sm:p-5 sm:pt-0">
              <NotificationFilters
                deliveryStatus={adminControls.filters.deliveryStatus}
                onClear={clearAdminFilters}
                onDeliveryStatusChange={
                  adminControls.filterHandlers.deliveryStatus
                }
                onSearchChange={adminControls.setSearch}
                onTypeChange={adminControls.filterHandlers.type}
                search={adminControls.search}
                type={adminControls.filters.type}
              />
              <AdminNotificationList
                data={adminQuery.data}
                hasFilters={hasAdminFilters}
                isError={adminQuery.isError}
                isLoading={adminQuery.isLoading}
                onClearFilters={clearAdminFilters}
                onPageChange={adminControls.setPage}
                onPageSizeChange={adminControls.setPageSize}
                onRetry={() => void adminQuery.refetch()}
                pageSize={adminControls.pageSize}
              />
            </CardContent>
          </Card>
        </TabsContent>
      ) : null}
    </Tabs>
  );
}
