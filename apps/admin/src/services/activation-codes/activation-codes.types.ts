import type { HttpGet, HttpWrite } from "../service.types";
import type { ActivationCodeReport } from "@repo/shared";

export type ActivationCodesHttpClient = {
  get: HttpGet;
  post: HttpWrite;
};

export type ActivationCodeReportService = {
  getReport: (filters?: {
    dateFrom?: string;
    dateTo?: string;
    batchId?: string;
    provinceCode?: string;
  }) => Promise<ActivationCodeReport>;
};
