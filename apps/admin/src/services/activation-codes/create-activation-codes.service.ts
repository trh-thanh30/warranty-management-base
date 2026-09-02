import type {
  ActivationCodeReport,
  ActivationCodePrintJob,
  RequestActivationCodePrintJobQuery,
} from "@repo/shared";
import { unwrap, unwrapBlob } from "../service.utils";
import type {
  ActivationCodeBatchList,
  ActivationCodeBatchListQuery,
  CreateActivationCodeBatchBody,
  CreateActivationCodeBatchResult,
  RevokeActivationCodeBatchResult,
  ActivationCodeDetailList,
  ActivationCodeDetailQuery,
} from "./activation-code-batches.types";
import type { ActivationCodesHttpClient } from "./activation-codes.types";

export function createActivationCodesService(http: ActivationCodesHttpClient) {
  return {
    async requestPrintJob(
      batchId: string,
      query: RequestActivationCodePrintJobQuery = {},
    ): Promise<ActivationCodePrintJob> {
      return unwrap(
        await http.post<ActivationCodePrintJob>(
          `/activation-code-batches/${batchId}/print-jobs`,
          undefined,
          { params: query },
        ),
      );
    },

    async getPrintJob(jobId: string): Promise<ActivationCodePrintJob> {
      return unwrap(
        await http.get<ActivationCodePrintJob>(
          `/activation-code-batches/print-jobs/${jobId}`,
        ),
      );
    },

    async downloadPrintJob(jobId: string): Promise<Blob> {
      return unwrapBlob(
        await http.get<Blob>(
          `/activation-code-batches/print-jobs/${jobId}/download`,
          { responseType: "blob" },
        ),
      );
    },

    async getReport(
      filters: {
        dateFrom?: string;
        dateTo?: string;
        batchId?: string;
        provinceCode?: string;
      } = {},
    ): Promise<ActivationCodeReport> {
      return unwrap(
        await http.get<ActivationCodeReport>(
          "/activation-code-batches/reports/summary",
          { params: filters },
        ),
      );
    },

    async listBatches(
      query: ActivationCodeBatchListQuery = {},
    ): Promise<ActivationCodeBatchList> {
      return unwrap(
        await http.get<ActivationCodeBatchList>("/activation-code-batches", {
          params: query,
        }),
      );
    },

    async listCodes(
      batchId: string,
      query: ActivationCodeDetailQuery = {},
    ): Promise<ActivationCodeDetailList> {
      return unwrap(
        await http.get<ActivationCodeDetailList>(
          `/activation-code-batches/${batchId}/codes`,
          { params: query },
        ),
      );
    },

    async createBatch(body: CreateActivationCodeBatchBody) {
      return unwrap(
        await http.post<CreateActivationCodeBatchResult>(
          "/activation-code-batches",
          body,
        ),
      );
    },

    async revokeCode(codeId: string): Promise<void> {
      await http.post(`/activation-code-batches/codes/${codeId}/revoke`);
    },

    async revokeBatch(
      batchId: string,
    ): Promise<RevokeActivationCodeBatchResult> {
      return unwrap(
        await http.post<RevokeActivationCodeBatchResult>(
          `/activation-code-batches/${batchId}/revoke`,
        ),
      );
    },
  };
}
