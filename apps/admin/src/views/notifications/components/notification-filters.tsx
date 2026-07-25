"use client";

import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { NOTIFICATION_TYPES } from "@repo/shared/constants";
import { Button, Input } from "@repo/ui";
import { SelectControl } from "@/src/components/common/select-control";
import type {
  NotificationDeliveryStatusFilter,
  NotificationStatusFilter,
} from "../notifications.types";

type NotificationFiltersProps = {
  deliveryStatus?: NotificationDeliveryStatusFilter;
  onClear: () => void;
  onDeliveryStatusChange?: (value: NotificationDeliveryStatusFilter) => void;
  onSearchChange: (value: string) => void;
  onStatusChange?: (value: NotificationStatusFilter) => void;
  onTypeChange: (value: string) => void;
  search: string;
  status?: NotificationStatusFilter;
  type: string;
};

export function NotificationFilters({
  deliveryStatus,
  onClear,
  onDeliveryStatusChange,
  onSearchChange,
  onStatusChange,
  onTypeChange,
  search,
  status,
  type,
}: NotificationFiltersProps) {
  const t = useTranslations("Notifications");

  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_14rem_14rem_auto]">
      <label className="relative min-w-0">
        <span className="sr-only">{t("searchLabel")}</span>
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          className="pl-9"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t("searchPlaceholder")}
          value={search}
        />
      </label>
      <SelectControl
        aria-label={t("typeFilter")}
        onValueChange={onTypeChange}
        options={[
          { label: t("types.ALL"), value: "" },
          {
            label: t("types.WARRANTY_CLAIM_CREATED"),
            value: NOTIFICATION_TYPES.WARRANTY_CLAIM_CREATED,
          },
          {
            label: t("types.WARRANTY_CLAIM_STATUS_CHANGED"),
            value: NOTIFICATION_TYPES.WARRANTY_CLAIM_STATUS_CHANGED,
          },
          {
            label: t("types.WARRANTY_CLAIM_ASSIGNED_SERVICE_CENTER"),
            value: NOTIFICATION_TYPES.WARRANTY_CLAIM_ASSIGNED_SERVICE_CENTER,
          },
          {
            label: t("types.WARRANTY_CLAIM_SLA_BREACHED"),
            value: NOTIFICATION_TYPES.WARRANTY_CLAIM_SLA_BREACHED,
          },
          {
            label: t("types.WARRANTY_ACTIVATION_REQUEST_CREATED"),
            value: NOTIFICATION_TYPES.WARRANTY_ACTIVATION_REQUEST_CREATED,
          },
          {
            label: t("types.SYSTEM_ALERT"),
            value: NOTIFICATION_TYPES.SYSTEM_ALERT,
          },
          {
            label: t("types.ANNOUNCEMENT"),
            value: NOTIFICATION_TYPES.ANNOUNCEMENT,
          },
        ]}
        value={type}
      />
      {onStatusChange && status ? (
        <SelectControl
          aria-label={t("statusFilter")}
          onValueChange={(value) =>
            onStatusChange(value as NotificationStatusFilter)
          }
          options={[
            { label: t("statuses.ALL"), value: "ALL" },
            { label: t("statuses.UNREAD"), value: "UNREAD" },
            { label: t("statuses.READ"), value: "READ" },
          ]}
          value={status}
        />
      ) : onDeliveryStatusChange && deliveryStatus ? (
        <SelectControl
          aria-label={t("statusFilter")}
          onValueChange={(value) =>
            onDeliveryStatusChange(value as NotificationDeliveryStatusFilter)
          }
          options={[
            { label: t("statuses.ALL"), value: "ALL" },
            { label: t("deliveryStatuses.SENT"), value: "SENT" },
            { label: t("deliveryStatuses.SCHEDULED"), value: "SCHEDULED" },
          ]}
          value={deliveryStatus}
        />
      ) : (
        <span className="hidden lg:block" />
      )}
      <Button onClick={onClear} variant="secondary">
        <X className="size-4" />
        {t("clearFilters")}
      </Button>
    </div>
  );
}
