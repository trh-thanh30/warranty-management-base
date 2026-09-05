import type {
  ActivationCodeReportStatus,
  ActivationCodeAssignedProduct,
  ActivationCodeDetailList,
  PaginatedResponse,
} from "@repo/shared";

export type ActivationCodeBatchListItem = {
  id: string;
  batchCode: string;
  batchName: string;
  productSku: string;
  productName: string;
  quantity: number;
  assignedCount: number;
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
  batchName?: string;
  sourceProductId?: string;
  quantity?: number;
};

export type CreateActivationCodeBatchResult = {
  id: string;
  batchCode: string;
  batchName: string;
  quantity: number;
  expiresAt: string;
};

export type UpdateActivationCodeBatchResult = {
  id: string;
  batchCode: string;
  batchName: string;
};

export type RevokeActivationCodeBatchResult = {
  batchId: string;
  revokedCount: number;
};

export type ActivationCodeDetailQuery = {
  page?: number;
  limit?: number;
  search?: string;
  status?: ActivationCodeReportStatus;
};

export type AvailableActivationCode = {
  id: string;
  maskedCode: string;
  copyCode?: string;
  batchCode: string;
  productName: string;
  productSku: string;
  expiresAt: string;
  status: ActivationCodeReportStatus;
  selectable: boolean;
  assignedProduct: ActivationCodeAssignedProduct | null;
};

export type AvailableActivationCodeList =
  PaginatedResponse<AvailableActivationCode>;

export type { ActivationCodeDetailList };
