import type { CustomerSummary } from "./customer.types.js";
import type { ProductSummary } from "./product.types.js";
import type { ServiceCenterSummary } from "./service-center.types.js";
import type { WarrantySummary } from "./warranty.types.js";

export type WarrantyClaimStatus =
  | "SUBMITTED"
  | "REVIEWING"
  | "APPROVED"
  | "REJECTED"
  | "IN_REPAIR"
  | "COMPLETED"
  | "CANCELLED";

export type WarrantyClaimPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export type WarrantyClaimStatusHistorySummary = {
  id: string;
  fromStatus: WarrantyClaimStatus | null;
  toStatus: WarrantyClaimStatus;
  note: string | null;
  changedByUserId: string | null;
  changedBy: {
    id: string;
    username: string;
    fullName: string | null;
    email: string;
  } | null;
  createdAt: string;
};

export type WarrantyClaimAttachmentSummary = {
  id: string;
  originalName: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  type: string;
  accessType: string;
  uploadedById: string | null;
  createdAt: string;
};

export type WarrantyClaimSummary = {
  id: string;
  claimCode: string;
  warrantyId: string;
  productId: string;
  customerId: string | null;
  warrantyCode: string;
  requesterName: string | null;
  requesterPhone: string | null;
  issueTitle: string;
  issueDetail: string | null;
  status: WarrantyClaimStatus;
  priority: WarrantyClaimPriority;
  dueAt: string | null;
  slaBreachedAt: string | null;
  submittedAt: string;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  product: ProductSummary | null;
  warranty: WarrantySummary | null;
  customer: CustomerSummary | null;
  serviceCenter: ServiceCenterSummary | null;
  statusHistory: WarrantyClaimStatusHistorySummary[];
  attachments: WarrantyClaimAttachmentSummary[];
};

export type PublicWarrantyClaimSummary = Pick<
  WarrantyClaimSummary,
  | "claimCode"
  | "warrantyCode"
  | "issueTitle"
  | "status"
  | "priority"
  | "dueAt"
  | "submittedAt"
  | "resolvedAt"
> & {
  product: Pick<ProductSummary, "name" | "brand" | "model"> | null;
  serviceCenter: Pick<
    ServiceCenterSummary,
    "name" | "phone" | "email" | "province" | "district" | "address"
  > | null;
};
