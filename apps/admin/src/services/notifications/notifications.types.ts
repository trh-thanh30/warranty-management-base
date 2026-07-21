import type {
  NotificationSummary,
  UserNotificationSummary,
} from "@repo/shared";
import type { ApiEnvelope } from "../service.types";

export type ApiPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type PaginatedApiResponse<T> = ApiEnvelope<T[]> & {
  pagination: ApiPagination;
};

export type RawNotification = {
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

export type RawUserNotification = {
  id: string;
  status: UserNotificationSummary["status"];
  read_at: string | null;
  delivered_at: string;
  created_at: string;
  notification: RawNotification;
};

export type RawAdminNotification = RawNotification & {
  created_by: {
    id: string;
    email: string;
    username: string;
    full_name: string | null;
    role: string;
  } | null;
  _count: { recipients: number };
};
