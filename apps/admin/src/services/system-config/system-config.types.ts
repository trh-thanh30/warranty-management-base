import type { HttpGet, HttpWrite } from "../service.types";

export type ActivationCodePolicy = {
  expiryMonths: number;
  defaultBatchQuantity: number;
  minBatchQuantity: number;
  maxBatchQuantity: number;
};

export type SystemConfigHttpClient = { get: HttpGet; post: HttpWrite };
