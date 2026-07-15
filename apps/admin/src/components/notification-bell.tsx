"use client";

import { Bell, CheckCheck, Inbox } from "lucide-react";
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
    <Popover>
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
        className="w-[min(24rem,calc(100vw-2rem))] p-0"
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <div>
            <h2 className="font-semibold">{t("recentTitle")}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t("unreadSummary", { count: unread })}
            </p>
          </div>
          {unread > 0 ? (
            <Button
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

        <div className="max-h-[24rem] overflow-y-auto">
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
                className="flex w-full gap-3 border-b border-slate-100 px-4 py-3 text-left transition-colors last:border-0 hover:bg-slate-50 dark:border-slate-900 dark:hover:bg-slate-900/60"
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
                  <span className="flex items-start justify-between gap-2">
                    <span className="truncate text-sm font-medium">
                      {item.notification.title}
                    </span>
                    <Badge
                      className="shrink-0 whitespace-nowrap"
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
