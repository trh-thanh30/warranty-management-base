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

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

type ApiPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

type PaginatedApiResponse<T> = ApiResponse<T[]> & {
  pagination: ApiPagination;
};

type RawNotification = {
  id: string;
  title: string;
  content: string;
  type: string;
  source: NotificationSummary["source"];
  scope: NotificationSummary["scope"];
  delivery_status: NotificationSummary["deliveryStatus"];
  metadata: Record<string, unknown> | null;
  scheduled_at: string | null;
  sent_at: string | null;
  created_by_id: string | null;
  created_at: string;
  updated_at: string;
};

type RawUserNotification = {
  id: string;
  status: UserNotificationSummary["status"];
  read_at: string | null;
  delivered_at: string;
  created_at: string;
  notification: RawNotification;
};

type RawAdminNotification = RawNotification & {
  created_by: {
    id: string;
    email: string;
    username: string;
    full_name: string | null;
    role: string;
  } | null;
  _count: { recipients: number };
};

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
      ApiResponse<UnreadNotificationCount>
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
