export type ActivationCodeReportStatus =
  | "AVAILABLE"
  | "PENDING_APPROVAL"
  | "ACTIVATED"
  | "EXPIRED"
  | "REVOKED"
  | "REPLACED";

export type ActivationCodeReport = {
  total: number;
  byStatus: Record<ActivationCodeReportStatus, number>;
  byProvince: Array<{
    provinceCode: string;
    provinceName: string;
    total: number;
    byStatus: Partial<Record<ActivationCodeReportStatus, number>>;
  }>;
};

export type ActivationCodeReportFilters = {
  dateFrom?: string;
  dateTo?: string;
  batchId?: string;
  provinceCode?: string;
};
