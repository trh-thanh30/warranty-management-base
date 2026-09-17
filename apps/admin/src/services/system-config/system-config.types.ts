import type { HttpGet, HttpWrite } from "../service.types";
import type { ContactNotificationSettings } from "@repo/shared";

export type { ContactNotificationSettings };

export type ActivationCodePolicy = {
  expiryMonths: number;
  defaultBatchQuantity: number;
  minBatchQuantity: number;
  maxBatchQuantity: number;
};

export type SystemConfigHttpClient = { get: HttpGet; post: HttpWrite };
