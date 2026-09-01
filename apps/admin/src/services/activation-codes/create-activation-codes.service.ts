import type {
  ActivationCodeReport,
  ActivationCodePrintJob,
  RequestActivationCodePrintJobQuery,
} from "@repo/shared";
import { unwrap, unwrapBlob } from "../service.utils";
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
  };
}
