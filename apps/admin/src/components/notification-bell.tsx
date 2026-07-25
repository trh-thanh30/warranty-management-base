"use client";

import { Bell, CheckCheck, Inbox, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Badge,
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Skeleton,
} from "@repo/ui";
import { useAuth } from "@/src/app/providers/auth-provider";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useUnreadNotificationCount,
  useUserNotifications,
} from "@/src/hooks/use-notifications";
import { useToast } from "@/src/hooks/use-toast";
import { Link } from "@/src/i18n/navigation";
import {
  formatNotificationDate,
  formatNotificationType,
} from "@/src/views/notifications/notifications.utils";

export function NotificationBell() {
  const t = useTranslations("Notifications");
  const locale = useLocale();
  const toast = useToast();
  const { user } = useAuth();
  const enabled = Boolean(user);
  const unreadQuery = useUnreadNotificationCount({ enabled });
  const recentQuery = useUserNotifications({ page: 1, limit: 5 }, { enabled });
  const markReadMutation = useMarkNotificationRead();
  const markAllMutation = useMarkAllNotificationsRead();
  const unread = unreadQuery.data?.unread ?? 0;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isNotificationFetching =
    isRefreshing || unreadQuery.isFetching || recentQuery.isFetching;

  async function refreshNotifications() {
    if (!enabled) return;

    setIsRefreshing(true);
    try {
      await Promise.all([unreadQuery.refetch(), recentQuery.refetch()]);
    } catch {
      toast.error(t("loadError"));
    } finally {
      setIsRefreshing(false);
    }
  }

  async function markRead(notificationId: string) {
    try {
      await markReadMutation.mutateAsync(notificationId);
    } catch {
      toast.error(t("markReadError"));
    }
  }

  async function markAllRead() {
    try {
      await markAllMutation.mutateAsync();
      toast.success(t("allMarkedRead"));
    } catch {
      toast.error(t("markAllReadError"));
    }
  }

  return (
    <Popover
      onOpenChange={(open) => {
        if (open) {
          void refreshNotifications();
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          aria-label={t("openNotifications", { count: unread })}
          className="relative"
          size="icon"
          variant="ghost"
        >
          <Bell className="size-4" />
          {unread > 0 ? (
            <span className="absolute right-0.5 top-0.5 flex min-w-4 items-center justify-center rounded-full bg-red-400 px-1 text-[10px] font-semibold leading-4 text-white">
              {unread > 99 ? "99+" : unread}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[calc(100vw-1rem)] max-w-96 p-0 sm:w-96"
        collisionPadding={8}
      >
        <div className="flex flex-col items-stretch gap-2 border-b border-slate-200 px-3 py-3 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-4">
          <div className="min-w-0">
            <h2 className="truncate font-semibold">{t("recentTitle")}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t("unreadSummary", { count: unread })}
            </p>
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Button
              aria-label={t("refresh")}
              className="shrink-0"
              disabled={isNotificationFetching}
              onClick={() => void refreshNotifications()}
              size="icon"
              variant="ghost"
            >
              <RefreshCw
                aria-hidden="true"
                className={
                  isNotificationFetching ? "size-4 animate-spin" : "size-4"
                }
              />
            </Button>
            {unread > 0 ? (
              <Button
                className="w-full justify-center sm:w-auto sm:shrink-0"
                disabled={markAllMutation.isPending}
                onClick={() => void markAllRead()}
                size="sm"
                variant="ghost"
              >
                <CheckCheck className="size-4" />
                {t("markAllRead")}
              </Button>
            ) : null}
          </div>
        </div>

        <div className="max-h-[min(24rem,calc(100dvh-12rem))] overflow-y-auto overscroll-contain">
          {recentQuery.isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 3 }, (_, index) => (
                <Skeleton className="h-16 w-full" key={index} />
              ))}
            </div>
          ) : recentQuery.isError ? (
            <div className="p-5 text-center text-sm text-slate-500">
              {t("loadError")}
            </div>
          ) : recentQuery.data?.items.length ? (
            recentQuery.data.items.map((item) => (
              <button
                className="flex w-full min-w-0 gap-2 border-b border-slate-100 px-3 py-3 text-left transition-colors last:border-0 hover:bg-slate-50 dark:border-slate-900 dark:hover:bg-slate-900/60 sm:gap-3 sm:px-4"
                disabled={markReadMutation.isPending}
                key={item.id}
                onClick={() => {
                  if (item.status === "UNREAD") {
                    void markRead(item.notification.id);
                  }
                }}
                type="button"
              >
                <span
                  className={
                    item.status === "UNREAD"
                      ? "mt-2 size-2 shrink-0 rounded-full bg-blue-600"
                      : "mt-2 size-2 shrink-0 rounded-full bg-slate-300 dark:bg-slate-700"
                  }
                />
                <span className="min-w-0 flex-1">
                  <span className="flex min-w-0 flex-col items-start gap-1 sm:flex-row sm:justify-between sm:gap-2">
                    <span className="line-clamp-2 min-w-0 text-sm font-medium sm:truncate">
                      {item.notification.title}
                    </span>
                    <Badge
                      className="max-w-full shrink-0 truncate"
                      variant="secondary"
                    >
                      {formatNotificationType(item.notification.type)}
                    </Badge>
                  </span>
                  <span className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    {item.notification.content}
                  </span>
                  <span className="mt-1 block text-xs text-slate-400">
                    {formatNotificationDate(item.deliveredAt, locale)}
                  </span>
                </span>
              </button>
            ))
          ) : (
            <div className="flex flex-col items-center px-5 py-8 text-center">
              <Inbox className="size-6 text-slate-400" />
              <p className="mt-2 text-sm font-medium">{t("emptyTitle")}</p>
              <p className="mt-1 text-xs text-slate-500">
                {t("emptyDescription")}
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 p-2 dark:border-slate-800">
          <Button asChild className="w-full" size="sm" variant="ghost">
            <Link href="/notifications">{t("viewAll")}</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
