import type {
  AdminNotificationSummary,
  ListAdminNotificationsQuery,
  ListUserNotificationsQuery,
  NotificationSummary,
  PaginatedResponse,
  UnreadNotificationCount,
  UserNotificationSummary,
} from "@repo/shared";
import { adminHttpClient } from "@/src/lib/admin-http-client";
import type { ApiEnvelope } from "../service.types";
import type {
  PaginatedApiResponse,
  RawAdminNotification,
  RawNotification,
  RawUserNotification,
} from "./notifications.types";

function mapNotification(value: RawNotification): NotificationSummary {
  return {
    id: value.id,
    title: value.title,
    content: value.content,
    type: value.type,
    source: value.source,
    scope: value.scope,
    deliveryStatus: value.delivery_status,
    metadata: value.metadata,
    scheduledAt: value.scheduled_at,
    sentAt: value.sent_at,
    createdById: value.created_by_id,
    createdAt: value.created_at,
    updatedAt: value.updated_at,
  };
}

function mapPage<TInput, TOutput>(
  response: PaginatedApiResponse<TInput>,
  mapItem: (item: TInput) => TOutput,
): PaginatedResponse<TOutput> {
  return {
    items: response.data.map(mapItem),
    meta: {
      page: response.pagination.page,
      limit: response.pagination.limit,
      total: response.pagination.total,
      totalPages: response.pagination.totalPages,
      hasNextPage: response.pagination.hasNext,
      hasPreviousPage: response.pagination.hasPrev,
    },
  };
}

export const notificationsService = {
  async countUnread(): Promise<UnreadNotificationCount> {
    const { data } = await adminHttpClient.get<
      ApiEnvelope<UnreadNotificationCount>
    >("/notifications/unread-count");

    return data.data;
  },

  async listUser(
    query: ListUserNotificationsQuery,
  ): Promise<PaginatedResponse<UserNotificationSummary>> {
    const { data } = await adminHttpClient.get<
      PaginatedApiResponse<RawUserNotification>
    >("/notifications", { params: query });

    return mapPage(data, (item) => ({
      id: item.id,
      status: item.status,
      readAt: item.read_at,
      deliveredAt: item.delivered_at,
      createdAt: item.created_at,
      notification: mapNotification(item.notification),
    }));
  },

  async listAdmin(
    query: ListAdminNotificationsQuery,
  ): Promise<PaginatedResponse<AdminNotificationSummary>> {
    const { data } = await adminHttpClient.get<
      PaginatedApiResponse<RawAdminNotification>
    >("/notifications/admin", { params: query });

    return mapPage(data, (item) => ({
      ...mapNotification(item),
      createdBy: item.created_by
        ? {
            id: item.created_by.id,
            email: item.created_by.email,
            username: item.created_by.username,
            fullName: item.created_by.full_name,
            role: item.created_by.role,
          }
        : null,
      recipientCount: item._count.recipients,
    }));
  },

  async markRead(notificationId: string): Promise<void> {
    await adminHttpClient.patch(`/notifications/${notificationId}/read`);
  },

  async markAllRead(): Promise<void> {
    await adminHttpClient.patch("/notifications/read-all");
  },
};
