import type {
  NotificationDeliveryStatus,
  NotificationReadStatus,
} from "@repo/shared";

export type NotificationStatusFilter = "ALL" | NotificationReadStatus;
export type NotificationDeliveryStatusFilter =
  | "ALL"
  | NotificationDeliveryStatus;
export type NotificationCenterTab = "admin" | "mine";
