import type { activation_code_status } from '@prisma/client';

export type ActivationCodeReportFilters = {
  dateFrom?: string;
  dateTo?: string;
  batchId?: string;
  provinceCode?: string;
};

export type ActivationCodeReport = {
  total: number;
  byStatus: Record<activation_code_status, number>;
  byProvince: Array<{
    provinceCode: string;
    provinceName: string;
    total: number;
    byStatus: Partial<Record<activation_code_status, number>>;
  }>;
};

export type ActivationCodeReportQueryResult = {
  total: number;
  byStatus: Array<{ status: activation_code_status; count: number }>;
  byProvince: ActivationCodeReport['byProvince'];
};

export type ActivationCodeReportRow = {
  id: string;
  batchCode: string;
  productSku: string;
  productName: string;
  status: activation_code_status;
  createdAt: Date;
  expiresAt: Date;
  activatedAt: Date | null;
  provinceCode: string | null;
  provinceName: string | null;
  dealerCode: string | null;
  dealerName: string | null;
};
