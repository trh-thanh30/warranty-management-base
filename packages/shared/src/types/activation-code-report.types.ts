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

export type ActivationCodeDetail = {
  id: string;
  maskedCode: string;
  copyCode?: string;
  status: ActivationCodeReportStatus;
  createdAt: string;
  expiresAt: string;
  activatedAt: string | null;
  revokedAt: string | null;
  replacedBy: ActivationCodeHistoryLink | null;
  replaces: ActivationCodeHistoryLink | null;
  productName?: string;
  productSku?: string;
  assignedProduct: ActivationCodeAssignedProduct | null;
};

export type ActivationCodeAssignedProduct = {
  id: string;
  productCode: string;
  displayName: string | null;
  name: string;
  serialNumber: string | null;
};

export type AssignActivationCodesToProductBody = {
  activationCodeId: string;
  productId: string;
};

export type AssignActivationCodesToProductResult = {
  activationCodeId: string;
  product: ActivationCodeAssignedProduct;
};

export type UnassignActivationCodesFromProductBody = {
  activationCodeId: string;
};

export type ActivationCodeHistoryLink = {
  id: string;
  maskedCode: string;
  status: ActivationCodeReportStatus;
};

export type ActivationCodeDetailList = {
  items: ActivationCodeDetail[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};
