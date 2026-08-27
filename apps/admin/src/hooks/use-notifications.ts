"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type {
  AdminNotificationSummary,
  ListAdminNotificationsQuery,
  ListUserNotificationsQuery,
  PaginatedResponse,
  UnreadNotificationCount,
  UserNotificationSummary,
} from "@repo/shared";
import { notificationsService } from "@/src/services/notifications/notifications.service";

export const notificationKeys = {
  all: ["notifications"] as const,
  adminList: (query: ListAdminNotificationsQuery) =>
    [...notificationKeys.all, "admin", query] as const,
  unread: () => [...notificationKeys.all, "unread"] as const,
  userList: (query: ListUserNotificationsQuery) =>
    [...notificationKeys.all, "user", query] as const,
};

const UNREAD_NOTIFICATION_POLL_INTERVAL_MS = 30_000;
const UNREAD_NOTIFICATION_ERROR_INTERVAL_MS = 120_000;

export function useUnreadNotificationCount(
  options?: Pick<UseQueryOptions<UnreadNotificationCount>, "enabled">,
) {
  return useQuery({
    ...options,
    queryKey: notificationKeys.unread(),
    queryFn: () => notificationsService.countUnread(),
    // Keep the badge fresh for active tabs without generating background traffic.
    refetchInterval: (query) =>
      query.state.status === "error" || query.state.fetchFailureCount > 0
        ? UNREAD_NOTIFICATION_ERROR_INTERVAL_MS
        : UNREAD_NOTIFICATION_POLL_INTERVAL_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1_000 * 2 ** attemptIndex, 10_000),
    staleTime: 15_000,
  });
}

export function useUserNotifications(
  query: ListUserNotificationsQuery,
  options?: Pick<
    UseQueryOptions<PaginatedResponse<UserNotificationSummary>>,
    "enabled"
  >,
) {
  return useQuery({
    ...options,
    queryKey: notificationKeys.userList(query),
    queryFn: () => notificationsService.listUser(query),
    placeholderData: keepPreviousData,
  });
}

export function useAdminNotifications(
  query: ListAdminNotificationsQuery,
  options?: Pick<
    UseQueryOptions<PaginatedResponse<AdminNotificationSummary>>,
    "enabled"
  >,
) {
  return useQuery({
    ...options,
    queryKey: notificationKeys.adminList(query),
    queryFn: () => notificationsService.listAdmin(query),
    placeholderData: keepPreviousData,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationsService.markRead(notificationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsService.markAllRead(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
