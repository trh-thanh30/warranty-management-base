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
  batchCode: string;
  batchName: string;
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

type AssignActivationCodesToProductBase = {
  productId: string;
};

export type AssignActivationCodesToProductBody =
  | (AssignActivationCodesToProductBase & {
      activationCodeIds: string[];
      assignmentMode?: "SELECTED";
    })
  | (AssignActivationCodesToProductBase & {
      assignmentMode: "ALL_AVAILABLE";
      batchId: string;
    })
  | (AssignActivationCodesToProductBase & {
      assignmentMode: "QUANTITY";
      batchIds?: string[];
      quantity: number;
    });

export type AssignActivationCodesToProductResult = {
  activationCodeIds: string[];
  product: ActivationCodeAssignedProduct;
};

export type ReplaceProductActivationCodeAssignmentBody = {
  currentActivationCodeId: string;
  replacementActivationCodeId: string;
  productId: string;
};

export type ReplaceProductActivationCodeAssignmentResult = {
  activationCodeId: string;
  previousActivationCodeId: string;
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
