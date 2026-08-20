"use client";

import { Bell, Inbox } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  formatDate,
  type AdminNotificationSummary,
  type PaginatedResponse,
} from "@repo/shared";
import {
  Badge,
  Button,
  Skeleton,
  Table,
  TableScroll,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui";
import { PaginationControls } from "@repo/ui/pagination-controls";
import { StatePanel } from "@/src/components/common/state-panel";
import { formatNotificationType } from "../notifications.utils";

type AdminNotificationListProps = {
  data?: PaginatedResponse<AdminNotificationSummary>;
  hasFilters: boolean;
  isError: boolean;
  isLoading: boolean;
  onClearFilters: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onRetry: () => void;
  pageSize: number;
};

export function AdminNotificationList({
  data,
  hasFilters,
  isError,
  isLoading,
  onClearFilters,
  onPageChange,
  onPageSizeChange,
  onRetry,
  pageSize,
}: AdminNotificationListProps) {
  const t = useTranslations("Notifications");
  const locale = useLocale();

  if (isLoading) {
    return <Skeleton className="h-72 w-full" />;
  }

  if (isError) {
    return (
      <StatePanel
        action={<Button onClick={onRetry}>{t("tryAgain")}</Button>}
        description={t("adminLoadErrorDescription")}
        icon={Bell}
        title={t("adminLoadErrorTitle")}
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
          hasFilters
            ? t("adminEmptyFilteredDescription")
            : t("adminEmptyDescription")
        }
        icon={Inbox}
        title={hasFilters ? t("adminEmptyFilteredTitle") : t("adminEmptyTitle")}
      />
    );
  }

  return (
    <>
      <div className="space-y-3 lg:hidden">
        {data.items.map((item) => (
          <article
            className="rounded-md border border-slate-200 p-4 dark:border-slate-800"
            key={item.id}
          >
            <div className="flex flex-col items-start gap-2 sm:flex-row sm:justify-between sm:gap-3">
              <h3 className="min-w-0 break-words font-medium">{item.title}</h3>
              <DeliveryBadge status={item.deliveryStatus} />
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-slate-500">
              {item.content}
            </p>
            <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <AdminField
                label={t("type")}
                value={formatNotificationType(item.type)}
              />
              <AdminField
                label={t("scope")}
                value={t(`scopes.${item.scope}`)}
              />
              <AdminField
                label={t("recipients")}
                value={String(item.recipientCount)}
              />
              <AdminField
                label={t("createdAt")}
                value={formatDate(item.createdAt, { locale, showTime: true })}
              />
            </dl>
          </article>
        ))}
      </div>

      <TableScroll className="hidden rounded-md border border-slate-200 dark:border-slate-800 lg:block">
        <Table className="min-w-[980px] whitespace-nowrap">
          <TableHeader>
            <TableRow>
              <TableHead>{t("notification")}</TableHead>
              <TableHead>{t("type")}</TableHead>
              <TableHead>{t("source")}</TableHead>
              <TableHead>{t("scope")}</TableHead>
              <TableHead>{t("deliveryStatus")}</TableHead>
              <TableHead>{t("recipients")}</TableHead>
              <TableHead>{t("createdAt")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="max-w-[22rem]">
                    <p className="truncate font-medium">{item.title}</p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {item.content}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className="whitespace-nowrap" variant="secondary">
                    {formatNotificationType(item.type)}
                  </Badge>
                </TableCell>
                <TableCell>{t(`sources.${item.source}`)}</TableCell>
                <TableCell>{t(`scopes.${item.scope}`)}</TableCell>
                <TableCell>
                  <DeliveryBadge status={item.deliveryStatus} />
                </TableCell>
                <TableCell>{item.recipientCount}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatDate(item.createdAt, { locale, showTime: true })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableScroll>

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
          summary={t("adminPagination", {
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

function DeliveryBadge({
  status,
}: {
  status: AdminNotificationSummary["deliveryStatus"];
}) {
  const t = useTranslations("Notifications.deliveryStatuses");

  return (
    <Badge
      className="whitespace-nowrap"
      variant={status === "SENT" ? "success" : "warning"}
    >
      {t(status)}
    </Badge>
  );
}

function AdminField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 truncate">{value}</dd>
    </div>
  );
}
