import type {
  ActivationCodeReportStatus,
  PaginatedResponse,
} from "@repo/shared";

export type ActivationCodeBatchListItem = {
  id: string;
  batchCode: string;
  productSku: string;
  productName: string;
  quantity: number;
  expiresAt: string;
  createdAt: string;
  statusCounts: Partial<Record<ActivationCodeReportStatus, number>>;
};

export type ActivationCodeBatchList =
  PaginatedResponse<ActivationCodeBatchListItem>;

export type ActivationCodeBatchListQuery = {
  page?: number;
  limit?: number;
  search?: string;
  status?: ActivationCodeReportStatus;
};

export type CreateActivationCodeBatchBody = {
  sourceProductId: string;
  quantity?: number;
};

export type CreateActivationCodeBatchResult = {
  id: string;
  batchCode: string;
  quantity: number;
  expiresAt: string;
};

export type RevokeActivationCodeBatchResult = {
  batchId: string;
  revokedCount: number;
};
