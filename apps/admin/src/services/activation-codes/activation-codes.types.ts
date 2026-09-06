import type { HttpGet, HttpWrite } from "../service.types";
import type {
  ActivationCodeBatchRevokePreview,
  ActivationCodeReport,
  RevokeActivationCodeBatchRequest,
} from "@repo/shared";
import type {
  ActivationCodeBatchList,
  ActivationCodeBatchListQuery,
  CreateActivationCodeBatchBody,
  CreateActivationCodeBatchResult,
  RevokeActivationCodeBatchResult,
} from "./activation-code-batches.types";

export type ActivationCodesHttpClient = {
  get: HttpGet;
  post: HttpWrite;
  patch: HttpWrite;
};

export type ActivationCodeReportService = {
  getReport: (filters?: {
    dateFrom?: string;
    dateTo?: string;
    batchId?: string;
    provinceCode?: string;
  }) => Promise<ActivationCodeReport>;
};

export type ActivationCodeBatchService = {
  listBatches: (
    query?: ActivationCodeBatchListQuery,
  ) => Promise<ActivationCodeBatchList>;
  createBatch: (
    body: CreateActivationCodeBatchBody,
  ) => Promise<CreateActivationCodeBatchResult>;
  updateBatchName: (
    batchId: string,
    batchName: string,
  ) => Promise<{ id: string; batchCode: string; batchName: string }>;
  getBatchRevokePreview: (
    batchId: string,
  ) => Promise<ActivationCodeBatchRevokePreview>;
  revokeCode: (codeId: string) => Promise<void>;
  revokeBatch: (
    batchId: string,
    body?: RevokeActivationCodeBatchRequest,
  ) => Promise<RevokeActivationCodeBatchResult>;
};
