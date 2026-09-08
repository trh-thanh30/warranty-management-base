import type {
  ActivationCodeReport,
  ActivationCodeBatchRevokePreview,
  ActivationCodePrintJob,
  AssignActivationCodesToProductBody,
  AssignActivationCodesToProductResult,
  ReplaceProductActivationCodeAssignmentBody,
  ReplaceProductActivationCodeAssignmentResult,
  UnassignActivationCodesFromProductBody,
  RequestActivationCodePrintJobQuery,
  RevokeActivationCodeBatchRequest,
} from "@repo/shared";
import { unwrap, unwrapBlob } from "../service.utils";
import type {
  ActivationCodeBatchList,
  ActivationCodeBatchListQuery,
  CreateActivationCodeBatchBody,
  CreateActivationCodeBatchResult,
  RevokeActivationCodeBatchResult,
  UpdateActivationCodeBatchResult,
  ActivationCodeDetailList,
  ActivationCodeDetailQuery,
  AvailableActivationCodeList,
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

    async listCodesByProduct(
      productId: string,
      query: ActivationCodeDetailQuery = {},
    ): Promise<ActivationCodeDetailList> {
      return unwrap(
        await http.get<ActivationCodeDetailList>(
          `/activation-code-batches/codes/product/${productId}`,
          { params: query },
        ),
      );
    },

    async listAvailableByProduct(
      productId?: string,
      query: {
        batchId?: string;
        page?: number;
        limit?: number;
        search?: string;
        assignment?: "ALL" | "ASSIGNED" | "UNASSIGNED";
      } = {},
    ): Promise<AvailableActivationCodeList> {
      return unwrap(
        await http.get<AvailableActivationCodeList>(
          "/activation-code-batches/available",
          {
            params: { ...query, ...(productId ? { productId } : {}) },
          },
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

    async updateBatchName(batchId: string, batchName: string) {
      return unwrap(
        await http.patch<UpdateActivationCodeBatchResult>(
          `/activation-code-batches/${batchId}`,
          { batchName },
        ),
      );
    },

    async getBatchRevokePreview(
      batchId: string,
    ): Promise<ActivationCodeBatchRevokePreview> {
      return unwrap(
        await http.get<ActivationCodeBatchRevokePreview>(
          `/activation-code-batches/${batchId}/revoke-preview`,
        ),
      );
    },

    async revokeCode(codeId: string): Promise<void> {
      await http.post(`/activation-code-batches/codes/${codeId}/revoke`);
    },

    async assignProduct(
      body: AssignActivationCodesToProductBody,
    ): Promise<AssignActivationCodesToProductResult> {
      return unwrap(
        await http.post<AssignActivationCodesToProductResult>(
          "/activation-code-batches/codes/assign-product",
          body,
        ),
      );
    },

    async unassignProduct(
      body: UnassignActivationCodesFromProductBody,
    ): Promise<{ activationCodeId: string }> {
      return unwrap(
        await http.post(
          "/activation-code-batches/codes/unassign-product",
          body,
        ),
      );
    },

    async replaceProductAssignment(
      body: ReplaceProductActivationCodeAssignmentBody,
    ): Promise<ReplaceProductActivationCodeAssignmentResult> {
      return unwrap(
        await http.post<ReplaceProductActivationCodeAssignmentResult>(
          "/activation-code-batches/codes/replace-product-assignment",
          body,
        ),
      );
    },

    async replaceCode(codeId: string, replacementCode: string): Promise<void> {
      await http.post(`/activation-code-batches/codes/${codeId}/replace`, {
        replacementCode,
      });
    },

    async revokeBatch(
      batchId: string,
      body: RevokeActivationCodeBatchRequest = {},
    ): Promise<RevokeActivationCodeBatchResult> {
      return unwrap(
        await http.post<RevokeActivationCodeBatchResult>(
          `/activation-code-batches/${batchId}/revoke`,
          body,
        ),
      );
    },
  };
}
