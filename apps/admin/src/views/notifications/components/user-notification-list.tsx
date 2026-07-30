"use client";

import { Bell, Check, Inbox } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { PaginatedResponse, UserNotificationSummary } from "@repo/shared";
import { Badge, Button, Skeleton } from "@repo/ui";
import { PaginationControls } from "@repo/ui/pagination-controls";
import { StatePanel } from "@/src/components/common/state-panel";
import {
  formatNotificationDate,
  formatNotificationType,
} from "../notifications.utils";

type UserNotificationListProps = {
  data?: PaginatedResponse<UserNotificationSummary>;
  hasFilters: boolean;
  isError: boolean;
  isLoading: boolean;
  isMarkingRead: boolean;
  onClearFilters: () => void;
  onMarkRead: (notificationId: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onRetry: () => void;
  pageSize: number;
};

export function UserNotificationList({
  data,
  hasFilters,
  isError,
  isLoading,
  isMarkingRead,
  onClearFilters,
  onMarkRead,
  onPageChange,
  onPageSizeChange,
  onRetry,
  pageSize,
}: UserNotificationListProps) {
  const t = useTranslations("Notifications");
  const locale = useLocale();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton className="h-24 w-full" key={index} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <StatePanel
        action={<Button onClick={onRetry}>{t("tryAgain")}</Button>}
        description={t("loadErrorDescription")}
        icon={Bell}
        title={t("loadErrorTitle")}
      />
    );
  }

  if (!data?.items.length) {
    return (
      <StatePanel
        action={
          hasFilters ? (
            <Button onClick={onClearFilters} variant="secondary">
              {t("clearFilters")}
            </Button>
          ) : undefined
        }
        description={
          hasFilters ? t("emptyFilteredDescription") : t("emptyDescription")
        }
        icon={Inbox}
        title={hasFilters ? t("emptyFilteredTitle") : t("emptyTitle")}
      />
    );
  }

  return (
    <>
      <div className="divide-y divide-slate-200 rounded-md border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
        {data.items.map((item) => (
          <article
            className={
              item.status === "UNREAD"
                ? "bg-blue-50/50 p-3 dark:bg-blue-950/20 sm:p-5"
                : "p-3 sm:p-5"
            }
            key={item.id}
          >
            <div className="flex min-w-0 items-start gap-2 sm:gap-3">
              <span
                className={
                  item.status === "UNREAD"
                    ? "mt-2 size-2 shrink-0 rounded-full bg-blue-600"
                    : "mt-2 size-2 shrink-0 rounded-full bg-slate-300 dark:bg-slate-700"
                }
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="break-words font-medium text-slate-950 dark:text-slate-50">
                      {item.notification.title}
                    </h3>
                    <p className="mt-1 break-words text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {item.notification.content}
                    </p>
                  </div>
                  <Badge
                    className="max-w-full whitespace-normal break-words text-left leading-4"
                    variant="secondary"
                  >
                    {formatNotificationType(item.notification.type)}
                  </Badge>
                </div>
                <div className="mt-3 flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatNotificationDate(item.deliveredAt, locale)}
                  </p>
                  {item.status === "UNREAD" ? (
                    <Button
                      disabled={isMarkingRead}
                      onClick={() => onMarkRead(item.notification.id)}
                      size="sm"
                      variant="ghost"
                    >
                      <Check className="size-4" />
                      {t("markRead")}
                    </Button>
                  ) : (
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                      {t("statuses.READ")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="sm:hidden">
        <PaginationControls
          nextLabel={t("next")}
          onPageChange={onPageChange}
          page={data.meta.page}
          previousLabel={t("previous")}
          summary={t("countSummary", { count: data.meta.total })}
          totalPages={data.meta.totalPages}
          variant="compact"
        />
      </div>
      <div className="hidden sm:block">
        <PaginationControls
          nextLabel={t("next")}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          page={data.meta.page}
          pageSize={pageSize}
          pageSizeLabel={t("pageSize")}
          previousLabel={t("previous")}
          summary={t("pagination", {
            page: data.meta.page,
            totalPages: data.meta.totalPages,
            total: data.meta.total,
          })}
          totalPages={data.meta.totalPages}
        />
      </div>
    </>
  );
}
