import type { PaginationQuery } from "./pagination.types.ts";

export type NotificationReadStatus = "READ" | "UNREAD";
export type NotificationSource = "ADMIN" | "SYSTEM";
export type NotificationScope = "ALL" | "ROLE" | "USER";
export type NotificationDeliveryStatus = "SCHEDULED" | "SENT";

export type NotificationSummary = {
  id: string;
  title: string;
  content: string;
  type: string;
  source: NotificationSource;
  scope: NotificationScope;
  deliveryStatus: NotificationDeliveryStatus;
  metadata: Record<string, unknown> | null;
  scheduledAt: string | null;
  sentAt: string | null;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UserNotificationSummary = {
  id: string;
  status: NotificationReadStatus;
  readAt: string | null;
  deliveredAt: string;
  createdAt: string;
  notification: NotificationSummary;
};

export type NotificationCreatorSummary = {
  id: string;
  email: string;
  username: string;
  fullName: string | null;
  role: string;
};

export type AdminNotificationSummary = NotificationSummary & {
  createdBy: NotificationCreatorSummary | null;
  recipientCount: number;
};

export type ListUserNotificationsQuery = PaginationQuery & {
  q?: string;
  type?: string;
  status?: NotificationReadStatus;
};

export type ListAdminNotificationsQuery = PaginationQuery & {
  q?: string;
  type?: string;
  source?: NotificationSource;
  scope?: NotificationScope;
  deliveryStatus?: NotificationDeliveryStatus;
};

export type UnreadNotificationCount = {
  contactSubmissions: number;
  unread: number;
  warranties: number;
  warrantyClaims: number;
};
