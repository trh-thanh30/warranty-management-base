"use client";

import { useState } from "react";
import { useDebounce } from "@repo/hooks";
import { useTranslations } from "next-intl";
import { useAuth } from "@/src/app/providers/auth-provider";
import {
  useAdminNotifications,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useUserNotifications,
} from "@/src/hooks/use-notifications";
import { usePermissions } from "@/src/hooks/use-permissions";
import { useTableControls } from "@/src/hooks/use-table-controls";
import { useToast } from "@/src/hooks/use-toast";
import type {
  NotificationCenterTab,
  NotificationStatusFilter,
} from "../notifications.types";

const PAGE_SIZE = 10;
type UserNotificationFilters = {
  status: NotificationStatusFilter;
  type: string;
};

const USER_FILTERS: UserNotificationFilters = { status: "ALL", type: "" };
const ADMIN_FILTERS = { type: "" };

export function useNotificationsDirectory() {
  const t = useTranslations("Notifications");
  const toast = useToast();
  const { user } = useAuth();
  const { role } = usePermissions();
  const canViewAdmin = role === "admin" || role === "moderator";
  const [tab, setTab] = useState<NotificationCenterTab>("mine");
  const userControls = useTableControls({
    initialFilters: USER_FILTERS,
    initialPageSize: PAGE_SIZE,
  });
  const adminControls = useTableControls({
    initialFilters: ADMIN_FILTERS,
    initialPageSize: PAGE_SIZE,
  });
  const userSearch = useDebounce(userControls.search.trim(), 300);
  const adminSearch = useDebounce(adminControls.search.trim(), 300);
  const userQuery = useUserNotifications(
    {
      page: userControls.page,
      limit: userControls.pageSize,
      q: userSearch || undefined,
      type: userControls.filters.type.trim() || undefined,
      status:
        userControls.filters.status === "ALL"
          ? undefined
          : userControls.filters.status,
    },
    { enabled: Boolean(user) && tab === "mine" },
  );
  const adminQuery = useAdminNotifications(
    {
      page: adminControls.page,
      limit: adminControls.pageSize,
      q: adminSearch || undefined,
      type: adminControls.filters.type.trim() || undefined,
    },
    { enabled: Boolean(user) && canViewAdmin && tab === "admin" },
  );
  const markReadMutation = useMarkNotificationRead();
  const markAllMutation = useMarkAllNotificationsRead();

  async function markRead(notificationId: string) {
    try {
      await markReadMutation.mutateAsync(notificationId);
      toast.success(t("markedRead"));
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

  function clearUserFilters() {
    userControls.setSearch("");
    userControls.setFilters(USER_FILTERS);
  }

  function clearAdminFilters() {
    adminControls.setSearch("");
    adminControls.setFilters(ADMIN_FILTERS);
  }

  return {
    adminControls,
    adminQuery,
    canViewAdmin,
    clearAdminFilters,
    clearUserFilters,
    isMarkingAll: markAllMutation.isPending,
    isMarkingRead: markReadMutation.isPending,
    markAllRead,
    markRead,
    setTab,
    tab,
    userControls,
    userQuery,
  };
}
